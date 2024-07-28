const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: false,  // It's not always required
  },
  image: {
    type: String,
    required: false,  // It's not always required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Status', StatusSchema);
