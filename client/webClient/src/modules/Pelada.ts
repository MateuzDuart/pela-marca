import type { schedule } from "./schedule";

export default interface Pelada {
  id: string;
  name: string;
  price?: number;
  paymentDay?: number;
  confirmationOpenHoursBeforeEvent?: number;
  confirmationCloseHoursFromEvent?: number;
  schedule?: schedule;
}