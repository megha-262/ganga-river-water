const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SensorDataSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  bod: {
    type: Number,
    required: true,
  },
  do: {
    type: Number,
    required: true,
  },
  ph: {
    type: Number,
    required: true,
  },
  nitrate: {
    type: Number,
    required: true,
  },
  fecalColiform: {
    type: Number,
    required: true,
  },
});

SensorDataSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SensorData', SensorDataSchema);