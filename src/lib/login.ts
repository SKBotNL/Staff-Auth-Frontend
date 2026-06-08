import type { TranslationKey } from "../contexts/I18nContext";
import { type ApiError, AppError } from "../types/api";
import type { LoginData, LoginStage } from "../types/login";
import { BASE_URL, isApiError } from "./api";

export const loginApi = {
  loginData: async (loginChallenge: string): Promise<LoginData> => {
    const url = new URL("/login/data", BASE_URL);
    url.searchParams.set("login_challenge", loginChallenge);
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
    return await response.json();
  },

  credentials: async (
    credentials: {
      username: string;
      password: string;
    },
    loginChallenge: string,
  ) => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/login/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credentials,
          loginChallenge,
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

  minecraftCheck: async (loginChallenge: string): Promise<boolean> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/login/minecraftcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginChallenge }),
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

  /**
   * @returns redirect URL
   */
  totp: async (
    code: string,
    rememberMe: boolean,
    loginChallenge: string,
  ): Promise<string> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/login/totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          rememberMe,
          loginChallenge,
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
    return await response.text();
  },
};

const fatal = ["INVALID_LOGIN_CHALLENGE", "LOGIN_REQUEST_USED"];

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
    case "INCORRECT_USERNAME_OR_PASSWORD":
      return "login.credentials.error.incorrectUsernameOrPassword";
    case "MINECRAFT_CHECK_TIMEOUT":
      return "minecraftCheck.error.timeout";
    case "MINECRAFT_CHECK_UNAVAILABLE":
      return "minecraftCheck.error.unavailable";
    case "INCORRECT_TOTP_CODE":
      return "totp.error.invalidCode";
    case "INVALID_LOGIN_CHALLENGE":
      return "login.error.invalidChallenge";
    case "LOGIN_REQUEST_USED":
      return "login.error.challengeUsed";
    default:
      return "error.unknownError";
  }
}

export function getStage(stage: string): LoginStage {
  switch (stage) {
    case "CREDENTIALS":
      return { type: "credentials" };
    case "MINECRAFT_CHECK":
      return { type: "minecraftCheck" };
    case "TOTP":
      return { type: "totp" };
    case "ACCEPT":
      throw new AppError("fatal", "login.error.challengeUsed", null);
    default:
      throw new AppError("fatal", "error.unknownError", null);
  }
}
