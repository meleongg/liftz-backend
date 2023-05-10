const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const workoutSchema = new Schema({
  name: { type: String, required: true, trim: true, minLength: 1 },
  notes: { type: String, trim: true, maxLength: 500 },
  exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
  sessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

// virtual for workout's url
workoutSchema.virtual("url").get(function () {
  return "/workouts/" + this._id;
});

module.exports = mongoose.model("Workout", workoutSchema);
