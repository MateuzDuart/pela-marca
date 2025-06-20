import initRelations from "./initRelations";
import { EventConfirmationsSchema } from "./models/EventConfirmationSchema";
import { EventDaysSchema } from "./models/EventDaysSchema";
import { EventsSchema } from "./models/EventsSchema";
import { GuestsSchema } from "./models/GuestsSchema";
import { MembersSchema } from "./models/MembersSchema";
import { PaymentHistoriesSchema } from "./models/PaymentHistoriesSchema";
import { PeladasSchema } from "./models/PeladaSchema";
import { UsersSchema } from "./models/UsersSchema";

const firstRun = true;

export default async function initDatabase({ force, alter }: { force?: boolean, alter?: boolean }) {
  const schemas = [
    EventConfirmationsSchema,
    EventDaysSchema,
    EventsSchema,
    GuestsSchema,
    MembersSchema,
    PaymentHistoriesSchema,
    PeladasSchema,
    UsersSchema
  ]

  if (firstRun) {
    await Promise.all(schemas.map(async (schema) => {
      await schema.sync();
    }));
  }

  await initRelations();

  await Promise.all(schemas.map(async (schema) => {
    await schema.sync({ force, alter });
  }));
}