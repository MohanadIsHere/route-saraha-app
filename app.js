import express from "express";
import runServer from "./src/server.js";
const app = express();
const port = 3000;
app.listen(port, () => console.log(`saraha-app running on port ${port}! 🚀`));
runServer(express,app)
