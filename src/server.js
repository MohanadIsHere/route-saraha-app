import connectToDatabase from "./db/connection.db.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import cors from "cors";
import "./utils/events/email/sendEmail.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const runServer = (express, app) => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30, // Limit each IP to 30 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    },
  });

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(limiter);

  // Connect To Database
  connectToDatabase();

  // Routes & Endpoints
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.get("/", (req, res) => {
    return res.json({
      message: "Welcome to route saraha app 👋🏼!",
      success: true,
    });
  });

  app.use(/(.*)/, (req, res) => {
    return res.status(404).json({ message: "Route not found" });
  });

  // Error Middleware
  app.use(errorMiddleware);
};
export default runServer;
