export function translateWeekDays(day: string) {
  switch (day) {
    case 'monday':
      return 'Segunda-feira';
    case 'tuesday':
      return 'Terça-feira';
    case 'wednesday':
      return 'Quarta-feira';
    case 'thursday':
      return 'Quinta-feira';
    case 'friday':
      return 'Sexta-feira';
    case 'saturday':
      return 'Sábado';
    case 'sunday':
      return 'Domingo';
    default:
      return '';
  }
} 

export function translateRole(role: string) {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'member':
      return 'Membro';
    case 'owner':
      return 'Dono';
    default:
      return '';
  }
}

export function translatePaymentStatus(status: string) {
  switch (status) {
    case 'paid':
      return 'Pago';
    case 'pending':
      return 'Pendente';
    case 'late':
      return 'Atrasado';
    default:
      return '';
  }
}