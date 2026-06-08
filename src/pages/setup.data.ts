import { query } from "@solidjs/router";
import { setupApi } from "../lib/setup";
import { AppError } from "../types/api";

export const getSetupStage = query(
  async (token: string | string[] | undefined) => {
    if (!token) throw new AppError("fatal", "setup.error.noToken", null);
    if (typeof token !== "string")
      throw new AppError("fatal", "setup.error.invalidToken", null);
    return await setupApi.currentStage(token);
  },
  "setupStage",
);
