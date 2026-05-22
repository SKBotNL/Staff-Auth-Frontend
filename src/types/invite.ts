export type InviteData = {
  id: number;
  token: string;
  invitedUserId: string;
};

export type CreateInviteData = {
  invitedUserId: string;
};
