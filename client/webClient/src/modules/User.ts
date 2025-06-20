export default interface User {
  id?: string;
  name: string;
  email: string;
  picture: string;
  paymentHistories?: Array<{
    reference_month: string,
    status: 'paid' | 'pending' | 'unpaid'
  }>;
}