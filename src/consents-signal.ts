/**
 * The consents gate, client side.
 *
 * A Guards rule on the service blocks every request from a user who has not
 * accepted the current Terms of Service and Privacy Policy, answering `451`.
 * This module is the whole detection logic: one flag, and one `fetch`
 * interceptor that raises it.
 *
 * Nothing here knows which versions are current — the server decides what is
 * being accepted, so bumping the versions in the Guards rule needs no change
 * and no redeploy on this side.
 */

import { getToken } from '@restheart-cloud/kit-react';
import { environment } from './environments/environment';

/**
 * A collection your service actually has — change it.
 *
 * It has to be a *data* path: every call the kit makes goes to `/auth/*`,
 * `/token` or `/users/me`, and those are exactly the paths the rule excludes,
 * so none of them can ever come back 451.
 */
const PROBE_PATH = '/demo';

type Listener = (blocked: boolean) => void;

let blocked = false;
const listeners = new Set<Listener>();

export function isBlocked(): boolean {
  return blocked;
}

export function setBlocked(next: boolean): void {
  if (blocked === next) return;
  blocked = next;
  listeners.forEach(l => l(next));
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Flags every 451 the API returns, from any request the app makes. */
export function installConsentsInterceptor(): void {
  const original = window.fetch;
  window.fetch = async (...args) => {
    const res = await original(...args);
    if (res.status === 451) setBlocked(true);
    return res;
  };
}

/**
 * One data request, so a blocked user is told so on arrival rather than
 * whenever the app happens to need data.
 *
 * The response is thrown away — the interceptor above already saw the status.
 * The token has to be attached by hand: `rhAuthInterceptor` only clears the
 * session on 401, it does not authenticate outgoing requests.
 *
 * Drop this once the app has data requests of its own on the first screen —
 * any one of them raises the flag just as well.
 */
export async function probeConsents(): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${environment.apiUrl}${PROBE_PATH}?pagesize=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Suppress the browser's native Basic Auth popup on a 401.
        'No-Auth-Challenge': 'true',
      },
    });
  } catch {
    // Network error — nothing to gate on.
  }
}
