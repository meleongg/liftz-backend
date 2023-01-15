const User = require("../models/User");

const async = require("async");

// TODO: evaluate if these imports are needed after the manual adds
const Goal = require("../models/Goal");
const PR = require("../models/PR");
const Stats = require("../models/Stats");

// TODO: Once I figure out how to include the user's id in the request
const tempID = "63a6a9224a17c73cdedb6bc3";

exports.userInfo = (req, res, next) => {
  User.findById(tempID)
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
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const workouts = [];
  const goals = [];
  const stats = [];

  const newUser = new User({
    name: name,
    username: username,
    password: password,
    workouts: workouts,
    goals: goals,
    stats: stats,
  });

  newUser.save((err) => {
    if (err) {
      return next(err);
    }

    // TODO: redirect user if successful
    res.json("User added");
  });
};

exports.addGoal = (req, res, next) => {
  // TODO: add input validation & cleansing
  const content = req.body.content;

  User.findById(tempID).exec((err, user) => {
    if (err) {
      return next(err);
    }

    const newGoal = new Goal({
      content: content,
      user: user._id,
    });

    newGoal.save((err) => {
      if (err) {
        return next(err);
      }

      // TODO: redirect user if successful
      res.json("Goal added");
    });
  });
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
