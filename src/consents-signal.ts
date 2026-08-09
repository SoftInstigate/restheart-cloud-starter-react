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
