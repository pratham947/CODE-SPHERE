import express from "express";
import { copyFolder } from "./aws";
import { createServer } from "http";
import cors from "cors"
import { initWs } from "./ws";

const app = express();
app.use(cors());
const httpserver = createServer(app);

app.use(express.json());

initWs(httpserver);

app.post("/create", async (req, res) => {
  const { type, project_id } = req.body;

  if (!type || !project_id) res.send("please send all the fields");

  try {
    copyFolder(type, project_id);
  } catch (error) {
    console.log(error);
  }
});

const port = 8000;

httpserver.listen(port);
