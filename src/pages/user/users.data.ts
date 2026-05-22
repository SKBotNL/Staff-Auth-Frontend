import { query } from "@solidjs/router";
import { userApi } from "../../lib/user";

export const getUsers = query(async () => await userApi.getAll(), "users");

export function preloadUsers() {
  getUsers();
}
