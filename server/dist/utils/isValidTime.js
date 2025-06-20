"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTime = isValidTime;
function isValidTime(time) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
    return regex.test(time);
}
