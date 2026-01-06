export type Role = "admin" | "user";

export type AuthUser = {
  id: string;
  role: Role;
};

export type AccessTokenPayload = {
  sub: string;
  role: Role;
  tokenType: "access";
  iat: number;
  exp: number;
};

export type RefreshTokenPayload = {
  sub: string;
  role: Role;
  jti: string;
  tokenType: "refresh";
  iat: number;
  exp: number;
};
