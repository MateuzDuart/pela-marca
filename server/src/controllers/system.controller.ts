import { Request, Response } from 'express';
import { UsersSchema } from '../database/models/UsersSchema';
import updateUserSchema from '../zodSchemas/userUpdateSchema';
import { sequelize } from '../database/database';
import path from 'path';
import fs from 'fs';

export default new class SystemController {
  async home(req: Request, res: Response): Promise<any> {
    return res.status(200).json({
      message: 'Bem-vindo ao sistema de autenticação',
      status: 'success',
    });
  }

  async getUserData(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;

    const user = await UsersSchema.findByPk(userId, {
      attributes: ['name', 'email', 'picture'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        status: 'error',
      });
    }

    const isGooglePicute = user.picture?.startsWith('https://lh3.googleusercontent.com/a/');

    return res.status(200).send({
      name: user.name,
      email: user.email,
      picture: isGooglePicute ? user.picture : `${process.env.BASE_URL}/images/${user.picture}`,
    });
  }


  async updateProfile(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const transaction = await sequelize.transaction();
    const uploadedFile = req.file?.filename;
    const imagePath = uploadedFile
      ? path.resolve(__dirname, "..", "..", "uploads", uploadedFile)
      : undefined;

    try {
      // Validação do nome
      let name: string | undefined;
      if (req.body.name) {
        const result = updateUserSchema.safeParse({ name: req.body.name });
        if (!result.success) {
          throw new Error(result.error.errors[0].message);
        }
        name = result.data.name;
      }

      // Atualização dos dados
      const user = await UsersSchema.findByPk(userId, { attributes: ['id', 'picture'], transaction: transaction });
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (uploadedFile) updateData.picture = uploadedFile;

      const isGooglePicute = user.picture?.startsWith('https://lh3.googleusercontent.com/a/');
      // Apaga a imagem se ela já foi salva
      if (!isGooglePicute && user.picture) {
        const oldImagePath = path.resolve(__dirname, "..", "..", "uploads", "images", user.picture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      await user.update(updateData, { transaction: transaction });
      await transaction.commit();


      return res.status(200).json({
        message: "Perfil atualizado com sucesso",
      });
    } catch (err) {
      await transaction.rollback();

      // Apaga a imagem se ela já foi salva
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      console.error("Erro ao atualizar perfil:", err);
      return res.status(400).json({
        message: err instanceof Error ? err.message : "Erro ao atualizar perfil",
      });
    }
  }
}