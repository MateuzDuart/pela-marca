// models/PaymentHistory.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";

export class PaymentHistoriesSchema extends Model {
  public id!: number;
  public reference_month!: string; // formato esperado: 'YYYY-MM'
  public status!: "paid" | "pending" | "late";
  public member_id!: number;
}

PaymentHistoriesSchema.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference_month: {
    type: DataTypes.CHAR(7), // 'YYYY-MM'
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("paid", "pending", "late"),
    allowNull: false,
  },
  confirmed_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pelada_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: "payment_histories",
});
