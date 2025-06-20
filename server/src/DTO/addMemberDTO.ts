import { roleMember } from "../modules/role";

export interface addMemberDTO {
  peladaId: string,
  memberId: string,
  role: roleMember
}