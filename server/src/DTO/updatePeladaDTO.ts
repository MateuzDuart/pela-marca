export interface updatePeladaDTO {
  userId: string;
  peladaId: string;
  newData: {
    name?: string;
    price?: number;
    payment_day?: number;
    confirmation_open_hours_before_event?: number;
    confirmation_close_hours_from_event?: number
  };
}