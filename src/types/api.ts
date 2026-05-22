export type MeData = {
  sub: string;
  name: string;
  picture: string;
  roles: string[];
};

export type ApiError = { message: string; status: number };

export class AppError extends Error {
  kind: "fatal" | "local";
  status: number | null;

  constructor(kind: "fatal" | "local", message: string, status: number | null) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}
