import connectToDatabase from "./db/connection.db.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";

const runServer = (express, app) => {
  app.use(express.json());
  // Connect To Database
  connectToDatabase();

  // Routes & Endpoints
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.get("/", (req, res) => {
    return res.send("Hello World 🚀 !");
  });

  app.use(/(.*)/, (req, res) => {
    return res.status(404).json({ message: "Route not found" });
  });

  // Error Middleware
  app.use(errorMiddleware)
};
export default runServer;
