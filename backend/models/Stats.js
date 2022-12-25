const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const statsSchema = new Schema({
  numberOfWorkouts: { type: Number, required: true, trim: true, min: 1 },
  totalWorkoutTime: { type: Number, required: true, trim: true, min: 1 },
  averageWorkoutTime: { type: Number, required: true, trim: true, min: 1 },
  mostFrequentWorkout: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
  },
  mostFrequentExercise: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
  },
  prs: [{ type: Schema.Types.ObjectId, ref: "PR" }],
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Stats", statsSchema);
