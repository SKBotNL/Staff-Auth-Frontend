import { query } from "@solidjs/router";
import { inviteApi } from "../lib/invite";

export const getInvites = query(
  async () => await inviteApi.getAll(),
  "invites",
);

export function preloadInvites() {
  getInvites();
}
