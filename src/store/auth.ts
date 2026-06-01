import { createSignal } from "solid-js";
import { api } from "../lib/api";
import type { MeData } from "../types/api";

const [user, setUser] = createSignal<MeData | null>(null);
const [error, setError] = createSignal<Error | null>(null);
let loaded = false;

export function useUser() {
  if (!loaded) {
    api
      .me()
      .then(setUser)
      .catch((e) => setError(e));
    loaded = true;
  }
  return { user, error };
}
