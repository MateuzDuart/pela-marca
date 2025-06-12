import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../services/googleAuth.service";
import { UsersSchema } from "../database/models/UsersSchema"; 

export default new class AuthController {
  private generateJWT(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "30d" });
  }

  public googleAuth = async (req: Request, res: Response): Promise<any> => {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Token do Google é obrigatório" });
    }

    const googleUser = await verifyGoogleToken(idToken);
    if (!googleUser) {
      return res.status(401).json({ message: "Token inválido" });
    }

    try {
      // Procura o usuário pelo email
      let user = await UsersSchema.findOne({ where: { email: googleUser.email } });

      // Se não existir, cria
      if (!user) {
        user = await UsersSchema.create({
          name: googleUser.name!,
          email: googleUser.email!,
          picture: googleUser.picture,
        });
      }

      const token = this.generateJWT(user.id);

      return res.status(200).json({
        message: "Autenticado com sucesso",
        user,
        token,
      });
    } catch (err) {
      console.error("Erro ao autenticar usuário:", err);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  };
};
