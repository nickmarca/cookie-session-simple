const Cookies = require("cookies");
const onHeaders = require("on-headers");
const {isEqual} = require("lodash");

const defaultOptions = {};

module.exports = (options = {}) => {

  const middleware = (req, res, next) => {
    const cookies = Cookies(req, res, Object.assign({}, defaultOptions, options));
    const session64 = cookies.get("session", {signed: true}) || "";
    const sessionJSON = Buffer.from(session64, "base64").toString("utf8");
    const initialSession = sessionJSON ? JSON.parse(sessionJSON) : {};

    req.session = Object.assign({}, initialSession);

    onHeaders(res, () => {
      if(!isEqual(initialSession, req.session)) {
        const newSessionJSON = JSON.stringify(req.session || {});
        const newSession64 = Buffer.from(newSessionJSON).toString("base64");
        cookies.set("session", newSession64, {signed: true});
      }
    });

    next();
  };

  return middleware;
};