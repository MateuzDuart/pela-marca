"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextAvailableDay = getNextAvailableDay;
function getNextAvailableDay(days, baseDate = new Date()) {
    const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const currentDayIndex = baseDate.getDay();
    // Normaliza a lista de dias e mapeia para índice
    const targetIndices = days.map(day => {
        const index = daysOfWeek.indexOf(day.toLowerCase());
        if (index === -1)
            throw new Error(`Dia inválido: ${day}`);
        return index;
    });
    let minDiff = Infinity;
    let nextDayIndex = -1;
    for (const targetIndex of targetIndices) {
        let diff = targetIndex - currentDayIndex;
        if (diff <= 0)
            diff += 7; // Próxima ocorrência
        if (diff < minDiff) {
            minDiff = diff;
            nextDayIndex = targetIndex;
        }
    }
    return daysOfWeek[nextDayIndex]; // retorna o nome em inglês
}
