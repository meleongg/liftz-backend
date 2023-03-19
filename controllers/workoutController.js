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

// TODO: render New Workout page
exports.addWorkoutGet = (req, res, next) => {
  res.json({ type: "addWorkoutGet" });
};

// TODO: collect input through New Workout page
exports.addWorkoutPost = (req, res, next) => {
  const name = req.body.name;
  const notes = req.body.notes;
  // exercises will be stored scraped from HTML elm values and passed via JSON
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

exports.stopWorkout = async (req, res, next) => {
  // create and save a session as a response to a "Done" button click
  const date = DateTime.now().toISODate();
  // const time = req.body.time;

  // object with exercise names, sets, and weights
  const exercises = req.body.exercises;
  const id = req.params.workoutId;

  try {
    // update PRs (an extra feature; not needed for MVP)
    exercises.map(async (exercise) => {
      PR.find({ exercise: exercise.name }).exec(async (pr) => {
        let newWeights = [...pr.weights]; 
        let newDates = [...pr.dates];

        if (pr.weights.length == 0) {
          newWeights = [exercise.weight]; 
        } else {
          if (exercise.weight > pr.weights[-1]) {
            newWeights.append(exercise.weight); 
          }
        }

        newDates.append(date); 

        const newPr = new PR({
          exercise: exercise.name, 
          weights: newWeights, 
          dates: newDates,
        });

        await newPr.save(); 
      });
    });

    // create exercise documents
    const exercisePromises = exercises.map(async (exercise) => {
      const newSessionExercise = new SessionExercise(exercise);

      return newSessionExercise.save(); 
    });

    const savedSessionExercises = await Promise.all(exercisePromises); 
    // returns array of exercise ids 
    const exerciseIds = savedSessionExercises.map((exercise) => exercise._id); 

    // create session only after all exercises have finished 
    const session = new Session({
      date: date,
      time: req.body.time,
      exercises: exerciseIds,
      workout: req.body.workout,
    });

    const savedSession = await session.save(); 

    // update stats (BONUS FEATURE)


    res.json(savedSession); 
  } catch(err) {
    res.status(500).send(err); 
  }
}

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
