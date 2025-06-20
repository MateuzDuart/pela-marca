import type { PeladaInviteDTO } from "../DTO/PeladaInviteDTO";
import type { updatePeladaInformations } from "../DTO/updatePeladaInformations";
import type { Invite } from "../modules/Invite";
import type { Member } from "../modules/Member";
import type Pelada from "../modules/Pelada";
import type { DaysOfTheWeek, schedule } from "../modules/schedule";
import type User from "../modules/User";
import { Instance } from "./instance";

const base = "/api/v1"

export async function getUserdata(): Promise<User> {
  const res = (await Instance.get(base + "/user")).data

  return {
    name: res.name,
    email: res.email,
    picture: res.picture
  }

}

export async function updateUser(nome: string, picture: File | null): Promise<void> {
  const formData = new FormData();
  formData.append("name", nome);
  if (picture) {
    formData.append("image", picture);
  }

  await Instance.patch(base + "/user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}

export async function getMyPeladas(): Promise<Pelada[]> {
  const data = (await Instance.get(base + "/my-peladas")).data

  return data.map((pelada: any) => ({
    id: pelada.id,
    name: pelada.name,
  }));
}

export async function getMyPeladasAsAdmin(): Promise<Pelada[]> {
  const data = (await Instance.get(base + "/my-peladas-as-admin")).data

  return data.map((pelada: any) => ({
    id: pelada.id,
    name: pelada.name,
  }));
}

export async function createPelada(data: { name: string, schedule: schedule, paymentDay: number, price: number }): Promise<{ message: string }> {
  const res = (await Instance.post(base + "/pelada", data)).data;

  return res
}

export async function getMembersAsAdmin(peladaId: string): Promise<Array<Member>> {
  const res = (await Instance.get(base + `/members-as-admin/${peladaId}`)).data

  return res
}

export async function getInvites(peladaId: string): Promise<Array<Invite>> {
  const res = (await Instance.get(base + `/invites/${peladaId}`)).data

  return res
}

export async function getPeladaAsAdmin(peladaId: string): Promise<Omit<Pelada, "id">> {
  const res = (await Instance.get(base + `/pelada-as-admin/${peladaId}`)).data

  const schedule = {} as schedule;
  for (const day in res.schedule) {
    schedule[res.schedule[day].day as DaysOfTheWeek] = {
      hour: res.schedule[day].hour,
      isActive: res.schedule[day].is_active
    };
  }
  return {
    name: res.name,
    price: res.price,
    paymentDay: res.payment_day,
    confirmationCloseHoursFromEvent: res.confirmation_close_hours_from_event,
    confirmationOpenHoursBeforeEvent: res.confirmation_open_hours_before_event,
    schedule
  }
}

export async function updatePeladaInformations(peladaId: string, data: updatePeladaInformations): Promise<{ message: string }> {
  const dataToUpdate: {
    name?: string
    price?: number
    payment_day?: number
    schedule?: Record<DaysOfTheWeek, { hour: string, is_active: boolean }>
    confirmation_open_hours_before_event?: number
    confirmation_close_hours_from_event?: number
  } = {}
  if (data.name) dataToUpdate["name"] = data.name
  if (data.price) dataToUpdate["price"] = data.price
  if (data.paymentDay) dataToUpdate["payment_day"] = data.paymentDay
  if (data.schedule) {
    const schedule = {} as Record<DaysOfTheWeek, { hour: string, is_active: boolean }>

    for (const day of Object.keys(data.schedule)) {
      const dayData = data.schedule[day as DaysOfTheWeek]
      if (dayData.hour === "") { continue }

      schedule[day as DaysOfTheWeek] = {
        hour: dayData.hour,
        is_active: dayData.isActive
      }
    }
    dataToUpdate["schedule"] = schedule
  }
  if (data.confirmationOpenHoursBeforeEvent) dataToUpdate["confirmation_open_hours_before_event"] = data.confirmationOpenHoursBeforeEvent
  if (data.confirmationCloseHoursFromEvent) dataToUpdate["confirmation_close_hours_from_event"] = data.confirmationCloseHoursFromEvent

  const res = (await Instance.patch(base + `/pelada/${peladaId}`, dataToUpdate)).data

  return res
}

export async function getPeladaInviteData(peladaId: string): Promise<PeladaInviteDTO> {
  const res = (await Instance.get(base + `/invite/${peladaId}`)).data

  return res
}

export async function sendInvite(peladaId: string): Promise<{ message: string }> {
  const res = (await Instance.post(base + `/send-invite/${peladaId}`)).data

  return res
}

export async function acceptInvite(peladaId: string, inviteId: string): Promise<{ message: string, id: string }> {
  const res = (await Instance.post(base + `/accept-invite/${peladaId}`, { invite_id: inviteId })).data

  return { message: res.message, id: inviteId }
}

export async function rejectInvite(peladaId: string, inviteId: string): Promise<{ message: string, id: string }> {
  const res = (await Instance.post(base + `/reject-invite/${peladaId}`, { invite_id: inviteId })).data

  return { message: res.message, id: inviteId }
}

export async function exludeMember(peladaId: string, memberId: string): Promise<{ message: string, id: string }> {
  const res = (await Instance.delete(base + `/member/${peladaId}?member_id=${memberId}`)).data;

  return { message: res.message, id: memberId }
}

export async function setAdminRole(peladaId: string, memberId: string): Promise<{ message: string, id: string }> {
  const res = (await Instance.patch(base + `/member-role/${peladaId}`, { member_id: memberId })).data;

  return { message: res.message, id: memberId }
}

export async function removeAdminRole(peladaId: string, memberId: string): Promise<{ message: string, id: string }> {
  const res = (await Instance.patch(base + `/remove-member-role/${peladaId}`, { member_id: memberId })).data;

  return { message: res.message, id: memberId }
}