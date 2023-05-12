const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionExerciseSchema = new Schema({
  name: { type: String, required: true, trim: true, minLength: 1 },
  sets: { type: Number, required: true, trim: true, min: 0 },
  reps: { type: Number, required: true, trim: true, min: 0 },
  weight: { type: Number, required: true, trim: true, min: 0 },
});

module.exports = mongoose.model("SessionExercise", sessionExerciseSchema);
