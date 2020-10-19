const User = require("../models/users");

const apiIsAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", ""),
      });

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        req.user = user;
        return next();
      }
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
  }

  // const user = await User.findOne({
  //   email: "lol@lol.com",
  // });
  // req.user = user;
  // return next();
};
module.exports = apiIsAuthenticated;
