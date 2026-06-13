import type { TranslationKey } from "../contexts/I18nContext";
import {
  type ApiError,
  AppError,
  ErrorData,
  type MeData,
  NeedToLoginError,
} from "../types/api";

export const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error("VITE_API_URL not set");

export const LOGIN_URL = `${BASE_URL}/oauth/login/staffauth`;

export const api = {
  me: async (): Promise<MeData> => {
    const response = await fetch(`${BASE_URL}/me`, { credentials: "include" });

    if (!response.ok) {
      if (response.status === 401) {
        throw new NeedToLoginError();
      }

      throw toAppError({
        status: response.status,
        errorData: (await response.json()) as ErrorData,
      });
    }
    return await response.json();
  },
};

function toAppError(err: unknown): AppError {
  if (isApiError(err)) {
    throw new AppError("fatal", getApiErrorMessage(err), err.status);
  }
  throw new AppError("fatal", "error.unknownError", null);
}

function getApiErrorMessage(err: ApiError): TranslationKey {
  if (err.status === 429) {
    return "error.tooManyRequests";
  }
  switch (err.errorData.message) {
    default:
      return "error.unknownError";
  }
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "errorData" in err
  );
}
