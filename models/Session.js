const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  date: { type: Date },
  time: { type: Number, required: true, trim: true, min: 1 },
  workout: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
});

module.exports = mongoose.model("Session", sessionSchema);
