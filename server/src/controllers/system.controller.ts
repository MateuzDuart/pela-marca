import { Request, Response } from 'express';
import { UsersSchema } from '../database/models/UsersSchema';
import updateUserSchema from '../zodSchemas/userUpdateSchema';
import { sequelize } from '../database/database';
import path from 'path';
import fs from 'fs';
import peladaService from '../services/pelada.service';
import { createPeladaSchema } from '../zodSchemas/createPeladaSchema';
import userService from '../services/user.service';
import { ZodError } from 'zod';
import { roleMember } from '../modules/role';
import { Eschedule } from '../modules/schedule';
import { updatePeladaSchema } from '../zodSchemas/updatePeladaSchema';
import PeladaServiceError from '../Errors/PeladaServiceError';
import { acceptInviteSchema } from '../zodSchemas/acceptInviteSchema';
import { getMemberSchema } from '../zodSchemas/getMemberSchema';
import { paymentActionSchema } from '../zodSchemas/paymentActionSchema';

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
      attributes: ['id', 'name', 'email', 'picture'],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        status: 'error',
      });
    }

    const isGooglePicute = user.picture?.startsWith('https://lh3.googleusercontent.com/a/');

    return res.status(200).send({
      id: user.id,
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


  // tudo para baixo já está usando services
  async createPelada(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const schedule: Record<Eschedule, { hour: string, isActive?: boolean }> = {
      monday: { hour: "00:00" },
      tuesday: { hour: "00:00" },
      wednesday: { hour: "00:00" },
      thursday: { hour: "00:00" },
      friday: { hour: "00:00" },
      saturday: { hour: "00:00" },
      sunday: { hour: "00:00" },
    }

    const transaction = await sequelize.transaction();
    try {
      const data = createPeladaSchema.parse(req.body || {});

      const userExists = await userService.checkIfUserExists(userId)
      if (!userExists) {
        throw new Error("Usuário nao encontrado");
      }

      const pelada = await peladaService.createPelada(data, transaction);
      await peladaService.addMemberToPelada({
        memberId: userId,
        peladaId: pelada.id,
        role: roleMember.OWNER
      }, transaction);

      await peladaService.createScheduleOfPelada({ days: { ...schedule, ...data.schedule }, peladaId: pelada.id }, transaction);

      await transaction.commit();
      return res.status(201).json({
        message: "Pelada criada com sucesso",
      });
    } catch (err) {
      await transaction.rollback();

      if (err instanceof ZodError) {
        return res.status(400).json({ message: err.issues[0].message });
      }
      if (err instanceof PeladaServiceError) {
        return res.status(400).json({
          message: err instanceof Error ? err.message : "Erro ao criar pelada",
        });
      }
      return res.status(400).json({
        message: "Erro ao criar pelada",
      });
    }
  }

  async getPeladasAsMember(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;

    try {
      const peladas = await peladaService.getPeladasAsMember(userId);

      return res.status(200).json(peladas);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar peladas",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar peladas",
      });
    }

  }

  async getPeladasAsAdmin(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    try {
      const peladas = await peladaService.getPeladasAsAdmin(userId);

      return res.status(200).json(peladas);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar peladas",
        });
      }
      return res.status(400).json({
        message: "Erro ao buscar peladas",
      });
    }

  }

  async updatePelada(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = updatePeladaSchema.parse(req.body || {});
      await peladaService.updatePelada({ userId, peladaId, newData: data }, transaction);

      const days = data.schedule as Record<Eschedule, { hour: string, isActive?: boolean }>
      if (days) {
        await peladaService.updateScheduleOfPelada({ userId, peladaId, days }, transaction);
      }
      await transaction.commit();
      return res.status(200).json({ message: "Pelada atualizada com sucesso" });
    } catch (err) {
      await transaction.rollback();
      if (err instanceof ZodError) {
        return res.status(400).json({ message: err.issues[0].message });
      }
      if (err instanceof PeladaServiceError) {
        return res.status(400).json({
          message: err instanceof Error ? err.message : "Erro ao atualizar pelada",
        });
      }
      console.log(err);
      return res.status(400).json({
        message: "Erro ao atualizar pelada",
      });
    }
  }

  async sendInvite(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      await peladaService.sendInvite({ userId, peladaId }, transaction);

      await transaction.commit();
      return res.status(200).json({ message: "Convite enviado com sucesso" });
    } catch (err) {
      await transaction.rollback();
      if (err instanceof PeladaServiceError) {
        return res.status(400).json({
          message: err instanceof Error ? err.message : "Erro ao enviar convite",
        });
      }
      return res.status(400).json({
        message: "Erro ao enviar convite",
      });
    }
  }

  async getInvites(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    try {
      const invites = await peladaService.getInvites({ userId, peladaId });
      return res.status(200).json(invites);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar convites",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar convites",
      });
    }

  }

  async acceptInvite(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = acceptInviteSchema.parse(req.body || {});
      await peladaService.acceptInvite({ userId, peladaId, inviteId: data.invite_id }, transaction);

      await transaction.commit();
      return res.status(200).json({ message: "Convite aceito com sucesso" });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao aceitar convite",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao aceitar convite",
      });
    }
  }

  async rejectInvite(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = acceptInviteSchema.parse(req.body || {});
      await peladaService.rejectInvite({ userId, peladaId, inviteId: data.invite_id }, transaction);

      await transaction.commit();
      return res.status(200).json({ message: "Convite rejeitado com sucesso" });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao rejeitar convite",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao rejeitar convite",
      });
    }
  }

  async getMembers(req: Request, res: Response): Promise<any> {
    const peladaId = req.params.id;

    try {
      const members = await peladaService.getMembers(peladaId);
      return res.status(200).json(members);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar membros",
        });
      }
      return res.status(400).json({
        message: "Erro ao buscar membros",
      });
    }
  }

  async getMembersAsAdmin(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    try {
      const members = await peladaService.getMembersAsAdmin({ userId, peladaId });
      return res.status(200).json(members);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar membros",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar membros como administrador",
      });
    }
  }

  async getPeladaAsAdmin(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    try {
      const pelada = await peladaService.getPeladaAsAdmin({ userId, peladaId });
      return res.status(200).json(pelada);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar pelada",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar pelada como administrador",
      });
    }
  }

  async getPeladaInviteData(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;
    console.log(userId);
    try {
      const data = await peladaService.getPeladaInviteData({ userId, peladaId });
      return res.status(200).json(data);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar convites",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar convites",
      });
    }
  }

  async deleteMember(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    try {
      const data = getMemberSchema.parse(req.query || {});
      await peladaService.deleteMemberFromPelada({ userId, peladaId, memberId: data.member_id });
      return res.status(200).json({ message: "Membro excluído com sucesso" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao excluir membro",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao excluir membro",
      });
    }
  }

  async setAdminRole(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = getMemberSchema.parse(req.body || {});
      const response = await peladaService.setAdminRole({ userId, peladaId, memberId: data.member_id }, transaction);
      await transaction.commit();
      return res.status(200).json({ message: response.message });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao excluir membro",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao excluir membro",
      });
    }
  }

  async removeAdminRole(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = getMemberSchema.parse(req.body || {});
      const response = await peladaService.removeAdminRole({ userId, peladaId, memberId: data.member_id }, transaction);
      await transaction.commit();
      return res.status(200).json({ message: response.message });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao excluir membro",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao excluir membro",
      });
    }
  }

  async setPaymentPending(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = paymentActionSchema.parse(req.body || {});
      const response = await peladaService.setPaymentPending({
        userId,
        peladaId,
        memberId: data.member_id,
        mouthReference: data.mouth_reference
      }, transaction);

      await transaction.commit();
      return res.status(200).json({ message: response.message });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).send(error)
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao deixar pagamento do membro pendente",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao deixar pagamento do membro pendente",
      });
    }
  }

  async cancelPaymentPending(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const data = paymentActionSchema.parse(req.body || {});
      const response = await peladaService.cancelPaymentPending({
        userId,
        peladaId,
        memberId: data.member_id,
        mouthReference: data.mouth_reference
      }, transaction);
      await transaction.commit();
      return res.status(200).json({ message: response.message });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).send(error)
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao cancelar pendencia de pagamento do membro",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao cancelar pendencia de pagamento do membro",
      });
    }
  }

  async setPaymentPaid(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;
    const transaction = await sequelize.transaction();
    try {
      const data = paymentActionSchema.parse(req.body || {});
      const response = await peladaService.setPaymentPaid({
        userId,
        peladaId,
        memberId: data.member_id,
        mouthReference: data.mouth_reference
      }, transaction);
      await transaction.commit();
      return res.status(200).json({ message: response.message });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).send(error)
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao deixar pagamento do membro como pago",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao deixar pagamento do membro como pago",
      });
    }
  }

  async deletePelada(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      await peladaService.deletePelada({ userId, peladaId }, transaction);
      await transaction.commit();

      return res.status(200).json({ message: "Pelada excluída com sucesso" });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao excluir pelada",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao excluir pelada",
      });
    }
  }

  async getPelada(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;
    try {
      const pelada = await peladaService.getPelada({ userId, peladaId });
      return res.status(200).json(pelada);
    } catch (error) {
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao buscar pelada",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao buscar pelada",
      });
    }
  }

  async confirmEventAttendance(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;

    const transaction = await sequelize.transaction();
    try {
      const isConfirmed = await peladaService.confirmEventAttendance({
        userId,
        peladaId,
      }, transaction);

      await transaction.commit();
      if (isConfirmed) {
        return res.status(200).json({ message: "Presença confirmada com sucesso" });
      } else {
        return res.status(400).json({ message: "Você já confirmou presença neste evento" });
      }
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ZodError) {
        return res.status(400).send(error)
      }
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao confirmar presença no evento",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao confirmar presença no evento",
      });
    }
  }

  async cancelEventAttendance(req: Request, res: Response): Promise<any> {
    const userId = (req as any).userId;
    const peladaId = req.params.id;
    const transaction = await sequelize.transaction();
    try {
      const isConfirmed = await peladaService.cancelEventAttendance({
        userId,
        peladaId,
      }, transaction);

      await transaction.commit();
      if (isConfirmed) {
        return res.status(200).json({ message: "Presença cancelada com sucesso" });
      } else {
        return res.status(400).json({ message: " Você ainda não confirmou presença neste evento" });
      }
    } catch (error) {
      await transaction.rollback();
      if (error instanceof PeladaServiceError) {
        return res.status(400).json({
          message: error instanceof Error ? error.message : "Erro ao cancelar presença no evento",
        });
      }
      console.log(error);
      return res.status(400).json({
        message: "Erro ao cancelar presença no evento",
      });
    }
  }

}