const mongoose = require("mongoose");

// create a schema
const gameSchema = mongoose.Schema({
  name: {
    type: "String",
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 3) {
        throw new Error("Name must be more than three(3) character long.");
      }
    },
  },
  game: {
    type: "String",
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 3) {
        throw new Error("Game must be more than three(3) character long.");
      }
    },
  },
  image: {
    type: "String",
    required: true,
  },
  date: {
    type: "Date",
    required: true,
    default: Date.now,
  },
});

// create a model
const gameModel = mongoose.model("gameModel", gameSchema);

module.exports = gameModel;
