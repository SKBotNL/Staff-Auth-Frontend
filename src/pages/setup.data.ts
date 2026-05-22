import { query } from "@solidjs/router";
import { AppError } from "../types/api";
import { setupApi } from "../lib/setup";
import { t } from "../lib/i18n";

export const getSetupStage = query(
  async (token: string | string[] | undefined) => {
    if (!token) throw new AppError("fatal", t("setup.error.noToken"), null);
    if (typeof token !== "string")
      throw new AppError("fatal", t("setup.error.invalidToken"), null);
    return await setupApi.currentStage(token);
  },
  "setupStage",
);
