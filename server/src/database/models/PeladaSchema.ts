// models/Pelada.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { all } from "axios";
import { EventDaysSchema } from "./EventDaysSchema";

export class PeladasSchema extends Model {
  public id!: string;
  public name!: string;
  public price!: number;
  public payment_day!: number;
  public banner!: string;
  public picture!: string
  public confirmation_open_hours_before_event!: number;
  public confirmation_close_hours_from_event!: number

  readonly schedule?: EventDaysSchema[]
}

PeladasSchema.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0,
  },
  payment_day: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 1,
  },
  confirmation_open_hours_before_event: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 24
  },
  confirmation_close_hours_from_event: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 2
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  sequelize,
  tableName: "peladas",
  timestamps: true,
});
