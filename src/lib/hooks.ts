import { ref, watchEffect, type UnwrapRef, type Ref } from "vue";

export function cachedRef<T>(key: string, initial: T): Ref<UnwrapRef<T>> {
  const state = ref<T>(initial);
  state.value = storageGetObject<T>(key, initial) as UnwrapRef<T>;

  watchEffect(() => {
    localStorage?.setItem(key, JSON.stringify(state.value));
  });
  return state;
}

const storageGetObject = <T>(key: string, initial: T): T => {
  try {
    const str = localStorage?.getItem(key);
    if (!str) return initial;
    return JSON.parse(str);
  } catch (e) {
    return initial;
  }
};

export type Chat = {
  instruction: string;
  response: string;
};

// export const chatRef = () => ref<Chat[]>([]);
export const chatRef = () => cachedRef<Chat[]>("conversation", []);
