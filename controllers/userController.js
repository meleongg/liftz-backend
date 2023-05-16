const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const Goal = require("../models/Goal");
const PR = require("../models/PR");
const Session = require("../models/Session");
const SessionExercise = require("../models/SessionExercise");
const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");

exports.getMsg = async (req, res, next) => {
  res.json({ message: "Running!" });
};

exports.validateEmail = async (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;

  await body("email").isEmail().withMessage("Invalid email address").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(userId);

    if (user.email !== email) {
      res.json({ message: "no match" });
    } else {
      res.json({ message: "match" });
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.validatePassword = async (req, res, next) => {
  const userId = req.params.userId;
  const password = req.body.password;

  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(userId);
    const compareRes = await bcrypt.compare(password, user.password);

    if (compareRes) {
      res.json({ message: "match" });
    } else {
      res.json({ message: "no match" });
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.checkEmail = async (req, res, next) => {
  const email = req.body.email;

  await body("email").isEmail().withMessage("Invalid email address").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userArr = await User.find({ email: email }).exec();

    if (userArr.length === 0) {
      res.json({ message: "no duplicates" });
    } else {
      res.json({ message: "duplicate" });
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user_info = await User.findById(userId)
      .populate("goals")
      .populate("workouts")
      .exec();

    res.json(user_info);
  } catch (err) {
    return next(err);
  }
};

exports.addUser = async (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const workouts = [];
  const goals = [];

  body("firstName").notEmpty().withMessage("First name is required").run(req);
  body("lastName").notEmpty().withMessage("Last name is required").run(req);
  body("email").isEmail().withMessage("Invalid email address").run(req);
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+-=,./<>?;':"[\]{}|~`]).{8,}$/
    )
    .withMessage(
      "Password must contain at least 1 digit, 1 uppercase letter, 1 lowercase letter, and 1 special character"
    )
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      workouts: workouts,
      goals: goals,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const updatedEmail = req.body.email;
  const updatedPassword = req.body.password;

  body("email").isEmail().withMessage("Invalid email address").run(req);
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+-=,./<>?;':"[\]{}|~`]).{8,}$/
    )
    .withMessage(
      "Password must contain at least 1 digit, 1 uppercase letter, 1 lowercase letter, and 1 special character"
    )
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(updatedPassword, 10);
    await User.findByIdAndUpdate(
      userId,
      { email: updatedEmail, password: hashedPassword },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json("User updated");
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      const err = new Error("User not found!");
      err.status = 404;
      console.error(err);
      return next(err);
    }

    await Goal.deleteMany({ user: userId });
    await PR.deleteMany({ user: userId });

    const sessions = await Session.find({ user: userId });
    for (const session of sessions) {
      await SessionExercise.deleteMany({ session: session._id });
    }
    await Session.deleteMany({ user: userId });

    const workouts = await Workout.find({ user: userId });
    for (const workout of workouts) {
      await Exercise.deleteMany({ workout: workout._id });
    }
    await Workout.deleteMany({ user: userId });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }

  res.json({ message: "User deleted" });
};

exports.addGoal = async (req, res, next) => {
  const content = req.body.goal;
  const userId = req.params.userId;

  body("goal").notEmpty().withMessage("Goal content is required").run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newGoal = new Goal({
      content: content,
      user: userId,
    });

    const goal = await newGoal.save();

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { goals: goal._id } },
      { new: true }
    );

    res.json(goal._id);
  } catch (err) {
    return next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  const goalId = req.body.goalId;
  const updatedContent = req.body.content;

  body("content").notEmpty().withMessage("Goal content is required").run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await Goal.findByIdAndUpdate(
      goalId,
      { content: updatedContent },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json("Goal updated");
};

exports.deleteGoal = async (req, res, next) => {
  const goalId = req.body.goalId;
  const userId = req.params.userId;

  try {
    const deletedGoal = await Goal.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      const err = new Error("Document not found!");
      err.status = 404;
      console.error(err);
      return next(err);
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { goals: goalId } },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }

  res.json(goalId);
};
