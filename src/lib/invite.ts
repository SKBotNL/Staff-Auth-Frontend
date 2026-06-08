import type { TranslationKey } from "../contexts/I18nContext";
import { type ApiError, AppError } from "../types/api";
import type { CreateInviteData, InviteData } from "../types/invite";
import { BASE_URL, isApiError, LOGIN_URL } from "./api";

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

  create: async (inviteData: CreateInviteData): Promise<InviteData> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/invite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });
    } catch (err) {
      throw toAppError(err);
    }

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
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/invite/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      throw toAppError(err);
    }

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
  if (err instanceof TypeError) {
    if (err.message.startsWith("NetworkError")) {
      throw new AppError("local", "error.networkError", null);
    }
  }
  throw new AppError("fatal", "error.unknownError", null);
}

function getApiErrorMessage(err: ApiError): TranslationKey {
  if (err.status === 429) {
    return "error.tooManyRequests";
  }
  if (err.status === 401 || err.status === 403) {
    return "error.unauthorized";
  }
  switch (err.message) {
    case "USER_ALREADY_SET_UP":
      return "panel.invites.error.userAlreadySetUp";
    case "DUPLICATE_INVITE":
      return "panel.invites.error.duplicate";
    default:
      return "error.unknownError";
  }
}
