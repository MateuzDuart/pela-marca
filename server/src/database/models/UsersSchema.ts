import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";

interface UsersSchemaAttributes {
  id: string;
  name: string;
  email: string;
  picture?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsersSchemaCreationAttributes extends Optional<UsersSchemaAttributes, "id"> {}

export class UsersSchema extends Model<UsersSchemaAttributes, UsersSchemaCreationAttributes>
  implements UsersSchemaAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public picture?: string;
  public phone?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsersSchema.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Gera UUID automático
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);
