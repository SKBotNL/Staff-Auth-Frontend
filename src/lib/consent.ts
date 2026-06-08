import type { TranslationKey } from "../contexts/I18nContext";
import { type ApiError, AppError } from "../types/api";
import type { ConsentData } from "../types/consent";
import { BASE_URL, isApiError } from "./api";

export const consentApi = {
  consentData: async (consentChallenge: string): Promise<ConsentData> => {
    const url = new URL("/consent", BASE_URL);
    url.searchParams.set("consent_challenge", consentChallenge);
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

  /**
   * @returns redirect URL
   */
  consent: async (
    consent: boolean,
    consentChallenge: string,
  ): Promise<string> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent,
          consentChallenge,
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

const fatal = ["INVALID_CONSENT_CHALLENGE", "CONSENT_REQUEST_USED"];

function toAppError(err: unknown): AppError {
  if (isApiError(err)) {
    throw new AppError(
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
  throw new AppError("fatal", "error.unknownError", null);
}

function getApiErrorMessage(err: ApiError): TranslationKey {
  switch (err.message) {
    case "INVALID_CONSENT_CHALLENGE":
      return "consent.error.invalidChallenge";
    case "CONSENT_REQUEST_USED":
      return "consent.error.challengeUsed";
    default:
      return "error.unknownError";
  }
}
