import { ApiError, AppError } from "../types/api";
import { CreateInviteData, InviteData } from "../types/invite";
import { BASE_URL, isApiError, LOGIN_URL } from "./api";
import { t } from "../lib/i18n";

export const inviteApi = {
  getAll: async (): Promise<InviteData[]> => {
    const response = await fetch(`${BASE_URL}/invite`, {
      credentials: "include",
    });

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

  get: async (id: string): Promise<InviteData> => {
    const response = await fetch(`${BASE_URL}/invite/${id}`, {
      credentials: "include",
    });

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

  create: async (userData: CreateInviteData): Promise<InviteData> => {
    const response = await fetch(`${BASE_URL}/invite`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

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

  /**
   * @return success
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await fetch(`${BASE_URL}/invite/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = LOGIN_URL;
      }
      return false;
    }
    return true;
  },
};

function toAppError(err: unknown): AppError {
  if (isApiError(err)) {
    throw new AppError("local", getApiErrorMessage(err), err.status);
  }
  throw new AppError("fatal", t("error.unknownError"), null);
}

function getApiErrorMessage(err: ApiError): string {
  if (err.status === 429) {
    return t("error.tooManyRequests");
  }
  switch (err.message) {
    case "USER_ALREADY_SET_UP":
      return t("panel.invites.error.userAlreadySetUp");
    case "DUPLICATE_INVITE":
      return t("panel.invites.error.duplicate");
    default:
      return t("error.unknownError");
  }
}
