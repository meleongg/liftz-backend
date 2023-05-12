const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const statsSchema = new Schema({
  numberOfWorkouts: { type: Number, required: true, trim: true, min: 0 },
  totalWorkoutTime: { type: Number, required: true, trim: true, min: 0 },
  averageWorkoutTime: { type: Number, required: true, trim: true, min: 0 },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Stats", statsSchema);
