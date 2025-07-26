import express from "express";
import runServer from "./src/server.js";
import { PORT } from "./src/config/env.js";
const app = express();
const port = PORT || 5000;
app.listen(port, () => console.log(`saraha-app running on port ${port}! 🚀`));
runServer(express, app);
