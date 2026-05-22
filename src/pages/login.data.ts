import { query } from "@solidjs/router";
import { AppError } from "../types/api";
import { loginApi } from "../lib/login";
import { t } from "../lib/i18n";

export const getLoginStage = query(
  async (loginChallenge: string | string[] | undefined) => {
    if (!loginChallenge)
      throw new AppError("fatal", t("login.error.noChallenge"), null);
    if (typeof loginChallenge !== "string")
      throw new AppError("fatal", t("login.error.invalidChallenge"), null);
    return await loginApi.currentStage(loginChallenge);
  },
  "loginStage",
);
