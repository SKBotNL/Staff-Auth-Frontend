import { query } from "@solidjs/router";
import { t } from "../lib/i18n";
import { setupApi } from "../lib/setup";
import { AppError } from "../types/api";

export const getSetupStage = query(
  async (token: string | string[] | undefined) => {
    if (!token) throw new AppError("fatal", t("setup.error.noToken"), null);
    if (typeof token !== "string")
      throw new AppError("fatal", t("setup.error.invalidToken"), null);
    return await setupApi.currentStage(token);
  },
  "setupStage",
);
