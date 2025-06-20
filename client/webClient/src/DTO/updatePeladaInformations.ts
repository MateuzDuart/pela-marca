import type { schedule } from "../modules/schedule";

export interface updatePeladaInformations {
  name?: string;
  price?: number;
  paymentDay?: number;
  schedule?: schedule;
  confirmationOpenHoursBeforeEvent?: number;
  confirmationCloseHoursFromEvent?: number
}