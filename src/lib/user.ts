import { t } from "../lib/i18n";
import { type ApiError, AppError } from "../types/api";
import type { CreateUserData, UpdateUserData, UserData } from "../types/user";
import { BASE_URL, isApiError, LOGIN_URL } from "./api";

export const userApi = {
  getAll: async (): Promise<UserData[]> => {
    const response = await fetch(`${BASE_URL}/user`, {
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

  get: async (id: string): Promise<UserData> => {
    const response = await fetch(`${BASE_URL}/user/${id}`, {
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

  update: async (userData: UpdateUserData): Promise<UserData> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/user/${userData.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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

  create: async (userData: CreateUserData): Promise<UserData> => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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
  delete: async (id: string) => {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/user/${id}`, {
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
      throw toAppError({
        status: response.status,
        message: await response.text(),
      });
    }
  },
};

function toAppError(err: unknown): AppError {
  if (isApiError(err)) {
    throw new AppError("local", getApiErrorMessage(err), err.status);
  }
  if (err instanceof TypeError) {
    if (err.message.startsWith("NetworkError")) {
      throw new AppError("local", t("error.networkError"), null);
    }
  }
  throw new AppError("fatal", t("error.unknownError"), null);
}

function getApiErrorMessage(err: ApiError): string {
  if (err.status === 429) {
    return t("error.tooManyRequests");
  }
  if (err.status === 401 || err.status === 403) {
    return t("error.unauthorized");
  }
  switch (err.message) {
    case "DUPLICATE_MINECRAFT_UUID":
      return t("panel.users.error.duplicateMinecraftUuid");
    case "INVALID_MINECRAFT_UUID":
      return t("panel.users.error.invalidMinecraftUuid");
    case "DEACTIVATE_SELF":
      return t("panel.users.error.deactivateSelf");
    case "DELETE_SELF":
      return t("panel.users.error.deleteSelf");
    case "CHANGE_OWN_ROLE":
      return t("panel.users.error.changeOwnRole");
    default:
      return t("error.unknownError");
  }
}
