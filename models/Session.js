const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  date: { type: Date },
  exercises: [{ type: Schema.Types.ObjectId, ref: "SessionExercise" }],
  workout: { type: Schema.Types.ObjectId, ref: "Workout" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Session", sessionSchema);
