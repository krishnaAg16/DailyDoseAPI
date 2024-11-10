const mongoose = require("mongoose");

const MedIDSchema = new mongoose.Schema({
  medDaily: {
    type: Number,
    required: true,
  },

  medName: {
    type: String,
    required: true,
  },

  medQuantity: {
    type: Number,
    required: true,
    min: 0,
  },

  medType: {
    type: String,
    required: true,
  },

  medLink: {
    type: String,
    required: true,
  },
  doses: [
    {
      dose: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],

  drug: {
    type: String,
  },
  super_food: {
    type: [String],
    default: [],
  },
  bad_food: {
    type: [String],
    default: [],
  },
  common_symptom: {
    type: [String],
    default: [],
  },
  serious_symptom: {
    type: [String],
    default: [],
  },
  treatment: {
    type: [String],
    default: [],
  },
});

const MedID = mongoose.model("MedId", MedIDSchema);
module.exports = MedID;
