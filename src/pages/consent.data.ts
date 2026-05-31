import { query } from "@solidjs/router";
import { consentApi } from "../lib/consent";
import { t } from "../lib/i18n";
import { AppError } from "../types/api";

export const getConsentData = query(
  async (consentChallenge: string | string[] | undefined) => {
    if (!consentChallenge)
      throw new AppError("fatal", t("consent.error.noChallenge"), null);
    if (typeof consentChallenge !== "string")
      throw new AppError("fatal", t("consent.error.invalidChallenge"), null);
    return await consentApi.consentData(consentChallenge);
  },
  "consentData",
);
