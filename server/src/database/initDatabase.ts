import { UsersSchema } from "./models/UsersSchema";

export default async function initDatabase({force, alter}: { force?: boolean, alter?: boolean}) {
  UsersSchema.sync({force, alter})
}