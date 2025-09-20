const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Location = require('../models/Location');

// @route   POST api/sensorData
// @desc    Add new sensor data
// @access  Public (for now, consider authentication later)
router.post('/', async (req, res) => {
  const { locationId, bod, do: dissolvedOxygen, ph, nitrate, fecalColiform } = req.body;

  try {
    // Check if location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }

    const newSensorData = new SensorData({
      location: locationId,
      bod,
      do: dissolvedOxygen,
      ph,
      nitrate,
      fecalColiform,
    });

    const sensorData = await newSensorData.save();
    res.json(sensorData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sensorData/:locationId
// @desc    Get sensor data by location
// @access  Public
router.get('/:locationId', async (req, res) => {
  try {
    const sensorData = await SensorData.find({ location: req.params.locationId }).sort({ timestamp: -1 });
    res.json(sensorData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sensorData
// @desc    Get all sensor data
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sensorData = await SensorData.find().populate('location').sort({ timestamp: -1 });
    res.json(sensorData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sensorData/realtime/:locationId
// @desc    Get latest sensor data for a specific location (real-time)
// @access  Public
router.get('/realtime/:locationId', async (req, res) => {
  try {
    const latestSensorData = await SensorData.findOne({ location: req.params.locationId })
      .sort({ timestamp: -1 })
      .populate('location');

    if (!latestSensorData) {
      return res.status(404).json({ msg: 'No real-time data found for this location' });
    }

    res.json(latestSensorData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sensorData/historical/:locationId
// @desc    Get historical sensor data for a specific location with pagination and filtering
// @access  Public
router.get('/historical/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, sortBy = 'timestamp', sortOrder = -1 } = req.query;

    let query = { location: locationId };
    if (startDate) {
      query.timestamp = { ...query.timestamp, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortBy]: parseInt(sortOrder, 10) },
      populate: 'location',
    };

    const historicalData = await SensorData.paginate(query, options);

    if (!historicalData || historicalData.docs.length === 0) {
      return res.status(404).json({ msg: 'No historical data found for this location' });
    }

    res.json(historicalData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;