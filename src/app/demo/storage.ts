import { useSyncExternalStore } from 'react';

// Local demonstration storage only. Never sent to the production API.
const EVENT = 'han-spoon-demo-change';
const memory = new Map<string, string>();
function readRaw(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(`han-spoon-demo:${key}`) ?? ''; }
  catch { return ''; }
}
function deserialize<T>(raw: string, fallback: T): T {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (value === null || (Array.isArray(fallback) && !Array.isArray(value))) return fallback;
    return value;
  } catch { return fallback; }
}
export function readDemo<T>(key: string, fallback: T): T {
  return deserialize(readRaw(key), fallback);
}
export function writeDemo<T>(key: string, value: T) {
  const serialized = JSON.stringify(value);
  try {
    localStorage.setItem(`han-spoon-demo:${key}`, serialized);
    memory.delete(key);
  } catch {
    memory.set(key, serialized);
  }
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
export function useDemoValue<T>(
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key));
  const value = deserialize(raw, fallback);
  return [value, (next) => writeDemo(key, next)];
}
