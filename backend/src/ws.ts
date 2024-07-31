import { Server as httpServer } from "http";
import { Server } from "socket.io";
import { fetchDir, saveToS3 } from "./aws";
import path, { relative } from "path";
import { fetchContent, fetchContentsDir, saveToLocal } from "./fs";
import { runCode } from "./code";

export function initWs(httpServer: httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    const replId = socket.handshake.query.roomId as string;

    if (!replId) {
      socket.disconnect();
      return;
    }

    socket.emit("main", replId);

    await fetchDir(replId, path.join(__dirname, `../temp/${replId}`));
    socket.emit("rootContent", {
      rootContent: fetchContentsDir(
        path.join(__dirname, path.join(`../temp/${replId}`))
      ),
    });

    socket.on("fetchContent", async (data, callback) => {
      console.log(data);
      const res = await fetchContent(data.Path);
      callback({ data: res });
    });

    socket.on("saveToLocal", async (data) => {
      const res = await saveToLocal(data.filePath, data.code);
      if (res) console.log("Updated");
      else console.log("error occured");
    });

    socket.on("saveToS3", async (data) => {
      const filePath = data.filePath;

      const relativePath = path.relative(
        path.join(__dirname, "../temp"),
        filePath
      );

      const Key = `${path.dirname(relativePath)}/${path.basename(
        relativePath
      )}`;

      const res = await saveToS3(Key, data.code);

      if (res) console.log("updated to s3");
    });

    socket.on("runCode", async (file_path,callback) => {
      const res = await runCode(file_path);
      callback({res});
    });
  });
}
