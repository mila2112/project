import Validator from "fastest-validator";
import { UserValidator } from "../validation/schemas/userValidator";
const v = new Validator();

const registerMiddleware = async (req, res, next) => {
  const validate = v.compile(UserValidator.schema);
  const result = validate(req.body);
  if (Array.isArray(result)) {
    return res.status(409).json(result);
  }
  next();
};

export default registerMiddleware;
