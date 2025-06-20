"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const PeladaSchema_1 = require("../database/models/PeladaSchema");
const MembersSchema_1 = require("../database/models/MembersSchema");
const EventDaysSchema_1 = require("../database/models/EventDaysSchema");
const role_1 = require("../modules/role");
const UsersSchema_1 = require("../database/models/UsersSchema");
const GuestsSchema_1 = require("../database/models/GuestsSchema");
const PeladaServiceError_1 = __importDefault(require("../Errors/PeladaServiceError"));
const PaymentHistoriesSchema_1 = require("../database/models/PaymentHistoriesSchema");
exports.default = new class PeladaService {
    // CREATE
    async createPelada(data, transaction) {
        const pelada = await PeladaSchema_1.PeladasSchema.create({
            name: data.name,
            price: data.price || 0,
            payment_day: data.payment_day || 1,
        }, { transaction });
        return pelada;
    }
    async addMemberToPelada(data, transaction) {
        const member = await MembersSchema_1.MembersSchema.create({
            user_id: data.memberId,
            pelada_id: data.peladaId,
            role: data.role
        }, { transaction });
        return member;
    }
    async createScheduleOfPelada(data, transaction) {
        const schedule = await Promise.all(Object.entries(data.days).map(async ([dayKey, dataDay]) => {
            const dayName = dayKey;
            return await EventDaysSchema_1.EventDaysSchema.create({
                day: dayName,
                hour: dataDay.hour,
                is_active: dataDay.is_active || false,
                pelada_id: data.peladaId
            }, { transaction });
        }));
        return schedule;
    }
    async sendInvite(data, transaction) {
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(data.peladaId, { transaction });
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada nao encontrada");
        const member = await MembersSchema_1.MembersSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
        if (member)
            throw new PeladaServiceError_1.default("Usuário já é membro na pelada");
        const user = await UsersSchema_1.UsersSchema.findByPk(data.userId, { transaction });
        if (!user)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        const invite = await GuestsSchema_1.GuestsSchema.findOne({ where: { user_id: data.userId, pelada_id: data.peladaId }, transaction });
        if (invite)
            throw new PeladaServiceError_1.default("Convite ja foi enviado");
        await GuestsSchema_1.GuestsSchema.create({ user_id: data.userId, pelada_id: data.peladaId }, { transaction });
        return true;
    }
    async acceptInvite(data, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: data.userId,
                pelada_id: data.peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            },
            transaction
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao tem permissao para aceitar convites");
        const invite = await GuestsSchema_1.GuestsSchema.findByPk(data.inviteId, {
            attributes: ["user_id"],
            transaction
        });
        if (!invite)
            throw new PeladaServiceError_1.default("Convite nao encontrado");
        invite.id = data.inviteId;
        await invite.destroy({ transaction });
        const newMember = await MembersSchema_1.MembersSchema.create({
            user_id: invite.user_id,
            pelada_id: data.peladaId,
            role: role_1.roleMember.MEMBER
        }, { transaction });
        return newMember;
    }
    async rejectInvite(data, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: data.userId,
                pelada_id: data.peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            },
            transaction
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao tem permissao para rejeitar convites");
        const invite = await GuestsSchema_1.GuestsSchema.findByPk(data.inviteId, { transaction });
        if (!invite)
            throw new PeladaServiceError_1.default("Convite nao encontrado");
        await invite.destroy({ transaction });
    }
    // READ
    async getPeladaAsAdmin({ userId, peladaId }) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao tem permissao para ver essa pelada");
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(peladaId, {
            attributes: ["name", "price", "payment_day", "confirmation_open_hours_before_event", "confirmation_close_hours_from_event"],
            include: [
                {
                    model: EventDaysSchema_1.EventDaysSchema,
                    as: "schedule",
                    attributes: ["day", "hour", "is_active"],
                    where: {
                        hour: { [sequelize_1.Op.not]: "00:00:00" }
                    },
                    required: false
                }
            ]
        });
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada nao encontrada");
        return pelada;
    }
    async getPeladasAsMember(userId) {
        const memberPeladas = await MembersSchema_1.MembersSchema.findAll({
            attributes: [],
            where: { user_id: userId },
            include: [
                {
                    model: PeladaSchema_1.PeladasSchema,
                    as: "pelada",
                    attributes: ["id", "name"],
                },
            ],
        });
        const peladas = [
            ...memberPeladas.map((member) => member.pelada)
        ];
        return peladas;
    }
    async getPeladasAsAdmin(userId) {
        const peladas = await PeladaSchema_1.PeladasSchema.findAll({
            attributes: ["id", "name"],
            include: [
                {
                    model: MembersSchema_1.MembersSchema,
                    as: "members",
                    attributes: [],
                    where: { user_id: userId, [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }] },
                    required: true,
                },
            ],
        });
        return peladas;
    }
    async getInvites({ userId, peladaId }) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Você não tem permissão para ver os convites");
        const invites = await GuestsSchema_1.GuestsSchema.findAll({
            attributes: ["id"],
            where: { pelada_id: peladaId },
            include: [
                {
                    model: UsersSchema_1.UsersSchema,
                    as: "user",
                    attributes: ["id", "name", "email", "picture"]
                }
            ]
        });
        return invites;
    }
    async getMembers(peladaId) {
        const membersFromDb = await MembersSchema_1.MembersSchema.findAll({
            attributes: ["role"],
            where: { pelada_id: peladaId },
            include: [
                {
                    model: UsersSchema_1.UsersSchema, as: "user",
                    attributes: ["name", "email", "picture"],
                    required: true
                }
            ]
        });
        const members = membersFromDb.map((member) => ({
            name: member.user.name,
            email: member.user.email,
            picture: member.user.picture || "",
            role: member.role
        }));
        return members;
    }
    async getMembersAsAdmin({ userId, peladaId }) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao tem permissao para ver membros");
        const members = await MembersSchema_1.MembersSchema.findAll({
            attributes: ["id", "role"],
            where: { pelada_id: peladaId },
            include: [
                {
                    model: UsersSchema_1.UsersSchema, as: "user",
                    attributes: ["id", "name", "email", "picture"],
                    required: true,
                    include: [
                        {
                            model: PaymentHistoriesSchema_1.PaymentHistoriesSchema,
                            as: "paymentHistories",
                            where: { pelada_id: peladaId },
                            limit: 1,
                        }
                    ]
                }
            ]
        });
        return members;
    }
    async getPeladaInviteData({ userId, peladaId }) {
        const peladaInviteData = {};
        if (userId) {
            const user = await UsersSchema_1.UsersSchema.findByPk(userId, {
                attributes: [],
                include: [
                    {
                        model: GuestsSchema_1.GuestsSchema,
                        as: "guest",
                        attributes: ["id"],
                        where: { pelada_id: peladaId },
                        required: false
                    },
                    {
                        model: MembersSchema_1.MembersSchema,
                        as: "member",
                        attributes: ["id"],
                        where: { pelada_id: peladaId },
                        required: false
                    }
                ]
            });
            if (!user)
                throw new PeladaServiceError_1.default("Usuário não encontrado");
            if (user.guest?.[0])
                peladaInviteData.status = "pedding";
            else if (user.member?.[0])
                peladaInviteData.status = "accepted";
            else
                peladaInviteData.status = "unsent";
        }
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(peladaId, {
            attributes: ["name", "price", "payment_day", "banner", "picture"],
            include: [
                {
                    model: EventDaysSchema_1.EventDaysSchema,
                    as: "schedule",
                    where: { is_active: true },
                    attributes: ["day", "hour"],
                    required: false
                }
            ]
        });
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada nao encontrada");
        const members = await MembersSchema_1.MembersSchema.findAll({
            attributes: ["role"],
            where: { pelada_id: peladaId, [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }] },
            include: [
                {
                    model: UsersSchema_1.UsersSchema,
                    as: "user",
                    attributes: ["name", "picture"],
                    required: true
                }
            ]
        });
        peladaInviteData["name"] = pelada.name;
        peladaInviteData["price"] = pelada.price;
        peladaInviteData["payment_day"] = pelada.payment_day;
        peladaInviteData["banner"] = pelada.banner;
        peladaInviteData["picture"] = pelada.picture;
        peladaInviteData["schedule"] = pelada.schedule;
        peladaInviteData["members"] = members;
        return peladaInviteData;
    }
    // UPDATE
    async updatePelada(data, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: { user_id: data.userId, pelada_id: data.peladaId, [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }] },
            transaction
        });
        if (!member)
            throw new PeladaServiceError_1.default("Você não tem permissão para atualizar essa pelada");
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(data.peladaId, { transaction });
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada não encontrada");
        const newData = {};
        if (data.newData.name)
            newData.name = data.newData.name;
        if (data.newData.price)
            newData.price = data.newData.price;
        if (data.newData.payment_day)
            newData.payment_day = data.newData.payment_day;
        if (data.newData.confirmation_open_hours_before_event)
            newData.confirmation_open_hours_before_event = data.newData.confirmation_open_hours_before_event;
        if (data.newData.confirmation_close_hours_from_event)
            newData.confirmation_close_hours_from_event = data.newData.confirmation_close_hours_from_event;
        await pelada.update(newData, { transaction });
        return pelada;
    }
    async updateScheduleOfPelada(data, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: { user_id: data.userId, pelada_id: data.peladaId, [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }] },
            transaction
        });
        if (!member)
            throw new PeladaServiceError_1.default("Você não tem permissão para atualizar essa pelada");
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(data.peladaId, { transaction });
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada não encontrada");
        const schedule = await Promise.all(Object.entries(data.days).map(async ([dayKey, dataDay]) => {
            const dayName = dayKey;
            const day = await EventDaysSchema_1.EventDaysSchema.findOne({ where: { day: dayName, pelada_id: data.peladaId }, transaction });
            if (!day)
                throw new PeladaServiceError_1.default("Agendamento nao encontrado");
            const newData = {};
            if (dataDay.hour)
                newData.hour = dataDay.hour;
            if (dataDay.is_active !== undefined)
                newData.is_active = dataDay.is_active;
            await day.update(newData, { transaction });
            return day;
        }));
        return schedule;
    }
    async setAdminRole({ userId, peladaId, memberId }, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário não encontrado ou você não tem permissão para essa ação");
        const memberToUpdate = await MembersSchema_1.MembersSchema.findByPk(memberId, {
            attributes: ["role"],
        });
        if (!memberToUpdate)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        if ([role_1.roleMember.ADMIN, role_1.roleMember.OWNER].includes(memberToUpdate.role))
            return { message: "Usuário já tem permissão de admin" };
        memberToUpdate.role = role_1.roleMember.ADMIN;
        memberToUpdate.id = memberId;
        await memberToUpdate.save({ transaction });
        return { message: "Cargo de admin adicionado com sucesso" };
    }
    async removeAdminRole({ userId, peladaId, memberId }, transaction) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            attributes: ["role"],
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        const memberToUpdate = await MembersSchema_1.MembersSchema.findByPk(memberId, {
            attributes: ["role"],
        });
        if (!memberToUpdate)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        if (![role_1.roleMember.ADMIN, role_1.roleMember.OWNER].includes(memberToUpdate.role))
            return { message: "Usuário já não tem o cargo de admin" };
        memberToUpdate.role = role_1.roleMember.MEMBER;
        memberToUpdate.id = memberId;
        await memberToUpdate.save({ transaction });
        return { message: "Cargo de admin removido com sucesso" };
    }
    // DELETE
    async deletePelada(id) {
        const pelada = await PeladaSchema_1.PeladasSchema.findByPk(id);
        if (!pelada)
            throw new PeladaServiceError_1.default("Pelada não encontrada");
        await pelada.destroy();
        return true;
    }
    async deleteMemberFromPelada({ userId, peladaId, memberId }) {
        const member = await MembersSchema_1.MembersSchema.findOne({
            where: {
                user_id: userId,
                pelada_id: peladaId,
                [sequelize_1.Op.or]: [{ role: role_1.roleMember.OWNER }, { role: role_1.roleMember.ADMIN }]
            }
        });
        if (!member)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        const memberToDelete = await MembersSchema_1.MembersSchema.findByPk(memberId);
        if (!memberToDelete)
            throw new PeladaServiceError_1.default("Usuário nao encontrado");
        await memberToDelete.destroy();
        return true;
    }
};
