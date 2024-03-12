const express = require("express");
const app = express();
const morgan = require("morgan");
const authRoutes = require("./auth/authRouter");
const userRoutes = require("./users/userRoutes");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
app.use(express.json());

// Secure Headers
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const limiter = rateLimit({
  limit: 50,
  windowMs: 1000 * 60 * 60,
  message: "too many requests",
  // headers: true,
  validate: { xForwardedForHeader: false },
});
app.use(limiter);
// Global middlewares
app.use(`/${process.env.ROUTE}/auth`, authRoutes);
app.use(`/${process.env.ROUTE}/users`, userRoutes);

app.use(mongoSanitizer());
app.use(xss());
app.use(hpp());

app.all("*", (req, res, next) => {
  next(res.status(404).json({ message: "Invalid url" }));
});

app.get("/", (req, res) => {
  res.send("ready");
});

module.exports = app;
