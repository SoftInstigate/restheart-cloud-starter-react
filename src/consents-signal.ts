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

/**
 * Flags every 451 the API returns, from any call that goes through the kit —
 * `auth.api` included, which is how the probe below is seen.
 *
 * Passed to `RhAuthProvider` as `config.transport`. React has no interceptor
 * slot, and this is the seam that replaces one: a declared dependency rather
 * than a patched global, so nothing else in the page changes behaviour because
 * this app was loaded.
 */
export const consentsTransport = async (url: string, init?: RequestInit): Promise<Response> => {
  const res = await fetch(url, init);
  if (res.status === 451) setBlocked(true);
  return res;
};

/**
 * One data request, so a blocked user is told so on arrival rather than
 * whenever the app happens to need data.
 *
 * Pass `auth.api` — it applies the session on the way out, which is what makes
 * this a request the rule can evaluate rather than an anonymous `401`. The
 * outcome is ignored on purpose: the interceptor above already saw the status,
 * and nothing here needs to know what came back.
 *
 * Drop this once the app has data requests of its own on the first screen —
 * any one of them raises the flag just as well.
 */
export async function probeConsents(
  api: (path: string, init?: RequestInit) => Promise<Response>
): Promise<void> {
  try {
    await api(`${PROBE_PATH}?pagesize=1`);
  } catch {
    // Any non-2xx throws, 451 included — already flagged by the interceptor.
  }
}
