// models/EventDay.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";

export class EventDaysSchema extends Model {
  public id!: number;
  public day!: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  public hour!: string | null; // formato HH:mm:ss
  public is_active!: boolean;
  public pelada_id!: string;
}

EventDaysSchema.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  day: {
    type: DataTypes.ENUM(
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    ),
    allowNull: false,
  },
  hour: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  pelada_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: "event_days",
});
