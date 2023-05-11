var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

router.post("/:userId/validate-email", userController.validateEmail);

router.post("/:userId/validate-password", userController.validatePassword);

router.post("/check-email", userController.checkEmail);

router.get("/user/:userId", userController.getUserById);

router.post("/create-user", userController.addUser);

router.post("/:userId/update-user", userController.updateUser);

router.post("/:userId/delete-user", userController.deleteUser);

router.post("/:userId/create-goal", userController.addGoal);

router.post("/:userId/update-goal", userController.updateGoal);

router.post("/:userId/delete-goal", userController.deleteGoal);

router.post("/create-stats", userController.addStats);

module.exports = router;
