"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UsersSchema_1 = require("../database/models/UsersSchema");
const userUpdateSchema_1 = __importDefault(require("../zodSchemas/userUpdateSchema"));
const database_1 = require("../database/database");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pelada_service_1 = __importDefault(require("../services/pelada.service"));
const createPeladaSchema_1 = require("../zodSchemas/createPeladaSchema");
const user_service_1 = __importDefault(require("../services/user.service"));
const zod_1 = require("zod");
const role_1 = require("../modules/role");
const updatePeladaSchema_1 = require("../zodSchemas/updatePeladaSchema");
const PeladaServiceError_1 = __importDefault(require("../Errors/PeladaServiceError"));
const acceptInviteSchema_1 = require("../zodSchemas/acceptInviteSchema");
const getMemberSchema_1 = require("../zodSchemas/getMemberSchema");
const paymentActionSchema_1 = require("../zodSchemas/paymentActionSchema");
exports.default = new class SystemController {
    async home(req, res) {
        return res.status(200).json({
            message: 'Bem-vindo ao sistema de autenticação',
            status: 'success',
        });
    }
    async getUserData(req, res) {
        const userId = req.userId;
        const user = await UsersSchema_1.UsersSchema.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'picture'],
        });
        if (!user) {
            return res.status(404).json({
                message: 'Usuário não encontrado',
                status: 'error',
            });
        }
        return res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
        });
    }
    async updateProfile(req, res) {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const transaction = await database_1.sequelize.transaction();
        const uploadedFile = req.file?.filename;
        const imagePath = uploadedFile
            ? path_1.default.resolve(__dirname, "..", "..", "uploads", uploadedFile)
            : undefined;
        try {
            // Validação do nome
            let name;
            if (req.body.name) {
                const result = userUpdateSchema_1.default.safeParse({ name: req.body.name });
                if (!result.success) {
                    throw new Error(result.error.errors[0].message);
                }
                name = result.data.name;
            }
            // Atualização dos dados
            const user = await UsersSchema_1.UsersSchema.findByPk(userId, { attributes: ['id', 'picture'], transaction: transaction });
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            const updateData = {};
            if (name)
                updateData.name = name;
            if (uploadedFile)
                updateData.picture = uploadedFile;
            const isGooglePicute = user.picture?.startsWith('https://lh3.googleusercontent.com/a/');
            // Apaga a imagem se ela já foi salva
            if (!isGooglePicute && user.picture) {
                const oldImagePath = path_1.default.resolve(__dirname, "..", "..", "uploads", "images", user.picture);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            await user.update(updateData, { transaction: transaction });
            await transaction.commit();
            return res.status(200).json({
                message: "Perfil atualizado com sucesso",
            });
        }
        catch (err) {
            await transaction.rollback();
            // Apaga a imagem se ela já foi salva
            if (imagePath && fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
            console.error("Erro ao atualizar perfil:", err);
            return res.status(400).json({
                message: err instanceof Error ? err.message : "Erro ao atualizar perfil",
            });
        }
    }
    // tudo para baixo já está usando services
    async createPelada(req, res) {
        const userId = req.userId;
        const schedule = {
            monday: { hour: null },
            tuesday: { hour: null },
            wednesday: { hour: null },
            thursday: { hour: null },
            friday: { hour: null },
            saturday: { hour: null },
            sunday: { hour: null },
        };
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = createPeladaSchema_1.createPeladaSchema.parse(req.body || {});
            const userExists = await user_service_1.default.checkIfUserExists(userId);
            if (!userExists) {
                throw new Error("Usuário nao encontrado");
            }
            const pelada = await pelada_service_1.default.createPelada(data, transaction);
            await pelada_service_1.default.addMemberToPelada({
                memberId: userId,
                peladaId: pelada.id,
                role: role_1.roleMember.OWNER
            }, transaction);
            await pelada_service_1.default.createScheduleOfPelada({ days: { ...schedule, ...data.schedule }, peladaId: pelada.id }, transaction);
            await transaction.commit();
            return res.status(201).json({
                message: "Pelada criada com sucesso",
                id: pelada.id
            });
        }
        catch (err) {
            await transaction.rollback();
            if (err instanceof zod_1.ZodError) {
                return res.status(400).json({ message: err.issues[0].message });
            }
            if (err instanceof PeladaServiceError_1.default) {
                return res.status(400).json({
                    message: err instanceof Error ? err.message : "Erro ao criar pelada",
                });
            }
            return res.status(400).json({
                message: "Erro ao criar pelada",
            });
        }
    }
    async getPeladasAsMember(req, res) {
        const userId = req.userId;
        try {
            const peladas = await pelada_service_1.default.getPeladasAsMember(userId);
            return res.status(200).json(peladas);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async getPeladasAsAdmin(req, res) {
        const userId = req.userId;
        try {
            const peladas = await pelada_service_1.default.getPeladasAsAdmin(userId);
            return res.status(200).json(peladas);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
                return res.status(400).json({
                    message: error instanceof Error ? error.message : "Erro ao buscar peladas",
                });
            }
            return res.status(400).json({
                message: "Erro ao buscar peladas",
            });
        }
    }
    async updatePelada(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = updatePeladaSchema_1.updatePeladaSchema.parse(req.body || {});
            await pelada_service_1.default.updatePelada({ userId, peladaId, newData: data }, transaction);
            const days = data.schedule;
            if (days) {
                await pelada_service_1.default.updateScheduleOfPelada({ userId, peladaId, days }, transaction);
            }
            await transaction.commit();
            return res.status(200).json({ message: "Pelada atualizada com sucesso" });
        }
        catch (err) {
            await transaction.rollback();
            if (err instanceof zod_1.ZodError) {
                return res.status(400).json({ message: err.issues[0].message });
            }
            if (err instanceof PeladaServiceError_1.default) {
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
    async sendInvite(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            await pelada_service_1.default.sendInvite({ userId, peladaId }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: "Convite enviado com sucesso" });
        }
        catch (err) {
            await transaction.rollback();
            if (err instanceof PeladaServiceError_1.default) {
                return res.status(400).json({
                    message: err instanceof Error ? err.message : "Erro ao enviar convite",
                });
            }
            return res.status(400).json({
                message: "Erro ao enviar convite",
            });
        }
    }
    async getInvites(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        try {
            const invites = await pelada_service_1.default.getInvites({ userId, peladaId });
            return res.status(200).json(invites);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async acceptInvite(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = acceptInviteSchema_1.acceptInviteSchema.parse(req.body || {});
            await pelada_service_1.default.acceptInvite({ userId, peladaId, inviteId: data.invite_id }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: "Convite aceito com sucesso" });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ message: error.issues[0].message });
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async rejectInvite(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = acceptInviteSchema_1.acceptInviteSchema.parse(req.body || {});
            await pelada_service_1.default.rejectInvite({ userId, peladaId, inviteId: data.invite_id }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: "Convite rejeitado com sucesso" });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ message: error.issues[0].message });
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async getMembers(req, res) {
        const peladaId = req.params.id;
        try {
            const members = await pelada_service_1.default.getMembers(peladaId);
            return res.status(200).json(members);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
                return res.status(400).json({
                    message: error instanceof Error ? error.message : "Erro ao buscar membros",
                });
            }
            return res.status(400).json({
                message: "Erro ao buscar membros",
            });
        }
    }
    async getMembersAsAdmin(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        try {
            const members = await pelada_service_1.default.getMembersAsAdmin({ userId, peladaId });
            return res.status(200).json(members);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async getPeladaAsAdmin(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        try {
            const pelada = await pelada_service_1.default.getPeladaAsAdmin({ userId, peladaId });
            return res.status(200).json(pelada);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async getPeladaInviteData(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        console.log(userId);
        try {
            const data = await pelada_service_1.default.getPeladaInviteData({ userId, peladaId });
            return res.status(200).json(data);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async deleteMember(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        try {
            const data = getMemberSchema_1.getMemberSchema.parse(req.query || {});
            await pelada_service_1.default.deleteMemberFromPelada({ userId, peladaId, memberId: data.member_id });
            return res.status(200).json({ message: "Membro excluído com sucesso" });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ message: error.issues[0].message });
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async setAdminRole(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = getMemberSchema_1.getMemberSchema.parse(req.body || {});
            const response = await pelada_service_1.default.setAdminRole({ userId, peladaId, memberId: data.member_id }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: response.message });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ message: error.issues[0].message });
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async removeAdminRole(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = getMemberSchema_1.getMemberSchema.parse(req.body || {});
            const response = await pelada_service_1.default.removeAdminRole({ userId, peladaId, memberId: data.member_id }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: response.message });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ message: error.issues[0].message });
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async setPaymentPending(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = paymentActionSchema_1.paymentActionSchema.parse(req.body || {});
            const response = await pelada_service_1.default.setPaymentPending({
                userId,
                peladaId,
                memberId: data.member_id,
                mouthReference: data.mouth_reference
            }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: response.message });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).send(error);
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async cancelPaymentPending(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = paymentActionSchema_1.paymentActionSchema.parse(req.body || {});
            const response = await pelada_service_1.default.cancelPaymentPending({
                userId,
                peladaId,
                memberId: data.member_id,
                mouthReference: data.mouth_reference
            }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: response.message });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).send(error);
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async setPaymentPaid(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const data = paymentActionSchema_1.paymentActionSchema.parse(req.body || {});
            const response = await pelada_service_1.default.setPaymentPaid({
                userId,
                peladaId,
                memberId: data.member_id,
                mouthReference: data.mouth_reference
            }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: response.message });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).send(error);
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async deletePelada(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            await pelada_service_1.default.deletePelada({ userId, peladaId }, transaction);
            await transaction.commit();
            return res.status(200).json({ message: "Pelada excluída com sucesso" });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof PeladaServiceError_1.default) {
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
    async getPelada(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        try {
            const pelada = await pelada_service_1.default.getPelada({ userId, peladaId });
            return res.status(200).json(pelada);
        }
        catch (error) {
            if (error instanceof PeladaServiceError_1.default) {
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
    async confirmEventAttendance(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const isConfirmed = await pelada_service_1.default.confirmEventAttendance({
                userId,
                peladaId,
            }, transaction);
            await transaction.commit();
            if (isConfirmed) {
                return res.status(200).json({ message: "Presença confirmada com sucesso" });
            }
            else {
                return res.status(400).json({ message: "Você já confirmou presença neste evento" });
            }
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof zod_1.ZodError) {
                return res.status(400).send(error);
            }
            if (error instanceof PeladaServiceError_1.default) {
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
    async cancelEventAttendance(req, res) {
        const userId = req.userId;
        const peladaId = req.params.id;
        const transaction = await database_1.sequelize.transaction();
        try {
            const isConfirmed = await pelada_service_1.default.cancelEventAttendance({
                userId,
                peladaId,
            }, transaction);
            await transaction.commit();
            if (isConfirmed) {
                return res.status(200).json({ message: "Presença cancelada com sucesso" });
            }
            else {
                return res.status(400).json({ message: " Você ainda não confirmou presença neste evento" });
            }
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof PeladaServiceError_1.default) {
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
};
