import { UsersSchema } from "../database/models/UsersSchema";

export default new class UserService {
  async checkIfUserExists(userId: string): Promise<boolean> {
    const user = await UsersSchema.findByPk(userId, { attributes: ['id'] });
    return !!user;
  }
}