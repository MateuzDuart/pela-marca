import { Eschedule } from "../modules/schedule";

export interface updateScheduleDTO {
  userId: string;
  peladaId: string;
  days: Record<Eschedule, { hour?: string, is_active?: boolean }>;
}