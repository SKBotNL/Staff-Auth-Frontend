import { createResource } from "solid-js";
import { api } from "../lib/api";
import type { MeData } from "../types/api";

const [user, { refetch }] = createResource<MeData>(() => api.me());

export function useUser() {
  return { user, refetch };
}
