"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextWeekday = getNextWeekday;
function getNextWeekday(weekday, hour, // Ex: "19:00"
baseDate = new Date()) {
    const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const target = weekday.toLowerCase();
    const targetIndex = daysOfWeek.indexOf(target);
    if (targetIndex === -1) {
        throw new Error(`Dia inválido: ${weekday}. Use nomes em inglês (ex: "monday").`);
    }
    const currentDayIndex = baseDate.getDay();
    let diff = targetIndex - currentDayIndex;
    if (diff <= 0) {
        if (hour) {
            const [hh, mm] = hour.split(':').map(Number);
            const targetTime = new Date(baseDate);
            targetTime.setHours(hh, mm, 0, 0);
            if (baseDate >= targetTime) {
                diff = 7;
            }
        }
        else {
            diff = 7;
        }
    }
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + diff);
    // 🔧 Parse da hora se fornecido
    if (hour) {
        const [hh, mm] = hour.split(':').map(Number); // transforma "19:00" em [19, 0]
        nextDate.setHours(hh, mm, 0, 0); // define hora, minuto, segundo e ms
    }
    else {
        nextDate.setHours(0, 0, 0, 0); // por padrão zera o horário
    }
    return nextDate;
}
