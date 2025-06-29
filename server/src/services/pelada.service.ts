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
import { PaymentDTO } from "../DTO/paymentDTO";
import { EventsSchema } from "../database/models/EventsSchema";
import { EventConfirmationsSchema } from "../database/models/EventConfirmationSchema";
import { stat } from "fs";
import { checkIfOpen } from "../utils/checkIfOpen";
import { getNextAvailableDay } from "../utils/getNextAvailableDay";
import { getNextWeekday } from "../utils/getNextWeekDay";

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
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const member = await MembersSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
    if (member) throw new PeladaServiceError("Usuário já é membro na pelada");

    const user = await UsersSchema.findByPk(data.userId, { transaction });
    if (!user) throw new PeladaServiceError("Usuário não encontrado");

    const invite = await GuestsSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
    if (invite) throw new PeladaServiceError("Convite já foi enviado");

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

    if (!member) throw new PeladaServiceError("Usuário não tem permissao para aceitar convites");

    const invite = await GuestsSchema.findByPk(data.inviteId, {
      attributes: ["user_id"],
      transaction
    });
    if (!invite) throw new PeladaServiceError("Convite não encontrado");
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
    if (!member) throw new PeladaServiceError("Usuário não tem permissao para rejeitar convites");

    const invite = await GuestsSchema.findByPk(data.inviteId, { transaction });
    if (!invite) throw new PeladaServiceError("Convite não encontrado");

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
    if (!member) throw new PeladaServiceError("Usuário não tem permissao para ver essa pelada");

    const pelada = await PeladasSchema.findByPk(peladaId, {
      attributes: ["name", "price", "payment_day", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
      include: [
        {
          model: EventDaysSchema,
          as: "schedule",
          attributes: ["day", "hour", "is_active"],
          where: {
            hour: { [Op.not]: null }
          },
          required: false
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

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
          attributes: ["id", "name", "payment_day", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
          include: [
            {
              model: EventDaysSchema,
              as: "schedule",
              attributes: ["day", "hour"],
              where: {
                is_active: true
              },
              required: false
            }
          ]
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
    if (!member) throw new PeladaServiceError("Usuário não tem permissao para ver membros");

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

  async getPeladaInviteData({ userId, peladaId }: { userId: string, peladaId: string }): Promise<PeladaInviteDTO> {
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
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

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

  async getPelada({ userId, peladaId }: { userId?: string, peladaId: string }): Promise<PeladasSchema> {
    const pelada = await PeladasSchema.findByPk(peladaId, {
      attributes: ["name", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
      include: [
        {
          model: EventDaysSchema,
          as: "schedule",
          where: { is_active: true },
          attributes: ["day", "hour"],
          required: false
        },
        {
          model: MembersSchema,
          as: "members",
          attributes: ["role"],
          required: false,
          include: [
            {
              model: UsersSchema,
              as: "user",
              attributes: ["name", "email", "picture"],
              required: true
            }
          ]
        },
        {
          model: EventsSchema,
          as: 'events',
          attributes: ['id'],
          include: [
            {
              model: EventConfirmationsSchema,
              as: 'confirmations',
              attributes: ['id'],
              include: [
                {
                  model: MembersSchema,
                  as: 'member',
                  attributes: ['id'],
                  include: [
                    {
                      model: UsersSchema,
                      as: 'user',
                      attributes: ['id', 'name', 'picture'],
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const member = await MembersSchema.findOne({
      attributes: [],
      include: [
        {
          model: UsersSchema,
          as: "user",
          attributes: ["id"],
          required: false,
          include: [
            {
              model: PaymentHistoriesSchema,
              as: "paymentHistories",
              where: { pelada_id: peladaId },
              limit: 1,
            }
          ]
        }
      ],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }, { role: roleMember.MEMBER }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não tem permissão para ver essa pelada");

    const members = pelada.members?.map(member => ({
      role: member.role,
      name: member.user?.name || "Desconhecido",
      picture: member.user?.picture || "",

    })) || [];

    const attendanceList = pelada.events?.[0]?.confirmations?.map(confirmation => ({
      id: confirmation.member?.user?.id,
      name: confirmation.member?.user?.name || "Desconhecido",
      picture: confirmation.member?.user?.picture || "",
    })) || [];

    pelada.setDataValue("payment_status", member.user?.paymentHistories?.[0]?.status || "none");
    pelada.setDataValue("members_list", members);
    pelada.setDataValue("members", undefined);
    pelada.setDataValue("attendance_list", attendanceList);
    pelada.setDataValue("events", undefined)
    return pelada;
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
        if (!day) throw new PeladaServiceError("Agendamento não encontrado");

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
    if (!memberToUpdate) throw new PeladaServiceError("Usuário não encontrado");

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
    if (!member) throw new PeladaServiceError("Usuário não encontrado");

    const memberToUpdate = await MembersSchema.findByPk(memberId, {
      attributes: ["role"],
    });
    if (!memberToUpdate) throw new PeladaServiceError("Usuário não encontrado");

    if (![roleMember.ADMIN, roleMember.OWNER].includes(memberToUpdate.role)) return { message: "Usuário já não tem o cargo de admin" };

    memberToUpdate.role = roleMember.MEMBER;
    memberToUpdate.id = memberId;
    await memberToUpdate.save({ transaction });

    return { message: "Cargo de admin removido com sucesso" }

  }

  async setPaymentPending({ userId, peladaId, memberId, mouthReference }: PaymentDTO, transaction?: Transaction): Promise<{ message: string }> {
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
      attributes: [],
      include: [
        {
          model: UsersSchema,
          attributes: ["id"],
          as: "user",
          required: false,
          include: [
            {
              model: PaymentHistoriesSchema,
              as: "paymentHistories",
              attributes: ["id", "status"],
              where: { reference_month: mouthReference, pelada_id: peladaId },
              required: false,
              limit: 1,
              include: [
                {
                  model: UsersSchema,
                  as: "confirmedByUser",
                  attributes: ["name", "email"],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });

    if (!memberToUpdate) throw new PeladaServiceError("Membro não encontrado");
    const paymentHistory = memberToUpdate.user?.paymentHistories?.[0];
    if (paymentHistory) {
      if (paymentHistory.status === "pending") return { message: "Pagamento já está pendente" };
      if (paymentHistory.status === "paid") return { message: "Pagamento já foi efetuado" };

      paymentHistory.status = "pending";
      await paymentHistory.save({ transaction });
    } else {
      await PaymentHistoriesSchema.create({
        user_id: memberToUpdate.user!.id,
        pelada_id: peladaId,
        status: "pending",
        confirmed_by: userId,
        reference_month: mouthReference,
      }, { transaction });
    }

    return { message: "Pagamento pendente adicionado com sucesso" };
    // await memberToUpdate.save();
  }

  async cancelPaymentPending({ userId, peladaId, memberId, mouthReference }: PaymentDTO, transaction?: Transaction): Promise<{ message: string }> {
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
      attributes: [],
      include: [
        {
          model: UsersSchema,
          attributes: ["id"],
          as: "user",
          required: false,
          include: [
            {
              model: PaymentHistoriesSchema,
              as: "paymentHistories",
              attributes: ["id", "status"],
              where: { reference_month: mouthReference, pelada_id: peladaId },
              required: false,
              limit: 1,
              include: [
                {
                  model: UsersSchema,
                  as: "confirmedByUser",
                  attributes: ["name", "email"],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    })
    if (!memberToUpdate) throw new PeladaServiceError("Membro não encontrado");
    const paymentHistory = memberToUpdate.user?.paymentHistories?.[0];
    if (!paymentHistory) throw new PeladaServiceError("Pagamento não encontrado");
    if (paymentHistory.status === "pending") {
      paymentHistory.status = "late";
      await paymentHistory.save({ transaction });
    } else if (paymentHistory.status === "paid") {
      return { message: "Pagamento já foi efetuado, não é possível cancelar" };
    } else {
      return { message: "Pagamento já está cancelado" };
    }

    return { message: "Pagamento cancelado com sucesso" };
  }

  async setPaymentPaid({ userId, peladaId, memberId, mouthReference }: PaymentDTO, transaction?: Transaction): Promise<{ message: string }> {
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
      attributes: [],
      include: [
        {
          model: UsersSchema,
          attributes: ["id"],
          as: "user",
          required: false,
          include: [
            {
              model: PaymentHistoriesSchema,
              as: "paymentHistories",
              attributes: ["id"],
              where: { reference_month: mouthReference, pelada_id: peladaId },
              required: false,
              limit: 1,
              include: [
                {
                  model: UsersSchema,
                  as: "confirmedByUser",
                  attributes: ["name", "email"],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });
    if (!memberToUpdate) throw new PeladaServiceError("Membro não encontrado");

    const paymentHistory = memberToUpdate.user?.paymentHistories?.[0];
    if (paymentHistory) {
      paymentHistory.status = "paid";
      await paymentHistory.save({ transaction });
    } else {
      await PaymentHistoriesSchema.create({
        user_id: memberToUpdate.user!.id,
        pelada_id: peladaId,
        status: "paid",
        confirmed_by: userId,
        reference_month: mouthReference,
      }, { transaction });
    }

    return { message: "Pagamento realizado com sucesso" };
  }

  async confirmEventAttendance({ userId, peladaId }: { userId: string, peladaId: string }, transaction?: Transaction): Promise<boolean> {
    const member = await MembersSchema.findOne({
      attributes: ["id"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }, { role: roleMember.MEMBER }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não tem permissão para confirmar presença no evento");

    const pelada = await PeladasSchema.findByPk(peladaId, {
      attributes: ["id", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
      include: [
        {
          model: EventsSchema,
          as: "events",
          attributes: ["id", "status"],
          include: [
            {
              model: EventConfirmationsSchema,
              as: "confirmations",
              attributes: ["id"],
              where: { member_id: member.id },
              required: false
            }
          ]
        },
        {
          model: EventDaysSchema,
          as: "schedule",
          attributes: ["day"],
          where: { is_active: true },
          required: false
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const event = pelada.events?.[0];
    if (!event) {
      const schedule = pelada.schedule;
      if (!schedule) { throw new PeladaServiceError("Agendamento não encontrado") };

      const nextAvailableDayName = getNextAvailableDay(schedule.map(day => day.day));
      const nextAvailableDay = schedule.find(day => day.day === nextAvailableDayName);
      if (!nextAvailableDay) { throw new PeladaServiceError("Agendamento não encontrado_") };

      const nextDate = getNextWeekday(nextAvailableDay.day, nextAvailableDay.hour || undefined);
      const isEventOpen = checkIfOpen(nextDate, pelada.confirmation_open_hours_before_event!, pelada.confirmation_close_hours_from_event!);
      if (!isEventOpen) throw new PeladaServiceError("Evento está fechado para confirmações");

      const event = await EventsSchema.create({
        pelada_id: peladaId,
        status: "open",
      }, { transaction });
      await EventConfirmationsSchema.create({
        member_id: member.id,
        event_id: event.id,
      }, { transaction });
      return true;
    } else if (event.status === "closed") {
      throw new PeladaServiceError("Evento já está fechado para confirmações");
    } else if (event.status === "cancelled") {
      throw new PeladaServiceError("Evento foi cancelado");
    } else {
      if (event.confirmations?.length) throw new PeladaServiceError("Você já confirmou presenca neste evento");
      await EventConfirmationsSchema.create({
        member_id: member.id,
        event_id: event.id,
      }, { transaction });
      return true;
    }
  }

  async cancelEventAttendance({ userId, peladaId }: { userId: string, peladaId: string }, transaction?: Transaction): Promise<boolean> {
    const member = await MembersSchema.findOne({
      attributes: ["id"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }, { role: roleMember.MEMBER }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não tem permissão para cancelar presença no evento");
    const pelada = await PeladasSchema.findByPk(peladaId, {
      include: [
        {
          model: EventsSchema,
          as: "events",
          attributes: ["id", "status"],
          limit: 1
        }
      ]
    });
    if (!pelada) throw new PeladaServiceError("Pelada não encontrada");

    const event = pelada.events?.[0];
    if (!event) throw new PeladaServiceError("Evento não encontrado");
    if (event.status === "closed") throw new PeladaServiceError("Evento já está fechado para confirmações");
    if (event.status === "cancelled") throw new PeladaServiceError("Evento foi cancelado");

    const isConfirmed = await EventConfirmationsSchema.findOne({
      where: {
        member_id: member.id,
        event_id: event.id,
      }
    });

    if (isConfirmed) {
      await EventConfirmationsSchema.destroy({ where: { member_id: member.id, event_id: event.id }, transaction });
      return true;
    }

    return false

  }

  // DELETE
  async deletePelada({ userId, peladaId }: { userId: string, peladaId: string }, transaction?: Transaction): Promise<boolean> {
    const member = await MembersSchema.findOne({
      attributes: ["role"],
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não encontrado ou você não tem permissão para essa ação");

    const result = await PeladasSchema.destroy({ where: { id: peladaId }, transaction });
    return result > 0;
  }

  async deleteMemberFromPelada({ userId, peladaId, memberId }: deleteMemberDTO): Promise<boolean> {
    const member = await MembersSchema.findOne({
      where: {
        user_id: userId,
        pelada_id: peladaId,
        [Op.or]: [{ role: roleMember.OWNER }, { role: roleMember.ADMIN }]
      }
    });
    if (!member) throw new PeladaServiceError("Usuário não encontrado");

    const memberToDelete = await MembersSchema.findByPk(memberId);
    if (!memberToDelete) throw new PeladaServiceError("Usuário não encontrado");

    await memberToDelete.destroy();
    return true
  }
}