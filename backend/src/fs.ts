import fs from "fs";
import path from "path";
import { File } from "./types";
import { exec } from "child_process";

const createDir = (root_path: string) => {
  if (!fs.existsSync(root_path)) {
    fs.mkdirSync(root_path, { recursive: true });
    console.log(`Directory created successfully: ${root_path}`);
  }
};

// @ts-ignore
const writeFile = (root_path: string, file_data: any) => {
  const dir = path.dirname(root_path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(root_path, file_data);
  console.log(`File written successfully: ${root_path}`);
};

const fetchContentsDir = (root_path: string) => {
  const filesAndDir: File[] = [];

  const files = fs.readdirSync(root_path, { withFileTypes: true });

  files.map((file) => {
    const fileobj: File = {
      fileName: file.name,
      type: file.isDirectory() ? "Dir" : "File",
      filePath: path.join(root_path, file.name),
    };
    filesAndDir.push(fileobj);
  });
  return filesAndDir;
};

const fetchContent = (file_path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file_path, "utf8", (err, res) => {
      if (err) reject("file not found");
      resolve(res);
    });
  });
};

const saveToLocal = (
  file_path: string,
  file_code: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file_path, file_code, (err) => {
      if (err) {
        reject(false);
        return;
      }

      resolve(true);
    });
  });
};

export { createDir, writeFile, fetchContentsDir, fetchContent, saveToLocal };
