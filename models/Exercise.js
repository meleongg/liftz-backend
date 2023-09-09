const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    position: { type: Number, required: true, min: 1 }, // 1-based ordering
    name: { type: String, required: true, trim: true, minLength: 1 },
    sets: { type: Number, required: true, trim: true, min: 0 },
    reps: { type: Number, required: true, trim: true, min: 0 },
    weight: { type: Number, required: true, trim: true, min: 0 },
    workout: { type: Schema.Types.ObjectId, ref: "Workout" },
    pr: { type: Schema.Types.ObjectId, ref: "PR" },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
