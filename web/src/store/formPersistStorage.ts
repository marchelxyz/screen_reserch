import type { StateStorage } from "zustand/middleware";

const DEBOUNCE_MS = 350;

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Обёртка над localStorage с отложенной записью: снимает пики синхронной
 * сериализации при каждом ответе в длинной анкете. Перед чтением и при
 * уходе со страницы отложенное значение сбрасывается на диск.
 */
function createDebouncedLocalStorage(): StateStorage {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { name: string; value: string } | null = null;

  const flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending !== null) {
      try {
        localStorage.setItem(pending.name, pending.value);
      } catch {
        /* квота / приватный режим */
      }
      pending = null;
    }
  };

  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
    }
  });

  return {
    getItem: (name) => {
      flush();
      return localStorage.getItem(name);
    },
    setItem: (name, value) => {
      pending = { name, value };
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(flush, DEBOUNCE_MS);
    },
    removeItem: (name) => {
      pending = null;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      localStorage.removeItem(name);
    },
  };
}

let clientSingleton: StateStorage | null = null;

export function getFormPersistStateStorage(): StateStorage {
  if (typeof window === "undefined") {
    return serverStorage;
  }
  clientSingleton ??= createDebouncedLocalStorage();
  return clientSingleton;
}
