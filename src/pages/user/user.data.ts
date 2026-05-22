import { query } from "@solidjs/router";
import { userApi } from "../../lib/user";

export const getUser = query(
  async (id: string) => await userApi.get(id),
  "user",
);

export function preloadUser({ params }: { params: { id: string } }) {
  getUser(params.id);
}
