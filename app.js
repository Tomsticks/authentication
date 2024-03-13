const express = require("express");
const app = express();
const morgan = require("morgan");
const authRoutes = require("./auth/authRouter");
const userRoutes = require("./users/userRoutes");
const { rateLimit } = require("express-rate-limit");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
app.use(express.json({ limit: "10kb" }));
app.use(cors());
// Secure Headers

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const limiter = rateLimit({
  limit: 50,
  windowMs: 1000 * 60 * 60,
  message: "too many requests",
  validate: { xForwardedForHeader: false },
});
app.use("/api", limiter);
// Global middlewares
app.get("/awake", (req, res) => {
  res.send("ready");
});
app.use(`/${process.env.ROUTE}/auth`, authRoutes);
app.use(`/${process.env.ROUTE}/users`, userRoutes);

app.use(mongoSanitizer());
app.use(xss());
app.use(hpp());

app.all("*", function (req, res, next) {
  res.status(404).json({
    message: "Page Not Found",
  });
  next();
});

module.exports = app;
