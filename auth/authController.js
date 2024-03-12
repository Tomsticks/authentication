const users = require("./userModel");
const jwt = require("jsonwebtoken");
const bcypt = require("bcryptjs");
const sendEmail = require("../utils/email");
const crypto = require("node:crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWTCOOKIEEXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  user.password = undefined;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({ data: user, token, status: "sucess" });
};

async function RegisterUsers(req, res) {
  try {
    let newUser = await users.create({
      name: req.body.name,
      email: req.body.email,
      image: req.body.image,
      role: req.body.role,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    createSendToken(newUser, 200, res);
  } catch (error) {
    if (error.code === 11000) {
      res.json({ message: "email in use", otherError: error });
    } else {
      res.json({ errormessage: error });
    }
  }
}

async function LoginUsers(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Provide Email And Password" });
  }

  const user = await users.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return res.status(401).json({ message: "incorrect email or password" });
  }
  createSendToken(user, 200, res);
}

// check if user is logged in
async function authController(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "you are not loged in" });
  }

  try {
    // Validate Token
    const decoode = await jwt.verify(token, process.env.JWTSECRET);
    let currentUser = await users.findById(decoode.id);
    if (!currentUser) {
      return next(
        res.status(401).json({ message: "this user does not exist" })
      );
    }
    req.user = currentUser;
  } catch (error) {
    return res.status(401).json({ message: "invalid Token" });
  }

  next();
}

//Make the user Retricted to some routes

const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        res
          .status(403)
          .json({ message: "you dont have permision to this route" })
      );
    }

    next();
  };
};

// Forgot Password

async function forgotPassword(req, res) {
  const user = await users.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "no user found" });
  }
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const ResetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v5/auth/resetpassword/${resetToken}`;
  const message = `forgot your password ? send a patch request with your new password and passwordConfirm to:  ${ResetUrl} , ignore if you didnt forget your password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset; It expires in 10min",
      message: message,
    });
    res.status(200).json({ message: "sucessfuly sent email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(400).json({ message: "error sending email", error });
  }
}
// Reset Password
async function resetPassword(req, res) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "invalid or expired token" });
  }

  try {
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateUserPaasowrd(req, res) {
  const user = await users.findById(req.user.id).select("+password");
  const check = await user.checkPassword(
    req.body.passwordCurrent,
    user.password
  );
  if (!check) {
    return res.status(401).json({ message: "incorrect password" });
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
}

module.exports = {
  LoginUsers,
  RegisterUsers,
  authController,
  restrict,
  forgotPassword,
  resetPassword,
  updateUserPaasowrd,
};
