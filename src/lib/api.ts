import { ApiError, AppError, MeData } from "../types/api";
import { t } from "../lib/i18n";

export const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error("VITE_API_URL not set");

export const LOGIN_URL = `${BASE_URL}/oauth/login/staffauth`;

export const api = {
  me: async (): Promise<MeData> => {
    const response = await fetch(`${BASE_URL}/me`, { credentials: "include" });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = LOGIN_URL;
      }
      throw toAppError({
        status: response.status,
        message: await response.text(),
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

function getApiErrorMessage(err: ApiError): string {
  if (err.status === 429) {
    return t("error.tooManyRequests");
  }
  switch (err.message) {
    default:
      return t("error.unknownError");
  }
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  );
}
