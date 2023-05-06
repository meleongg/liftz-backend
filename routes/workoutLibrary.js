const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");

router.get("/", workoutController.getWorkouts);

// TODO: can all be submitted at once after the Submit button is clicked
// router.get("/:workoutId/add-exercise", workoutController.addExerciseGet);
// router.post("/:workoutId/add-exercise", workoutController.addExercisePost);

router.post("/:userId/create-workout", workoutController.addWorkoutPost);

router.get("/:workoutId", workoutController.getWorkout);

router.get("/sessions/:sessionId", workoutController.getSession);

router.post("/:workoutId/session-end", workoutController.stopWorkout);

router.post("/:workoutId/update", workoutController.updateWorkoutPost);

router.post("/:workoutId/delete", workoutController.deleteWorkoutPost);

module.exports = router;
