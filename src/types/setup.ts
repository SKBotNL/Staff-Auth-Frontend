export type SetupStage =
  | { type: "loading" }
  | { type: "details" }
  | { type: "minecraftCheck" }
  | { type: "totp" }
  | { type: "totpVerify" };

export type TotpData = {
  secret: string;
  qrCode: string;
};
