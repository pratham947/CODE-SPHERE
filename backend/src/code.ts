import { exec } from "child_process";

export const runCode = (file_path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`node ${file_path}`, (err, stdout, stderr) => {
      if (err) {
        resolve(`Error ${err}`);
        return;
      }

      if (stderr) {
        resolve(stderr);
        return;
      }

      resolve(stdout);
    });
  });
};
