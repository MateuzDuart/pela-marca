// models/Guest.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";

export class GuestsSchema extends Model {
  public id!: string;
  public user_id!: string;
  public pelada_id!: string;
}

GuestsSchema.init({
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
  }
}, {
  sequelize,
  tableName: "guests",
});
