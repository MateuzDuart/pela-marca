import { UsersSchema } from "./models/UsersSchema";
import { PeladasSchema } from "./models/PeladaSchema";
import { MembersSchema } from "./models/MembersSchema";
import { GuestsSchema } from "./models/GuestsSchema";
import { EventsSchema } from "./models/EventsSchema";
import { PaymentHistoriesSchema } from "./models/PaymentHistoriesSchema";
import { EventDaysSchema } from "./models/EventDaysSchema";
import { EventConfirmationsSchema } from "./models/EventConfirmationSchema";

export default async function initRelations() {

  // member ralations
  MembersSchema.belongsTo(UsersSchema, {
    foreignKey: "user_id",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  });

  UsersSchema.hasMany(MembersSchema, {
    foreignKey: "user_id",
    as: "member",
    onDelete: "CASCADE",
  });

  MembersSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "pelada",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  });

  PeladasSchema.hasMany(MembersSchema, {
    foreignKey: "pelada_id",
    as: "members",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  // Guest relations
  GuestsSchema.belongsTo(UsersSchema, {
    foreignKey: "user_id",
    as: "user",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  GuestsSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "pelada",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  UsersSchema.hasMany(GuestsSchema, {
    foreignKey: "user_id",
    as: "guest"
  });

  PeladasSchema.hasMany(GuestsSchema, {
    foreignKey: "pelada_id",
    as: "guestCandidates",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  // Event relations
  EventsSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "pelada",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  });

  PeladasSchema.hasMany(EventsSchema, {
    foreignKey: "pelada_id",
    as: "events",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  // payment relations
  PaymentHistoriesSchema.belongsTo(UsersSchema, {
    foreignKey: "user_id",
    as: "paymentUser",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  UsersSchema.hasMany(PaymentHistoriesSchema, {
    foreignKey: "user_id",
    as: "paymentHistories",
  });

  PaymentHistoriesSchema.belongsTo(UsersSchema, {
    foreignKey: "confirmed_by",
    as: "confirmedByUser",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });
  UsersSchema.hasMany(PaymentHistoriesSchema, {
    foreignKey: "confirmed_by",
    as: "confirmedByUser",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  PaymentHistoriesSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "paymentPelada",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  });

  PeladasSchema.hasMany(PaymentHistoriesSchema, {
    foreignKey: "pelada_id",
    as: "paymentHistories",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  // Relacionamento: EventDay pertence a uma Pelada
  EventDaysSchema.belongsTo(PeladasSchema, {
    foreignKey: 'pelada_id',
    as: 'pelada',
    onDelete: "CASCADE",
  });

  PeladasSchema.hasMany(EventDaysSchema, {
    foreignKey: "pelada_id",
    as: "schedule",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  // Event Comfirmation Relations
  EventsSchema.hasMany(EventConfirmationsSchema, {
    foreignKey: "event_id",
    as: "confirmations",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

  MembersSchema.hasMany(EventConfirmationsSchema, {
    foreignKey: "member_id",
    as: "confirmations",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });
  EventConfirmationsSchema.belongsTo(MembersSchema, {
    foreignKey: "member_id",
    as: "member",
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
    hooks: true,
  });

} 