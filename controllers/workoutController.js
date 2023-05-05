const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");
const SessionExercise = require("../models/SessionExercise");
const Session = require("../models/Session");
const Stats = require("../models/Stats");
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

// // TODO: returns a form to add an exercise to a workout
// exports.addExerciseGet = (req, res, next) => {
//   let workoutId = req.params.workoutId;
// };

// exports.addExercisePost = (req, res, next) => {
//   // TODO: clean the name with express validator
//   let name = req.body.name;
//   name = name.toLowerCase();
//   const sets = req.body.sets;
//   const weight = req.body.weight;
//   const workoutId = req.params.workoutId;

//   async.parallel(
//     {
//       workout(callback) {
//         // TODO: switch to use workoutId when forms are done
//         Workout.findById(workoutId).exec(callback);
//       },
//       prCount(callback) {
//         PR.count({ name: name }).exec(callback);
//       },
//     },
//     (err, results) => {
//       if (err) {
//         return next(err);
//       }

//       // if a PR for this exercise has not been created yet
//       if (results.prCount < 1) {
//         const exercise = name;
//         const prWeight = 0;

//         const newPR = new PR({
//           exercise: exercise,
//           weight: prWeight,
//         });

//         newPR.save((err, pr) => {
//           if (err) {
//             return next(err);
//           }

//           const newExercise = new Exercise({
//             name: name,
//             sets: sets,
//             weight: weight,
//             workout: results.workout._id,
//             pr: pr._id,
//           });

//           newExercise.save((err) => {
//             if (err) {
//               return next(err);
//             }

//             res.json("Exercise and PR added");
//           });
//         });
//       }
//     }
//   );
// };

// TODO: collect input through New Workout page
exports.addWorkoutPost = async (req, res, next) => {
  const name = req.body.name;
  const notes = req.body.notes;
  const exercises = req.body.exercises;
  const sessions = [];
  const userId = req.params.userId;

  try {
    const newWorkout = new Workout({
      user: userId,
      name: name,
      notes: notes,
      exercises: exercises,
      sessions: sessions,
    });

    const exerciseIds = [];

    // Loop through each exercise in the exercises array
    const createdExercises = await Promise.all(
      exercises.map(async (exercise) => {
        // Create a new Exercise document based off of the Exercise Schema
        const newExercise = new Exercise({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          workout: newWorkout._id,
        });

        // Save the new Exercise document to the database
        const savedExercise = await newExercise.save();
        exerciseIds.push(savedExercise._id);

        return savedExercise;
      })
    );

    newWorkout.exercises = exerciseIds;

    const workoutId = await newWorkout.save();
    console.log(workoutId);

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { workouts: workoutId } },
      { new: true }
    );

    res.json(workoutId._id);
  } catch (err) {
    console.log(err);
    console.error(err);
    next(err);
  }
};

exports.getSession = (req, res, next) => {
  const sessionId = req.params.sessionId;

  Session.findById(sessionId)
    .populate("exercises")
    .populate("workout")
    .exec((err, session) => {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.json(session);
    });
};

exports.getWorkout = (req, res, next) => {
  const id = req.params.workoutId;

  Workout.findById(id)
    .populate("exercises")
    .populate("sessions")
    .exec((err, workout) => {
      if (err) {
        return next(err);
      }

      res.json(workout);
    });
};

exports.stopWorkout = async (req, res, next) => {
  const date = DateTime.now().toLocaleString(DateTime.DATE_SHORT);
  const time = req.body.time;
  const sessionExercises = req.body.sessionExercises;
  const workoutId = req.params.workoutId;

  try {
    let newWeights = [];
    let newDates = [];

    // create exercise documents and update PRs
    const exercisePromises = sessionExercises.map(async (exercise) => {
      let pr = await PR.findOne({
        exercise: exercise.name,
        workout: workoutId,
      });

      if (pr) {
        newWeights = [...pr.weights];
        newDates = [...pr.dates];
      }

      if (
        pr &&
        newWeights.length > 0 &&
        exercise.weight > newWeights[newWeights.length - 1]
      ) {
        newWeights.push(exercise.weight);
        newDates.push(date);
      } else {
        newWeights = [exercise.weight];
        newDates = [date];
      }

      if (pr) {
        pr.weights = newWeights;
        pr.dates = newDates;

        await pr.save();
      } else {
        const newPr = new PR({
          exercise: exercise.name,
          weights: newWeights,
          dates: newDates,
          workout: workoutId,
        });

        pr = await newPr.save();

        // update the corresponding Exercise Object with the PR ID
        await Exercise.findOneAndUpdate(
          { name: exercise.name, workout: workoutId },
          { pr: pr }
        );
      }

      const newSessionExercise = new SessionExercise({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
      });

      return newSessionExercise.save();
    });

    const savedSessionExercises = await Promise.all(exercisePromises);
    const exerciseIds = savedSessionExercises.map((exercise) => exercise._id);

    const session = new Session({
      date: date,
      time: time,
      exercises: exerciseIds,
      workout: workoutId,
    });

    const savedSession = await session.save();

    res.json(savedSession._id);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
    return next(err);
  }
};

// TODO: return a form to put input
// needed to autofill fields!
exports.updateWorkoutGet = (req, res, next) => {
  res.json({ type: "updateWorkoutGet" });
};

exports.updateWorkoutPost = (req, res, next) => {
  // TODO: grab previous exercises, keep the old ones, add new ones

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

exports.deleteWorkoutPost = async (req, res, next) => {
  const userId = req.body.userId;
  const workoutId = req.params.workoutId;

  try {
    const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

    if (!deletedWorkout) {
      const err = new Error("Document not found!");
      err.status = 404;
      console.error(err);
      return next(err);
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { workouts: workoutId } },
      { new: true }
    );

    await Exercise.deleteMany({ workoutId: workoutId });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }

  res.json({
    message: "Successfully deleted workout and associated exercises.",
  });
};

// exports.deleteWorkoutPost = (req, res, next) => {
//   async.parallel(
//     {
//       workout(callback) {
//         Workout.findById(req.params.workoutId).exec(callback);
//       },
//       exercises(callback) {
//         Exercise.find({ workout: workoutId }).exec(callback);
//       },
//     },
//     (err, results) => {
//       if (err) {
//         return next(err);
//       }

//       // delete corresponding exercises for workout
//       for (const exercise of results.exercises) {
//         Exercise.findByIdAndRemove(exercise._id, (err) => {
//           if (err) {
//             return next(err);
//           }
//         });
//       }

//       Workout.findByIdAndRemove(req.params.workoutId, (err) => {
//         if (err) {
//           return next(err);
//         }

//         res.redirect("/workouts");
//       });
//     }
//   );
// };
