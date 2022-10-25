import fs from "fs";
import multer, { StorageEngine } from "multer";
import crypto from "crypto";
import { Error } from "sequelize";
import path from "path";
import { models } from "../../db";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename?: string) => void;

export default class FilesControllers {
  protected uploadDir: string;
  protected storage: StorageEngine;
  public upload: multer.Multer;
  private model: any;

  constructor() {
    this.model = models.Files;
    this.uploadDir = "./uploads";
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir);
    }

    this.storage = multer.diskStorage({
      destination(req, file, callback: DestinationCallback) {
        callback(null, "./uploads");
      },
      filename(req, file, cb: FileNameCallback) {
        crypto.pseudoRandomBytes(4, (err, buffer) => {
          if (!err) {
            const newFileName = `${buffer.toString("hex")}-${
              file.originalname
            }`;
            cb(null, newFileName);
          }
        });
      },
    });

    this.upload = multer({
      storage: this.storage,
    });
  }

  saveFile = async (req, res) => {
    try {
      const extension = path.extname(req.file.originalname);

      await this.model.create({
        name: req.file.filename,
        extension,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
      res.status(200).send(req.file);
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };

  list = async (req, res) => {
    try {
      const { list_size = 10, page = 1 } = req.query;
      const limit = list_size;
      const offset = (page - 1) * list_size;

      const list = await this.model.findAndCountAll({
        limit,
        offset,
      });

      res.status(200).send(list);
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;

      const file = await this.model.findOne({ where: { id } });

      if (!file) {
        res.status(404).send("File not Found");
        return;
      }

      const path = `${this.uploadDir}/${file.name}`;

      await this.model.destroy({ where: { id } });

      await fs.promises.unlink(path);
      res.sendStatus(200);
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };

  getFileInfo = async (req, res) => {
    try {
      const { id } = req.params;

      const file = await this.model.findOne({ where: { id } });

      if (!file) {
        res.status(404).send("File not Found");
        return;
      }

      res.send(file);
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };

  download = async (req, res) => {
    try {
      const { id } = req.params;

      const file = await this.model.findOne({ where: { id } });

      if (!file) {
        res.status(404).send("File not Found");
        return;
      }
      const path = `${this.uploadDir}/${file.name}`;

      res.download(path);
      return;
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const oldFile = await this.model.findOne({ where: { id } });
      if (!oldFile) res.status(404).send("File Not found");

      const oldFilePath = `${this.uploadDir}/${oldFile.name}`;
      const extension = path.extname(req.file.originalname);

      const newFile = await this.model.update(
        {
          name: req.file.filename,
          extension,
          size: req.file.size,
          mimeType: req.file.mimetype,
          updateAt: new Date(),
        },
        { where: { id } }
      );

      await fs.promises.unlink(oldFilePath);
      res.status(200).send({ ...req.file, newFile });
    } catch (e) {
      res.status(400).send("File upload Failed");
    }
  };
}
