const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");

router.get("/", workoutController.getWorkouts);

router.get("/:workoutId/add-exercise", workoutController.addExerciseGet);
router.post("/:workoutId/add-exercise", workoutController.addExercisePost);

router.get("/add-workout", workoutController.addWorkoutGet);
router.post("/add-workout", workoutController.addWorkoutPost);

router.get("/:workoutId", workoutController.getWorkout);

router.post("/:workoutId/stop-workout", workoutController.stopWorkout);

router.get("/:workoutId/update", workoutController.updateWorkoutGet);
router.post("/:workoutId/update", workoutController.updateWorkoutPost);

router.get("/:workoutId/delete", workoutController.deleteWorkoutGet);
router.post("/:workoutId/delete", workoutController.deleteWorkoutPost);

module.exports = router;