const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");

router.get("/", workoutController.getWorkouts);

router.post("/:userId/create-workout", workoutController.addWorkoutPost);

router.get("/:workoutId", workoutController.getWorkout);

router.get("/sessions/:sessionId", workoutController.getSession);

router.post("/:workoutId/session-end", workoutController.stopWorkout);

router.post("/:workoutId/update", workoutController.updateWorkout);

router.post("/:workoutId/delete", workoutController.deleteWorkout);

module.exports = router;
