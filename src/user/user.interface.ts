export interface User {
  id: number;
  username: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}
