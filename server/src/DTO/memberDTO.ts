import { roleMember } from "../modules/role";

export interface memberDTO {
  name: string;
  email: string;
  picture: string;
  role: roleMember;
}