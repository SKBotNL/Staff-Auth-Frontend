export type LoginStage =
  | { type: "loading" }
  | { type: "credentials" }
  | { type: "minecraftCheck" }
  | { type: "totp" };
