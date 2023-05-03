const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const indexRouter = require("./routes/index");
const calendarRouter = require("./routes/calendar");
const plateCalculatorRouter = require("./routes/plateCalculator");
const statsRouter = require("./routes/stats");
const workoutLibraryRouter = require("./routes/workoutLibrary");

require("dotenv").config();

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }

        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            console.error(err);
            return next(err);
          }

          if (res) {
            // passwords match! log user in
            return done(null, user);
          } else {
            // passwords do not match!
            return done(null, false, { message: "Incorrect password" });
          }
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { usernameField: "email", passwordField: "password" },
    (err, user, info) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        }

        return res.json(user);
      });
    }
  )(req, res, next);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.json({ message: "ALL GOOD" });
  });
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/calendar", calendarRouter);
app.use("/plate-calculator", plateCalculatorRouter);
app.use("/stats", statsRouter);
app.use("/workouts", workoutLibraryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

module.exports = app;
