export type LoginData = {
  skip: boolean;
  redirectUri?: string;
  currentStage?: string;
};

export type LoginStage =
  | { type: "loading" }
  | { type: "credentials" }
  | { type: "minecraftCheck" }
  | { type: "totp" };
