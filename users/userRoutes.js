const app = require("express");
const Router = app.Router();
const { authController, restrict } = require("../auth/authController");
const { getAllUsers, updateMe, deleteMe } = require("../users/userController");

Router.get("/allusers", authController, restrict("admin"), getAllUsers);
Router.patch("/updateme", authController, updateMe);
Router.patch("/deleteme", authController, deleteMe);

module.exports = Router;
