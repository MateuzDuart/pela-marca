"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PeladaServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "PeladaServiceError";
    }
}
exports.default = PeladaServiceError;
