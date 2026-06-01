import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { routes } from "./routes/main.js";
import { importCsv } from "./scripts/importCsv.js";

const server = express();

server.use(
  cors({
    origin: ["https://myalbum-wc.vercel.app", "https://myalbum-wc.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
server.use(express.json());
server.use("/api", routes);

server.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  try {
    console.log("🚀 Verificando e populando banco de dados...");
    await importCsv();
    console.log("✅ Processo de importação finalizado.");
  } catch (error) {
    console.error("❌ Erro ao popular banco na inicialização:", error);
  }
});
