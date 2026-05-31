import { t } from "../lib/i18n";
import { type ApiError, AppError } from "../types/api";
import type { SetupStage, TotpData } from "../types/setup";
import { BASE_URL, isApiError } from "./api";

export const setupApi = {
  currentStage: async (token: string): Promise<SetupStage> => {
    const url = new URL("/setup/currentStage", BASE_URL);
    url.searchParams.set("token", token);
    const response = await fetch(url);

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    const stage = getStage(await response.text());
    if (stage instanceof AppError) throw stage;
    return stage;
  },

  details: async (
    details: { email: string; password: string },
    token: string,
  ) => {
    const response = await fetch(`${BASE_URL}/setup/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...details,
        token: token,
      }),
    });

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
  },

  minecraftCheck: async (token: string): Promise<boolean> => {
    const response = await fetch(`${BASE_URL}/setup/minecraftcheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    return (await response.text()) === "true";
  },

  totpSetup: async (token: string): Promise<TotpData> => {
    const response = await fetch(`${BASE_URL}/setup/totpsetup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    return await response.json();
  },

  totpVerify: async (code: string, token: string) => {
    const response = await fetch(`${BASE_URL}/setup/totpverify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, token: token }),
    });

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
  },
};

const fatal = ["INVALID_INVITE", "DEACTIVATED"];

function toAppError(err: unknown): AppError {
  if (isApiError(err)) {
    return new AppError(
      fatal.includes(err.message) ? "fatal" : "local",
      getApiErrorMessage(err),
      err.status,
    );
  }
  return new AppError("fatal", "error.unknownError", null);
}

function getApiErrorMessage(err: ApiError): string {
  if (err.status === 429) {
    return t("error.tooManyRequests");
  }
  switch (err.message) {
    case "MINECRAFT_CHECK_TIMEOUT":
      return t("minecraftCheck.error.timeout");
    case "MINECRAFT_CHECK_UNAVAILABLE":
      return t("minecraftCheck.error.unavailable");
    case "INCORRECT_TOTP_CODE":
      return t("totp.error.invalidCode");
    case "INVALID_INVITE":
      return t("setup.error.invalidToken");
    case "DEACTIVATED":
      return t("setup.error.deactivated");
    default:
      return t("error.unknownError");
  }
}

function getStage(stage: string): SetupStage {
  switch (stage) {
    case "DETAILS":
      return { type: "details" };
    case "MINECRAFT_CHECK":
      return { type: "minecraftCheck" };
    case "TOTP":
      return { type: "totp" };
    case "TOTP_VERIFY":
      return { type: "totpVerify" };
    case "FINALIZE":
      throw new AppError("fatal", t("setup.error.finalized"), null);
    default:
      throw new AppError("fatal", t("error.unknownError"), null);
  }
}
