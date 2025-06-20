// models/Member.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { PeladasSchema } from "./PeladaSchema";
import { UsersSchema } from "./UsersSchema";
import { roleMember } from "../../modules/role";


export class MembersSchema extends Model {
  public id!: string;
  public user_id!: string;
  public pelada_id!: string;
  public role!: roleMember;

  public readonly pelada?: PeladasSchema;
  public readonly user?: UsersSchema;
}

MembersSchema.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pelada_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("owner", "admin", "member"),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: "members",
});
