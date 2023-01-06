const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");
const Session = require("../models/Session");
const PR = require("../models/PR");

const { DateTime } = require("luxon");

// TODO: temporary user and hardcoded workout
const User = require("../models/User");
const tempID = "63a6a9224a17c73cdedb6bc3";

// const tempWorkoutID = "63af9e97bc465772d2c5f2f7";

const async = require("async");

exports.getWorkouts = (req, res, next) => {
  Workout.find({ user: tempID }).exec((err, workouts) => {
    if (err) {
      return next(err);
    }

    res.json(workouts);
  });
};

// TODO: returns a form to add an exercise to a workout
exports.addExerciseGet = (req, res, next) => {
  let workoutId = req.params.workoutId;
};

exports.addExercisePost = (req, res, next) => {
  // TODO: clean the name with express validator
  let name = req.body.name;
  name = name.toLowerCase();
  const sets = req.body.sets;
  const weight = req.body.weight;
  const workoutId = req.params.workoutId;

  async.parallel(
    {
      workout(callback) {
        // TODO: switch to use workoutId when forms are done
        Workout.findById(workoutId).exec(callback);
      },
      prCount(callback) {
        PR.count({ name: name }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // if a PR for this exercise has not been created yet
      if (results.prCount < 1) {
        const exercise = name;
        const prWeight = 0;

        const newPR = new PR({
          exercise: exercise,
          weight: prWeight,
        });

        newPR.save((err, pr) => {
          if (err) {
            return next(err);
          }

          const newExercise = new Exercise({
            name: name,
            sets: sets,
            weight: weight,
            workout: results.workout._id,
            pr: pr._id,
          });

          newExercise.save((err) => {
            if (err) {
              return next(err);
            }

            res.json("Exercise and PR added");
          });
        });
      }
    }
  );
};

// TODO: render input form
exports.addWorkoutGet = (req, res, next) => {
  res.json({ type: "addWorkoutGet" });
};

// TODO: collect input through a form
exports.addWorkoutPost = (req, res, next) => {
  const name = req.body.name;
  const notes = req.body.notes;
  const exercises = req.body.exercises;
  const sessions = [];

  // TODO: will prolly need to turn into async.parallel to fetch exercises
  User.findById(tempID).exec((err, user) => {
    if (err) {
      return next(err);
    }

    const newWorkout = new Workout({
      name: name,
      notes: notes,
      // TODO: fix this to be not null
      exercises: null,
      sessions: sessions,
      user: user._id,
    });

    newWorkout.save((err) => {
      if (err) {
        return next(err);
      }

      res.json("added workout successfully");
    });
  });
};

exports.getWorkout = (req, res, next) => {
  const id = req.params.workoutId;

  Workout.findById(id).exec((err, workout) => {
    if (err) {
      return next(err);
    }

    res.json(workout);
  });
};

exports.stopWorkout = (req, res, next) => {
  // create and save a session as a response to a "End session" button click
  const date = DateTime.now().toISODate();
  const time = req.body.time;
  const id = req.params.workoutId;

  const newSession = new Session({
    date: date,
    time: time,
    workout: id,
  });

  newSession.save((err) => {
    if (err) {
      return next(err);
    }

    res.json("Saved new session!");
  });

  // TODO: Update stats with new end of session information
};

// TODO: return a form to put input
// needed to autofill fields!
exports.updateWorkoutGet = (req, res, next) => {
  res.json({ type: "updateWorkoutGet" });
};

exports.updateWorkoutPost = (req, res, next) => {
  const workout = newWorkout({
    _id: req.params.workoutId,
    name: req.body.name,
    notes: req.body.notes,
    exercises: null,
    sessions: null,
    user: req.body.user,
  });

  Workout.findByIdAndUpdate(
    req.params.workoutId,
    workout,
    {},
    (err, result) => {
      if (err) {
        return next(err);
      }

      res.redirect(result.url);
    }
  );
};

// deleting a workout deletes the corresponding Exercises but PRs stay the same
exports.deleteWorkoutGet = (req, res, next) => {
  async.parallel(
    {
      workout(callback) {
        Workout.findById(req.params.workoutId).exec(callback);
      },
      exercises(callback) {
        Exercise.find({ workout: req.params.workoutId }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.json(results);
    }
  );
};

exports.deleteWorkoutPost = (req, res, next) => {
  async.parallel(
    {
      workout(callback) {
        Workout.findById(req.params.workoutId).exec(callback);
      },
      exercises(callback) {
        Exercise.find({ workout: workoutId }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // delete corresponding exercises for workout
      for (const exercise of results.exercises) {
        Exercise.findByIdAndRemove(exercise._id, (err) => {
          if (err) {
            return next(err);
          }
        });
      }

      Workout.findByIdAndRemove(req.params.workoutId, (err) => {
        if (err) {
          return next(err);
        }

        res.redirect("/workouts");
      });
    }
  );
};
