const User = require("../models/User");

const async = require("async");
const bcrypt = require("bcryptjs");

// TODO: evaluate if these imports are needed after the manual adds
const Goal = require("../models/Goal");
const PR = require("../models/PR");
const Stats = require("../models/Stats");

// TODO: Once I figure out how to include the user's id in the request
const tempID = "63a6a9224a17c73cdedb6bc3";

exports.userInfo = (req, res, next) => {
  const userId = req.body.userId;

  User.findById(userId)
    .populate("goals")
    .populate("stats")
    .exec(function (err, user_info) {
      if (err) {
        return next(err);
      }

      res.json(user_info);
    });
};

exports.getUserById = (req, res, next) => {
  const userId = req.params.userId;
  console.log(userId);

  User.findById(userId)
    .populate("goals")
    .populate("stats")
    .exec(function (err, user_info) {
      if (err) {
        return next(err);
      }

      res.json(user_info);
    });
};

exports.addUser = (req, res, next) => {
  // TODO: add input validation & cleansing
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const workouts = [];
  const goals = [];
  const stats = [];

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    // if err, do something
    if (err) {
      console.error(err);
      return next(err);
    }

    // otherwise, store hashedPassword in DB
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      workouts: workouts,
      goals: goals,
      stats: stats,
    });

    newUser.save((err) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      res.json(newUser);
    });
  });
};

exports.addGoal = (req, res, next) => {
  // TODO: add input validation & cleansing
  const content = req.body.goal;

  console.log("received");
  console.log(content);

  User.findById(tempID).exec((err, user) => {
    if (err) {
      return next(err);
    }

    const newGoal = new Goal({
      content: content,
      user: user._id,
    });

    newGoal.save((err, goal) => {
      if (err) {
        return next(err);
      }

      console.log(goal._id);

      // TODO: redirect user if successful
      // res.json("Goal added");
      User.findOneAndUpdate(
        { _id: tempID },
        { $push: { goals: goal._id } },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            return next(err);
          } else {
            console.log(updatedUser);
          }
        }
      );
      res.json(goal._id);
    });
  });
};

exports.updateGoal = async (req, res, next) => {
  const goalId = req.body.goalId;
  const updatedContent = req.body.content;

  console.log(req.body);

  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      { content: updatedContent },
      { new: true }
    );
    console.log(updatedGoal);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res.json("Goal updated");
};

exports.deleteGoal = async (req, res, next) => {
  const goalId = req.body.goalId;

  try {
    const deletedGoal = await Goal.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      const err = new Error("Document not found!");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }

  res.json(goalId);
};

// TEMPORARY
// exports.addPr = (req, res, next) => {
//   // TODO: add input validation & cleansing
//   const exercise = req.body.exercise;
//   const weight = req.body.weight;

//   User.findById(tempID).exec((err, user) => {
//     if (err) {
//       return next(err);
//     }

//     const newPr = new PR({
//       exercise: exercise,
//       weight: weight,
//     });

//     newPr.save((err) => {
//       if (err) {
//         return next(err);
//       }

//       // TODO: redirect user if successful
//       res.json("PR added");
//     });
//   });
// };

exports.addStats = (req, res, next) => {
  // TODO: add input validation & cleansing
  const numberOfWorkouts = req.body.numberOfWorkouts;
  const totalWorkoutTime = req.body.totalWorkoutTime;
  const averageWorkoutTime = req.body.averageWorkoutTime;
  const prs = [];

  // TODO: turn these into actual db parsing
  const mostFrequentWorkout = req.body.mostFrequentWorkout;
  const mostFrequentExercise = req.body.mostFrequentExercise;

  async.parallel(
    {
      user(callback) {
        User.findById(tempID).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      const newStats = new Stats({
        numberOfWorkouts: numberOfWorkouts,
        totalWorkoutTime: totalWorkoutTime,
        averageWorkoutTime: averageWorkoutTime,
        mostFrequentWorkout: mostFrequentWorkout,
        mostFrequentExercise: mostFrequentExercise,
        prs: prs,
        user: results.user._id,
      });

      newStats.save((err) => {
        if (err) {
          return next(err);
        }

        // TODO: redirect user if successful
        res.json("Stats added");
      });
    }
  );
};

// TODO: create new user (form) GET/POST

// TODO: update existing user (form) UPDATE
