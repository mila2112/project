import * as express from "express";
const userRouter = express.Router();
import UserController from "../controllers/users.controller";
import registerMiddleware from "../middleweares/validationMiddlewear";
import auth from "../middleweares/authentication.middlewear";

const user = new UserController();
const { reIssueToken, authenticate } = auth;

userRouter.post("/signup", registerMiddleware, user.signUp);
userRouter.post("/signin", user.signIn);
userRouter.post("/signin/new_token", reIssueToken, user.refreshToken);
userRouter.use(authenticate);
userRouter.get("/info", user.info);
userRouter.get("/logout", user.logout);

export { userRouter };
