const app = require("express");
const Router = app.Router();
const {
  LoginUsers,
  RegisterUsers,
  forgotPassword,
  resetPassword,
  updateUserPaasowrd,
  authController,
} = require("./authController");

Router.post("/register", RegisterUsers);
Router.post("/login", LoginUsers);
Router.post("/forgotpassword", forgotPassword);
Router.patch("/resetPassword/:token", resetPassword);
Router.patch("/updateuserpassword", authController, updateUserPaasowrd);

module.exports = Router;
