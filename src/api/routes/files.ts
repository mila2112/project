import * as express from "express";
const fileRouter = express.Router();
import auth from "../middleweares/authentication.middlewear";
const { authenticate } = auth;
import FilesControllers from "../controllers/files.controllers";

const fileService = new FilesControllers();
const {
  list,
  upload,
  delete: deleteFile,
  getFileInfo,
  download,
  update,
  saveFile,
} = fileService;

fileRouter.use(authenticate);
fileRouter.post("/upload", upload.single("file"), saveFile);
fileRouter.get("/list", list);
fileRouter.delete("/delete/:id", deleteFile);
fileRouter.get("/download/:id", download);
fileRouter.get("/:id", getFileInfo);
fileRouter.put("/update/:id", upload.single("file"), update);

export { fileRouter };
