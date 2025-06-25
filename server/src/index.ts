import dotenv from "dotenv";
dotenv.config({
  path: process.env.GLOBAL_ENV || ".env"
});

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import authRouter from "./routes/v1/auth.routes";
import systemRouter from "./routes/v1/system.routes";
import { initDatabaseConnection } from "./database/database";
import initDatabase from "./database/initDatabase";
import cookieParser from "cookie-parser";

initDatabaseConnection().then(() => {
  console.log("conectado com banco de dados")
  initDatabase({ alter: true });
})

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e performance
const allowedOrigins = [
  'https://pelamarca.com',
  'https://www.pelamarca.com',
  "http://localhost:5173",
];
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('uploads/images'));
app.use('/images', express.static('uploads/images', {
  setHeaders(res, path) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use('/api/v1', authRouter);
app.use('/api/v1', systemRouter);

// Middleware de erro
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno no servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
