const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");
const SessionExercise = require("../models/SessionExercise");
const Session = require("../models/Session");
const PR = require("../models/PR");
const User = require("../models/User");

const { DateTime } = require("luxon");

const { body, validationResult } = require("express-validator");

exports.getWorkouts = async (req, res, next) => {
    try {
        const tempID = req.params.tempID;
        const workouts = await Workout.find({ user: tempID }).exec();
        res.json(workouts);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.addWorkoutPost = async (req, res, next) => {
    const name = req.body.name;
    const notes = req.body.notes;
    const exercises = req.body.exercises;
    const sessions = [];
    const userId = req.params.userId;

    body("name").notEmpty().withMessage("Workout name is required").run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
        await Promise.all(
            exercises.map(async (exercise) => {
                // Create a new Exercise document based off of the Exercise Schema
                const newExercise = new Exercise({
                    position: exercise.position,
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

        await User.findOneAndUpdate(
            { _id: userId },
            { $push: { workouts: workoutId } },
            { new: true }
        );

        res.json(workoutId._id);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getWorkout = async (req, res, next) => {
    const workoutId = req.params.workoutId;

    try {
        const workout = await Workout.findById(workoutId)
            .populate("exercises")
            .populate("sessions")
            .exec();

        workout.exercises.sort((a, b) => a.position - b.position);

        res.json(workout);
    } catch (err) {
        next(err);
    }
};

exports.getSession = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId)
            .populate("exercises")
            .populate("workout")
            .exec();
        res.json(session);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.stopWorkout = async (req, res, next) => {
    const date = DateTime.utc();
    const userId = req.body.userId;
    const sessionExercises = req.body.sessionExercises;
    const workout = req.body.workout;
    const workoutId = req.params.workoutId;

    try {
        let newWeights = [];
        let newDates = [];

        // create exercise documents and update PRs
        const exercisePromises = sessionExercises.map(async (exercise) => {
            let pr = await PR.findOne({
                exercise: exercise.name,
                user: userId,
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
            } else if (newWeights.length == 0) {
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
                    user: userId,
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

            // update Workout object (if the notes were updated)
            await Workout.findByIdAndUpdate(workoutId, workout);

            return newSessionExercise.save();
        });

        const savedSessionExercises = await Promise.all(exercisePromises);
        const exerciseIds = savedSessionExercises.map(
            (exercise) => exercise._id
        );

        const session = new Session({
            date: date,
            exercises: exerciseIds,
            workout: workoutId,
            user: userId,
        });

        const savedSession = await session.save();

        await Workout.findOneAndUpdate(
            { _id: workoutId },
            { $push: { sessions: savedSession._id } },
            { new: true }
        );

        res.json(savedSession._id);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
        return next(err);
    }
};

exports.updateWorkout = async (req, res, next) => {
    try {
        const workoutId = req.params.workoutId;
        const exercises = req.body.workout.exercises;
        const exerciseIds = [];

        // Loop through each exercise in the exercises array
        await Promise.all(
            exercises.map(async (exercise) => {
                // Create a new Exercise document based off of the Exercise Schema
                if (exercise._id) {
                    const exerciseUpdates = {
                        position: exercise.position,
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                    };
                    const options = { new: true };
                    const updatedExercise = await Exercise.findByIdAndUpdate(
                        exercise._id,
                        exerciseUpdates,
                        options
                    );
                    exerciseIds.push(updatedExercise._id);

                    return updatedExercise;
                } else {
                    const newExercise = new Exercise({
                        position: exercises.length + 1,
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                        workout: workoutId,
                    });

                    // Save the new Exercise document to the database
                    const savedExercise = await newExercise.save();
                    exerciseIds.push(savedExercise._id);

                    return savedExercise;
                }
            })
        );

        // Remove exercises that don't show up in newExerciseObjects
        await Exercise.deleteMany({
            _id: { $nin: exerciseIds },
            workout: workoutId,
        });

        const workoutUpdates = {
            name: req.body.workout.name,
            notes: req.body.workout.notes,
            exercises: exerciseIds,
        };

        const updatedWorkout = await Workout.findByIdAndUpdate(
            workoutId,
            workoutUpdates,
            { new: true }
        );

        res.json(updatedWorkout._id);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.deleteWorkout = async (req, res, next) => {
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

        await Exercise.deleteMany({ workout: workoutId });
        await Session.deleteMany({ workout: workoutId });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }

    res.json({
        message: "Successfully deleted workout and associated exercises.",
    });
};
