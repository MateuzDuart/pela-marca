import { Op, Transaction } from "sequelize";
import { PeladasSchema } from "../database/models/PeladaSchema";
import { MembersSchema } from "../database/models/MembersSchema";
import { addMemberDTO } from "../DTO/addMemberDTO";
import { createScheduleDTO } from "../DTO/createScheduleDTO";
import { EventDaysSchema } from "../database/models/EventDaysSchema";
import { Eschedule } from "../modules/schedule";
import { roleMember } from "../modules/role";
import { updatePeladaDTO } from "../DTO/updatePeladaDTO";
import { updateScheduleDTO } from "../DTO/updateScheduleDTO";
import { sendInviteDTO } from "../DTO/sendInviteDTO";
import { UsersSchema } from "../database/models/UsersSchema";
import { GuestsSchema } from "../database/models/GuestsSchema";
import PeladaServiceError from "../Errors/PeladaServiceError";
import { acceptInviteDTO } from "../DTO/acceptInviteDTO";
import { memberDTO } from "../DTO/memberDTO";
import { PaymentHistoriesSchema } from "../database/models/PaymentHistoriesSchema";
import { getPeladaAsAdminDTO } from "../DTO/getPeladaAsAdminDTO";
import { PeladaInviteDTO } from "../DTO/PeladaInviteDTO";
import { deleteMemberDTO } from "../DTO/deleteMemberDTO";
import { setAdminRoleDTO } from "../DTO/setAdminRoleDTO";

