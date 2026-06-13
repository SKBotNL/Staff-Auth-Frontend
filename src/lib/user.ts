import type { TranslationKey } from "../contexts/I18nContext";
import { type ApiError, AppError, ErrorData } from "../types/api";
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
        errorData: (await response.json()) as ErrorData,
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
        errorData: (await response.json()) as ErrorData,
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
        errorData: (await response.json()) as ErrorData,
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
        errorData: (await response.json()) as ErrorData,
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
        errorData: (await response.json()) as ErrorData,
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
  switch (err.errorData.message) {
    case "DUPLICATE_MINECRAFT_UUID":
      return "panel.users.error.duplicateMinecraftUuid";
    case "INVALID_MINECRAFT_UUID":
      return "panel.users.error.invalidMinecraftUuid";
    case "DEACTIVATE_SELF":
      return "panel.users.error.deactivateSelf";
    case "DELETE_SELF":
      return "panel.users.error.deleteSelf";
    case "CHANGE_OWN_ROLE":
      return "panel.users.error.changeOwnRole";
    default:
      return "error.unknownError";
  }
}
