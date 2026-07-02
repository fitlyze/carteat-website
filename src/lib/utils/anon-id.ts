const KEY = 'anon_id';

/**
 * Anonymous identity for rating dedupe (plan §7): a random UUID in localStorage.
 * No fingerprinting. Client-only.
 */
export function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
