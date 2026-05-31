import { t } from "../lib/i18n";
import { type ApiError, AppError } from "../types/api";
import type { ConsentData } from "../types/consent";
import { BASE_URL, isApiError } from "./api";

export const consentApi = {
  consentData: async (consentChallenge: string): Promise<ConsentData> => {
    const url = new URL("/consent", BASE_URL);
    url.searchParams.set("consent_challenge", consentChallenge);
    const response = await fetch(url);

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
    const response = await fetch(`${BASE_URL}/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent: consent,
        consentChallenge: consentChallenge,
      }),
    });

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
  throw new AppError("fatal", t("error.unknownError"), null);
}

function getApiErrorMessage(err: ApiError): string {
  switch (err.message) {
    case "INVALID_CONSENT_CHALLENGE":
      return t("consent.error.invalidChallenge");
    case "CONSENT_REQUEST_USED":
      return t("consent.error.challengeUsed");
    default:
      return t("error.unknownError");
  }
}
