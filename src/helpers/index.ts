import fs from "fs";
import multer, { FileFilterCallback, MulterError, Multer } from "multer";
import { Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import { Error } from "sequelize";
import { ALLOWED_FILE_EXT } from "../config/constants";

let filePath;
let mimietype: string;
let fileExtension: string;
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename?: string) => void;

const uploadDir = path.join(__dirname, "../../", "uploads");
const uploadSingle = multer({ dest: "./uploads" });

const stat = async () => {
  try {
    const isExist = !fs.existsSync(uploadDir);
    if (isExist) {
      fs.mkdirSync(uploadDir);
    }
    return { msg: "Directories successfully created" };
  } catch (err) {
    return err;
  }
};

const storage = multer.diskStorage({
  destination(req, file, callback: DestinationCallback) {
    callback(null, uploadDir);
  },
  filename(req, file, cb: FileNameCallback) {
    crypto.pseudoRandomBytes(4, (err, raw) => {
      filePath = raw.toString("hex") + file.originalname;
      mimietype = file.mimetype;
      fileExtension = path.extname(file.originalname);
      if (err) return cb(err);
      cb(null, filePath);
    });
  },
});
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.originalname === "blob" ||
    ALLOWED_FILE_EXT.includes(path.extname(file.originalname))
  ) {
    cb(null, true);
  } else {
    // @ts-ignore
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2000000 },
}).single("file");

export async function uploadSingleFile() {
  return uploadSingle.single("file");
}

export async function uploadFile(
  req: Request & { files: { file } },
  res: Response
) {
  try {
    await stat();
    const size = 0;
    return new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          reject(err);
        }
        resolve({
          filePath: `/${filePath}`,
          directory: `${uploadDir}`,
          mimietype,
          fileExtension,
          size,
        });
      });
      filePath = null;
    });
  } catch (err) {
    return err;
  }
}

export function deleteFile(url, id) {
  const pathImage = path.join(
    __dirname,
    "../../",
    `./uploads/profilePictures/${id}`,
    url || "image"
  );
  if (fs.existsSync(pathImage)) {
    fs.unlinkSync(pathImage);
  }
  return "ok";
}
