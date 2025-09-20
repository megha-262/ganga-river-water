const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// @route   GET /api/locations
// @desc    Get all monitoring locations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ riverKm: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
});

// @route   GET /api/locations/:id
// @desc    Get single location by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
});

// @route   GET /api/locations/nearby/:lat/:lng
// @desc    Get locations near given coordinates
// @access  Public
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radius = req.query.radius || 50; // Default 50km radius

    const locations = await Location.find({
      isActive: true,
      'coordinates.latitude': {
        $gte: parseFloat(lat) - (radius / 111), // Rough conversion: 1 degree ≈ 111km
        $lte: parseFloat(lat) + (radius / 111)
      },
      'coordinates.longitude': {
        $gte: parseFloat(lng) - (radius / 111),
        $lte: parseFloat(lng) + (radius / 111)
      }
    }).sort({ riverKm: 1 });

    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby locations',
      error: error.message
    });
  }
});

// @route   POST /api/locations
// @desc    Create new monitoring location
// @access  Public (In production, this should be protected)
router.post('/', async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating location',
      error: error.message
    });
  }
});

// @route   PUT /api/locations/:id
// @desc    Update location
// @access  Public (In production, this should be protected)
router.put('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
});

// @route   DELETE /api/locations/:id
// @desc    Deactivate location (soft delete)
// @access  Public (In production, this should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating location:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating location',
      error: error.message
    });
  }
});

module.exports = router;