export default new class PeladaService {
  // CREATE
  async createPelada(data: { name: string; price?: number; payment_day?: number }, transaction?: Transaction): Promise<PeladasSchema> {
    const pelada = await PeladasSchema.create({
      name: data.name,
      price: data.price || 0,
      payment_day: data.payment_day || 1,
    }, { transaction });
    return pelada;
  }

  async addMemberToPelada(data: addMemberDTO, transaction?: Transaction): Promise<MembersSchema> {
    const member = await MembersSchema.create({
      user_id: data.memberId,
      pelada_id: data.peladaId,
      role: data.role
    }, { transaction });
    return member;
  }

  async createScheduleOfPelada(data: createScheduleDTO, transaction?: Transaction): Promise<EventDaysSchema[]> {
    const schedule = await Promise.all(
      Object.entries(data.days).map(async ([dayKey, dataDay]) => {
        const dayName = dayKey as Eschedule;

        return await EventDaysSchema.create(
          {
            day: dayName,
            hour: dataDay.hour,
            is_active: dataDay.is_active || false,
            pelada_id: data.peladaId
          },
          { transaction }
        );
      })
    );

    return schedule;
  }

  async sendInvite(data: sendInviteDTO, transaction?: Transaction): Promise<boolean> {
    const pelada = await PeladasSchema.findByPk(data.peladaId, { transaction });
    if (!pelada) throw new PeladaServiceError("Pelada nao encontrada");

    const member = await MembersSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
    if (member) throw new PeladaServiceError("Usuário já é membro na pelada");

    const user = await UsersSchema.findByPk(data.userId, { transaction });
    if (!user) throw new PeladaServiceError("Usuário nao encontrado");

    const invite = await GuestsSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
    if (invite) throw new PeladaServiceError("Convite ja foi enviado");

    await GuestsSchema.create({ user_id: data.userId, pelada_id: data.peladaId }, { transaction });

    return true;
  }

  async acceptInvite(data: acceptInviteDTO, transaction?: Transaction): Promise<MembersSchema> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: data.userId,
        pelada_id: data.peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      },
      transaction
    });

    if (!member) throw new PeladaServiceError("Usuário nao tem permissao para aceitar convites");

    const invite = await GuestsSchema.findByPk(data.inviteId, {
      attributes: ["user_id"],
      transaction
    });
    if (!invite) throw new PeladaServiceError("Convite nao encontrado");
    invite.id = data.inviteId;
    await invite.destroy({ transaction });

    const newMember = await MembersSchema.create({
      user_id: invite.user_id,
      pelada_id: data.peladaId,
      role: roleMember.MEMBER
    }, { transaction });

    return newMember;
  }

  async rejectInvite(data: acceptInviteDTO, transaction?: Transaction): Promise<void> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: data.userId,
        pelada_id: data.peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      },
      transaction
    })
    if (!member) throw new PeladaServiceError("Usuário nao tem permissao para rejeitar convites");

    const invite = await GuestsSchema.findByPk(data.inviteId, { transaction });
    if (!invite) throw new PeladaServiceError("Convite nao encontrado");

    await invite.destroy({ transaction });
  }

  // READ
  async getPeladaAsAdmin({ userId, peladaId }: getPeladaAsAdminDTO): Promise<PeladasSchema> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário nao tem permissao para ver essa pelada");

    const pelada = await PeladasSchema.findByPk(peladaId, {
      attributes: ["name", "price", "payment_day", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
      include: [
        {
          model: EventDaysSchema,
          as: "schedule",
          attributes: ["day", "hour", "is_active"],
          where: {
            hour: { [Op.not]: "00:00:00" }
          },
          required: false
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada nao encontrada");

    return pelada;
  }

  async getPeladasAsMember(userId: string): Promise<PeladasSchema[]> {
    const memberPeladas = await MembersSchema.findAll({
      attributes: [],
      where: { user_id: userId },
      include: [
        {
          model: PeladasSchema,
          as: "pelada",
          attributes: ["id", "name"],
        },
      ],
    })

    const peladas = [
      ...memberPeladas.map((member) => member.pelada)
    ] as PeladasSchema[]

    return peladas;
  }

  async getPeladasAsAdmin(userId: string): Promise<PeladasSchema[]> {
    const peladas = await PeladasSchema.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: MembersSchema,
          as: "members",
          attributes: [],
          where: { user_id: userId, [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }] },
          required: true,
        },
      ],
    });

    return peladas;
  }

  async getInvites({ userId, peladaId }: { peladaId: string, userId: string }): Promise<GuestsSchema[]> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Você não tem permissão para ver os convites");

    const invites = await GuestsSchema.findAll({
      attributes: ["id"],
      where: { pelada_id: peladaId },
      include: [
        {
          model: UsersSchema,
          as: "user",
          attributes: ["id", "name", "email", "picture"]
        }
      ]
    });

    return invites;
  }

  async getMembers(peladaId: string): Promise<memberDTO[]> {
    const membersFromDb = await MembersSchema.findAll({
      attributes: ["role"],
      where: { pelada_id: peladaId },
      include: [
        {
          model: UsersSchema, as: "user",
          attributes: ["name", "email", "picture"],
          required: true
        }]
    });

    const members = membersFromDb.map((member) => ({
      name: member.user!.name,
      email: member.user!.email,
      picture: member.user!.picture || "",
      role: member.role as roleMember
    }));

    return members
  }

  async getMembersAsAdmin({ userId, peladaId }: { userId: string, peladaId: string }): Promise<MembersSchema[]> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário nao tem permissao para ver membros");

    const members = await MembersSchema.findAll({
      attributes: ["id", "role"],
      where: { pelada_id: peladaId },
      include: [
        {
          model: UsersSchema, as: "user",
          attributes: ["id", "name", "email", "picture"],
          required: true,
          include: [
            {
              model: PaymentHistoriesSchema,
              as: "paymentHistories",
              where: { pelada_id: peladaId },
              limit: 1,
            }
          ]
        }]
    });

    return members
  }

  async getPeladaInviteData({ userId, peladaId }: { userId?: string, peladaId: string }): Promise<PeladaInviteDTO> {
    const peladaInviteData = {} as PeladaInviteDTO
    if (userId) {
      const user = await UsersSchema.findByPk(userId, {
        attributes: [],
        include: [
          {
            model: GuestsSchema,
            as: "guest",
            attributes: ["id"],
            where: { pelada_id: peladaId },
            required: false
          },
          {
            model: MembersSchema,
            as: "member",
            attributes: ["id"],
            where: { pelada_id: peladaId },
            required: false
          }
        ]
      });

      if (!user) throw new PeladaServiceError("Usuário não encontrado");
      if (user.guest?.[0]) peladaInviteData.status = "pedding"
      else if (user.member?.[0]) peladaInviteData.status = "accepted"
      else peladaInviteData.status = "unsent"
    }

    const pelada = await PeladasSchema.findByPk(peladaId, {
      attributes: ["name", "price", "payment_day", "banner", "picture"],
      include: [
        {
          model: EventDaysSchema,
          as: "schedule",
          where: { is_active: true },
          attributes: ["day", "hour"],
          required: false
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada nao encontrada");

    const members = await MembersSchema.findAll({
      attributes: ["role"],
      where: { pelada_id: peladaId, [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }] },
      include: [
        {
          model: UsersSchema,
          as: "user",
          attributes: ["name", "picture"],
          required: true
        }]
    });

    peladaInviteData["name"] = pelada.name;
    peladaInviteData["price"] = pelada.price;
    peladaInviteData["payment_day"] = pelada.payment_day;
    peladaInviteData["banner"] = pelada.banner;
    peladaInviteData["picture"] = pelada.picture;
    peladaInviteData["schedule"] = pelada.schedule as Array<{ day: string, hour: string }>;
    peladaInviteData["members"] = members as Array<{ role: string, user: { name: string, picture: string } }>


    return peladaInviteData
  }

  // UPDATE
  async updatePelada(data: updatePeladaDTO, transaction?: Transaction): Promise<PeladasSchema> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: { user_id: data.userId, pelada_id: data.peladaId, [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }] },
      transaction
    });
    if (!member) throw new PeladaServiceError("Você não tem permissão para atualizar essa pelada");

    const pelada = await PeladasSchema.findByPk(data.peladaId, { transaction });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const newData: Partial<PeladasSchema> = {}

    if (data.newData.name) newData.name = data.newData.name;
    if (data.newData.price) newData.price = data.newData.price;
    if (data.newData.payment_day) newData.payment_day = data.newData.payment_day;
    if (data.newData.confirmation_open_hours_before_event) newData.confirmation_open_hours_before_event = data.newData.confirmation_open_hours_before_event;
    if (data.newData.confirmation_close_hours_from_event) newData.confirmation_close_hours_from_event = data.newData.confirmation_close_hours_from_event;

    await pelada.update(newData, { transaction });

    return pelada;
  }

  async updateScheduleOfPelada(data: updateScheduleDTO, transaction?: Transaction): Promise<EventDaysSchema[]> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: { user_id: data.userId, pelada_id: data.peladaId, [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }] },
      transaction
    });
    if (!member) throw new PeladaServiceError("Você não tem permissão para atualizar essa pelada");

    const pelada = await PeladasSchema.findByPk(data.peladaId, { transaction });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const schedule = await Promise.all(
      Object.entries(data.days).map(async ([dayKey, dataDay]) => {
        const dayName = dayKey as Eschedule;
        const day = await EventDaysSchema.findOne({ where: { day: dayName, pelada_id: data.peladaId }, transaction });
        if (!day) throw new PeladaServiceError("Agendamento nao encontrado");

        const newData: Partial<EventDaysSchema> = {}

        if (dataDay.hour) newData.hour = dataDay.hour;
        if (dataDay.is_active !== undefined) newData.is_active = dataDay.is_active;

        await day.update(newData, { transaction });

        return day;
      })
    );

    return schedule;
  }

  async setAdminRole({ userId, peladaId, memberId }: setAdminRoleDTO, transaction?: Transaction): Promise<{ message: string }> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId, 
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não encontrado ou você não tem permissão para essa ação");
    
    const memberToUpdate = await MembersSchema.findByPk(memberId, {
      attributes: ["role"],
    });
    if (!memberToUpdate) throw new PeladaServiceError("Usuário nao encontrado");

    if ([roleMember.ADMIN, roleMember.OWNER].includes(memberToUpdate.role)) return { message: "Usuário já tem permissão de admin" };

    memberToUpdate.role = roleMember.ADMIN;
    memberToUpdate.id = memberId;
    await memberToUpdate.save({ transaction });

    return { message: "Cargo de admin adicionado com sucesso" }
  }

  async removeAdminRole({ userId, peladaId, memberId }: setAdminRoleDTO, transaction?: Transaction): Promise<{ message: string }> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId, 
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário nao encontrado");
    
    const memberToUpdate = await MembersSchema.findByPk(memberId, {
      attributes: ["role"],
    });
    if (!memberToUpdate) throw new PeladaServiceError("Usuário nao encontrado");

    if (![roleMember.ADMIN, roleMember.OWNER].includes(memberToUpdate.role)) return { message: "Usuário já não tem o cargo de admin" };

    memberToUpdate.role = roleMember.MEMBER;
    memberToUpdate.id = memberId;
    await memberToUpdate.save({ transaction });

    return { message: "Cargo de admin removido com sucesso" }

  }

  // DELETE
  async deletePelada(id: string): Promise<boolean> {
    const pelada = await PeladasSchema.findByPk(id);
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    await pelada.destroy();
    return true;
  }

  async deleteMemberFromPelada({ userId, peladaId, memberId }: deleteMemberDTO): Promise<boolean> {
    const member = await MembersSchema.findOne({
      where: {
        user_id: userId, 
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário nao encontrado");
    
    const memberToDelete = await MembersSchema.findByPk(memberId);
    if (!memberToDelete) throw new PeladaServiceError("Usuário nao encontrado");

    await memberToDelete.destroy();
    return true
  }
}