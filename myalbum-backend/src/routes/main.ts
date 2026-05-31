import { Router, type Request, type Response } from "express";
import * as userController from "../controllers/user.js";
import { authMiddleware } from "../middleware/auth.js";
import * as collectionController from "../controllers/collection.js";
import * as tradeController from "../controllers/trade.js"

export const routes = Router();

routes.get("/ping", (req: Request, res: Response) => {
  return res.json({ pong: true });
});

routes.post("/user/register", userController.register);
routes.post("/user/login", userController.login);
routes.get("/user/dashboard", authMiddleware, userController.getDashboard);
routes.get("/user/me", authMiddleware, userController.getMe);

routes.get("/user/collection/groups", authMiddleware, userController.getCollectionGroups);
routes.get("/user/collection", authMiddleware, userController.getCollection);

routes.patch("/collection/increment", authMiddleware, collectionController.increment);
routes.patch("/collection/decrement", authMiddleware, collectionController.decrement);

routes.post("/trade/register", authMiddleware, tradeController.tradeSticker);
routes.get("/trade/history", authMiddleware, tradeController.getTradeHistory);