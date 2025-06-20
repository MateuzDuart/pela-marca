// models/EventConfirmation.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";

export class EventConfirmationsSchema extends Model {
  public id!: number;
  public event_id!: string;
  public member_id!: string;
}

EventConfirmationsSchema.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  member_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: "event_confirmations",
});
