// models/Evento.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { EventConfirmationsSchema } from "./EventConfirmationSchema";

export class EventsSchema extends Model {
  public id!: number;
  public pelada_id!: string;
  public date!: Date;
  public status!: "open" | "closed" | "cancelled";

  readonly confirmations?: EventConfirmationsSchema[]; 
}

EventsSchema.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pelada_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("open", "closed", "cancelled"),
    allowNull: false,
    defaultValue: "open",
  },
}, {
  sequelize,
  tableName: "events",
});
