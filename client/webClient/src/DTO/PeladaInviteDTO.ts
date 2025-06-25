export interface PeladaInviteDTO {
  name: string
  price: number
  payment_day: number
  banner: string
  picture: string
  schedule: Array<{
    day: string
    hour: string
  }>
  status?: "pedding" | "accepted" | "unsent"
  members: Array<{
    role: string
    user: {
      name: string
      picture: string
      // email: string
    }
  }>;
}