/**
 * localStorage helpers that never throw: storage can be unavailable (private
 * windows, blocked site data) or full, and the app must still work without it.
 */
export const readJson = <T>(key: string): T | undefined => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
};

export const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or access errors: the value just isn't persisted.
  }
};

export const removeKey = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignored, see writeJson.
  }
};
