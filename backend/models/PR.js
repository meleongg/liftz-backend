const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const prSchema = new Schema({
  exercise: { type: String, required: true, trim: true, minLength: 1 },
  weights: [{ type: Number, required: true, trim: true }],
  dates: [{ type: Date }],
});

module.exports = mongoose.model("PR", prSchema);
