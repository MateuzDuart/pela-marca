"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.GLOBAL_ENV || ".env"
});
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/v1/auth.routes"));
const system_routes_1 = __importDefault(require("./routes/v1/system.routes"));
const database_1 = require("./database/database");
const initDatabase_1 = __importDefault(require("./database/initDatabase"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, database_1.initDatabaseConnection)().then(() => {
    console.log("conectado com banco de dados");
    (0, initDatabase_1.default)({ alter: true });
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares de segurança e performance
const allowedOrigins = [
    'https://pelamarca.com',
    'https://www.pelamarca.com',
];
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origem não permitida: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(express.static('uploads/images'));
app.use('/images', express_1.default.static('uploads/images', {
    setHeaders(res, path) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));
app.use('/api/v1', auth_routes_1.default);
app.use('/api/v1', system_routes_1.default);
// Middleware de erro
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Erro interno no servidor" });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
