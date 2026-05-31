export type UserData = {
  id: number;
  uuid: string;
  username: string;
  email?: string;
  role: Role;
  minecraftUuid: string;
  setUp: boolean;
  deactivated: boolean;
};

export type UpdateUserData = {
  id: number;
  email?: string;
  role?: Role;
  minecraftUuid?: string;
  deactivated?: boolean;
};

export type CreateUserData = {
  email?: string;
  role: Role;
  minecraftUuid: string;
};

export type Role = "ADMIN" | "DEVELOPER" | "MODERATOR" | "HELPER";
