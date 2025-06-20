import { Eschedule } from "../modules/schedule";

export interface createScheduleDTO {
  peladaId: string;
  days: Record<Eschedule, { hour: string, is_active?: boolean }>;
}