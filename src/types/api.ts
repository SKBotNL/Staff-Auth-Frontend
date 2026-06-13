import type { TranslationKey } from "../contexts/I18nContext";

export type MeData = {
  sub: string;
  name: string;
  picture: string;
  roles: string[];
};

export type ErrorData = { message: string };
export type RedirectErrorData = ErrorData & { redirectUrl: string };

export type ApiError = { errorData: ErrorData; status: number };

export class AppError extends Error {
  kind: "fatal" | "local";
  status: number | null;
  override message: TranslationKey;

  constructor(
    kind: "fatal" | "local",
    message: TranslationKey,
    status: number | null,
  ) {
    super(message);
    this.message = message;
    this.kind = kind;
    this.status = status;
  }
}

export class NeedToLoginError extends Error {}
