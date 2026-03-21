function basicAuth(req, res, next) {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASS || "changeme";
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Basic ")) {
    res.set("WWW-Authenticate", "Basic realm=Portfolio Admin");
    return res.status(401).send("Authentication required.");
  }

  const encoded = authorization.split(" ")[1] || "";
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [inputUser, inputPass] = decoded.split(":");

  if (inputUser !== user || inputPass !== pass) {
    res.set("WWW-Authenticate", "Basic realm=Portfolio Admin");
    return res.status(401).send("Invalid credentials.");
  }

  return next();
}

module.exports = basicAuth;
