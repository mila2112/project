import authService from "../services/auth.service";

class AuthenticationMiddleware {
  async authenticate(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        res.status(401).send("Token not provided");
      }
      const token = authorization.split("Bearer ")[1].trim();

      if (!token) {
        res.status(401).send("Token not provided");
      }
      const isTokenExistOnRedis = await authService.getTokenFromRedis(
        `accessToken:${token}`
      );

      if (!isTokenExistOnRedis) {
        res.status(401).send("Invalid token");
      }
      const isAccessTokenVerified = await authService.verifyAccessToken(token);
      if (!isAccessTokenVerified) {
        res.status(401).send("Invalid token");
      }
      authService.setTokenToRedis(
        `accessToken:${token}`,
        isAccessTokenVerified,
        600
      );
      req.payload = isAccessTokenVerified;
      req.accessToken = token;
      return next();
    } catch (e) {
      return next(e);
    }
  }

  async reIssueToken(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        res.status(401).send("Refresh token not provided");
      }
      const token = authorization.split("Bearer ")[1].trim();
      if (!token) {
        res.status(401).send("Refresh token not provided");
      }
      const isTokenExistOnRedis = await authService.getTokenFromRedis(
        `refreshToken:${token}`
      );
      if (!isTokenExistOnRedis) {
        res.status(401).send("Invalid Refresh token");
      }
      const isRefreshTokenVerified = await authService.verifyRefreshToken(
        token
      );
      if (!isRefreshTokenVerified) {
        res.status(401).send("Invalid Refresh token");
      }
      req.payload = isRefreshTokenVerified;
      return next();
    } catch (e) {
      return next(e);
    }
  }
}

export default new AuthenticationMiddleware();
