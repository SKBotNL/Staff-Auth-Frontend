import { query } from "@solidjs/router";
import { t } from "../lib/i18n";
import { loginApi } from "../lib/login";
import { AppError } from "../types/api";

export const getLoginData = query(
  async (loginChallenge: string | string[] | undefined) => {
    if (!loginChallenge)
      throw new AppError("fatal", t("login.error.noChallenge"), null);
    if (typeof loginChallenge !== "string")
      throw new AppError("fatal", t("login.error.invalidChallenge"), null);
    return await loginApi.loginData(loginChallenge);
  },
  "loginData",
);
