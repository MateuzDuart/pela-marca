export interface PeladaPageDTO {
  name: string;
  schedule: Array<{
    day: string; // Ex: "monday"
    hour: string; // Ex: "19:00"
  }>;
  members_list: Array<{
    role: "owner" | "admin" | "member";
    name: string;
    picture: string;
  }>;
  payment_status: "paid" | "late" | "pending";
  attendance_list: Array<{
    id: string;
    name: string;
    picture: string;
  }>;
  confirmation_open_hours_before_event: number;
  confirmation_close_hours_from_event: number;
}
