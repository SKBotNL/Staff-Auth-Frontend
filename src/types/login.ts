export type LoginData = {
  skip: boolean;
  redirectUrl?: string;
  currentStage?: string;
};

export type LoginStage =
  | { type: "loading" }
  | { type: "credentials" }
  | { type: "minecraftCheck" }
  | { type: "totp" };
