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
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  MembersSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "pelada",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  UsersSchema.hasMany(MembersSchema, {
    foreignKey: "user_id",
    as: "member"
  });

  PeladasSchema.hasMany(MembersSchema, {
    foreignKey: "pelada_id",
    as: "members"
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
    as: "guestCandidates"
  });

  // Event relations
  EventsSchema.belongsTo(PeladasSchema, {
    foreignKey: "pelada_id",
    as: "pelada",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  PeladasSchema.hasMany(EventsSchema, {
    foreignKey: "pelada_id",
    as: "eventos",
  });

  // payment relations
  PaymentHistoriesSchema.belongsTo(UsersSchema, {
    foreignKey: "user_id",
    as: "paymentUser",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  UsersSchema.hasMany(PaymentHistoriesSchema, {
    foreignKey: "id",
    as: "paymentHistories",
  });

  PaymentHistoriesSchema.belongsTo(PeladasSchema, {
    foreignKey: "id",
    as: "paymentPelada",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  });

  PeladasSchema.hasMany(PaymentHistoriesSchema, {
    foreignKey: "id",
    as: "paymentHistories",
  });

  // Relacionamento: EventDay pertence a uma Pelada
  EventDaysSchema.belongsTo(PeladasSchema, {
    foreignKey: 'pelada_id',
    as: 'pelada',
  });

  PeladasSchema.hasMany(EventDaysSchema, {
    foreignKey: "pelada_id",
    as: "schedule",
  });

  // Event Comfirmation Relations
  EventsSchema.hasMany(EventConfirmationsSchema, {
    foreignKey: "event_id",
    as: "confirmations",
  });

  MembersSchema.hasMany(EventConfirmationsSchema, {
    foreignKey: "member_id",
    as: "confirmations",
  });

} 