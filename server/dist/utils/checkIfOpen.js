"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfOpen = checkIfOpen;
function checkIfOpen(eventDate, confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent) {
    const now = new Date();
    const openTime = new Date(eventDate);
    openTime.setHours(eventDate.getHours() - confirmationOpenHoursBeforeEvent);
    const closeTime = new Date(eventDate);
    closeTime.setHours(eventDate.getHours() - confirmationCloseHoursFromEvent);
    return now >= openTime && now <= closeTime;
}
