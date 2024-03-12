const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  email: {
    type: String,
    required: [true, "email is Required"],
    unique: [true, "email is in use"],
    lowercase: true,
    validate: [validator.isEmail, "please Provide a valid Email"],
  },
  image: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Provide a Password"],
    minlength: [8, "password must be more than 8 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "confirm your Password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password Does Not MATCH",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now - 1000;

  next();
});

userSchema.methods.checkPassword = async function (bodyPassword, DBpassword) {
  return await bcrypt.compare(bodyPassword, DBpassword);
};
const user = mongoose.model("users", userSchema);
module.exports = user;
