const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const prSchema = new Schema({
  exercise: { type: String, required: true, trim: true, minLength: 1 },
  weight: { type: Number, required: true, trim: true, min: 1 },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("PR", prSchema);
