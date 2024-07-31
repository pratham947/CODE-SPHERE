import {
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createDir, writeFile } from "./fs";
import path from "path";
import { Readable } from "stream";

const client = new S3Client({
  region: "auto",
  endpoint: "https://5ee470cf7f9f22ff352a4f05d3cfb264.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "f90e37a6250d50037f3b5898d7bf574e",
    secretAccessKey:
      "9599589893717e583d9d71cf2d865910942acd13d893a544142e381e8ce754f2",
  },
});

const copyFolder = async (source: string, destination: string) => {
  try {
    const listParams = {
      Bucket: "boilerplate",
      Prefix: source,
    };

    const res = await client.send(new ListObjectsV2Command(listParams));

    if (!res || res.Contents?.length == 0) return;

    res.Contents?.map(async (obj) => {
      const Key = obj.Key;

      if (!Key) return;

      const copyParams = {
        Bucket: "code",
        CopySource: `boilerplate/${Key}`,
        Key: Key.replace(source, destination),
      };

      const res = await client.send(new CopyObjectCommand(copyParams));
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchDir = async (project_id: string, upload_dir: string) => {
  try {
    const listParams = {
      Bucket: "code",
      Prefix: project_id,
    };

    const res = await client.send(new ListObjectsV2Command(listParams));

    if (!res || res.Contents?.length == 0) return;

    createDir(upload_dir);

    await Promise.all(
      res.Contents?.map(async (obj) => {
        const Key = obj.Key;
        if (!Key) return;

        const getBodyParams = {
          Bucket: "code",
          Key,
        };

        const getObjectRes = await client.send(
          new GetObjectCommand(getBodyParams)
        );

        if (getObjectRes.Body) {
          if (getObjectRes.Body instanceof Readable) {
            const fileData = await StreamToBuffer(getObjectRes.Body);
            const root_path = path.join(
              upload_dir,
              Key.replace(project_id, "")
            );
            writeFile(root_path, fileData);
          }
        }
      }) || []
    );
  } catch (error) {
    console.log(error);
  }
};

const saveToS3 = async (Key: string, file_data: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const updateParams = {
      Bucket: "code",
      Key,
      Body: file_data,
    };

    const res = await client.send(new PutObjectCommand(updateParams));

    console.log(res);
    

    if (res) resolve(true);
    else reject(false);
  });
};

const StreamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error: any) => reject("error"));
  });
};

export { copyFolder, fetchDir, saveToS3 };
