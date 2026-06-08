import type { TranslationKey } from "../contexts/I18nContext";
import { type ApiError, AppError } from "../types/api";
import type { SetupStage, TotpData } from "../types/setup";
import { BASE_URL, isApiError } from "./api";

export const setupApi = {
  currentStage: async (token: string): Promise<SetupStage> => {
    const url = new URL("/setup/currentStage", BASE_URL);
    url.searchParams.set("token", token);
    let response: Response;
    try {
      response = await fetch(url);
    } catch (err) {
      throw toAppError(err);
    }

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
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/setup/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          token,
        }),
      });
    } catch (err) {
      throw toAppError(err);
    }

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
  },

  minecraftCheck: async (token: string): Promise<boolean> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/setup/minecraftcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      throw toAppError(err);
    }

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    return (await response.text()) === "true";
  },

  totpSetup: async (token: string): Promise<TotpData> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/setup/totpsetup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      throw toAppError(err);
    }

    if (!response.ok)
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    return await response.json();
  },

  totpVerify: async (code: string, token: string) => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/setup/totpverify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, token }),
      });
    } catch (err) {
      throw toAppError(err);
    }

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
  if (err instanceof TypeError) {
    if (err.message.startsWith("NetworkError")) {
      throw new AppError("local", "error.networkError", null);
    }
  }
  return new AppError("fatal", "error.unknownError", null);
}

function getApiErrorMessage(err: ApiError): TranslationKey {
  if (err.status === 429) {
    return "error.tooManyRequests";
  }
  switch (err.message) {
    case "MINECRAFT_CHECK_TIMEOUT":
      return "minecraftCheck.error.timeout";
    case "MINECRAFT_CHECK_UNAVAILABLE":
      return "minecraftCheck.error.unavailable";
    case "INCORRECT_TOTP_CODE":
      return "totp.error.invalidCode";
    case "INVALID_INVITE":
      return "setup.error.invalidToken";
    case "DEACTIVATED":
      return "setup.error.deactivated";
    default:
      return "error.unknownError";
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
      throw new AppError("fatal", "setup.error.finalized", null);
    default:
      throw new AppError("fatal", "error.unknownError", null);
  }
}
