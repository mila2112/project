import * as bcrypt from "bcrypt";
import { models } from "../../db";
import authService from "../services/auth.service";

class UserController {
  signUp = async (req, res) => {
    try {
      const { id, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await models.Users.create({
        id,
        password: hashedPassword,
      });
      res.send("You have successfully registered!");
    } catch (err) {
      res.status(400).send("Something went wrong");
      console.log("error=>", err);
    }
  };

  signIn = async (req, res) => {
    try {
      const { id, password } = req.body;
      const isUserExists = await models.Users.findOne({ where: { id } });
      if (!isUserExists) {
        res.status(400).send("User not exists");
        return;
      }
      const validPassword = await bcrypt.compare(
        password,
        isUserExists.password
      );
      if (!validPassword) {
        res.status(400).send("Credentials are invalid");
        return;
      }

      const auth = { id };
      const accessToken = await authService.signAccessToken(auth);
      const refreshToken = await authService.signRefreshToken(auth);

      const result = {
        accessToken,
        refreshToken,
      };
      res.status(200).send(result);
    } catch (err) {
      console.log("err", err);
      res.status(400).send("Something went wrong");
      console.log("error=>", err);
    }
  };

  refreshToken = async (req, res) => {
    try {
      const { id } = req.payload;

      const isUserExists = await models.Users.findOne({ where: { id } });
      if (isUserExists) {
        const auth = { id };

        const accessToken = await authService.signAccessToken(auth);
        const refreshToken = await authService.signRefreshToken(auth);

        const result = {
          accessToken,
          refreshToken,
        };

        res.status(200).send(result);
        return;
      }
      res.status(404).send({ message: "User not found" });
    } catch (err) {
      console.log("err", err);
      res.status(400).send("Something went wrong");
    }
  };

  info = async (req, res) => {
    try {
      const { id } = req.payload;
      const user = await models.Users.findOne({ where: { id } });
      const result = { id: user?.id };
      res.status(200).send(result);
    } catch (err) {
      console.log("err", err);
      res.status(400).send("Something went wrong");
    }
  };

  logout = async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const { accessToken } = req;

      await authService.removeTokenFromRedis(
        `refreshToken:${refreshToken.trim()}`
      );
      await authService.removeTokenFromRedis(
        `accessToken:${accessToken.trim()}`
      );
      res.status(200).send("Successfully logged out");
    } catch (err) {
      console.log("err", err);
      res.status(400).send("Something went wrong");
      console.log("error=>", err);
    }
  };
}

export default UserController;
