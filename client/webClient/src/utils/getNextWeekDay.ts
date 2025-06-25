export function getNextWeekday(
  weekday: string,
  hour?: string, // Ex: "19:00"
  baseDate: Date = new Date()
): Date {
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const;

  const target = weekday.toLowerCase() as typeof daysOfWeek[number];
  const targetIndex = daysOfWeek.indexOf(target);

  if (targetIndex === -1) {
    throw new Error(`Dia inválido: ${weekday}. Use nomes em inglês (ex: "monday").`);
  }

  const currentDayIndex = baseDate.getDay(); // 0 = domingo, 1 = segunda, ...
  let diff = targetIndex - currentDayIndex;

  if (diff <= 0) {
    diff += 7; // próxima ocorrência
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + diff);

  // 🔧 Parse da hora se fornecido
  if (hour) {
    const [hh, mm] = hour.split(':').map(Number); // transforma "19:00" em [19, 0]
    nextDate.setHours(hh, mm, 0, 0); // define hora, minuto, segundo e ms
  } else {
    nextDate.setHours(0, 0, 0, 0); // por padrão zera o horário
  }

  return nextDate;
}
