import type User from "./User";

export interface Member {
  id: string;
  user: User
  role: 'admin' | 'member' | 'owner';
}