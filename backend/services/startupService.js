const dataSimulationService = require('./dataSimulationService');
const forecastService = require('./forecastService');
const cron = require('node-cron');

class StartupService {
  constructor() {
    this.isInitialized = false;
    this.scheduledJobs = [];
  }

  // Initialize all services
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Services already initialized');
      return;
    }

    console.log('🚀 Initializing Ganga River Water Quality Monitoring System...');

    try {
      // Start real-time data simulation
      await this.initializeDataSimulation();
      
      // Initialize forecasting service
      await this.initializeForecastingService();
      
      // Schedule periodic tasks
      this.schedulePeriodicTasks();
      
      this.isInitialized = true;
      console.log('✅ All services initialized successfully');
      
      // Log system status
      this.logSystemStatus();
      
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  // Initialize data simulation service
  async initializeDataSimulation() {
    try {
      console.log('📊 Starting real-time data simulation...');
      await dataSimulationService.startSimulation();
      console.log('✅ Data simulation service started');
    } catch (error) {
      console.error('❌ Failed to start data simulation:', error);
      throw error;
    }
  }

  // Initialize forecasting service
  async initializeForecastingService() {
    try {
      console.log('🔮 Initializing forecasting service...');
      
      // Generate initial forecasts
      await forecastService.runDailyForecastGeneration();
      
      console.log('✅ Forecasting service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize forecasting service:', error);
      // Don't throw error for forecasting - it's not critical for startup
      console.log('⚠️ Continuing without forecasting service');
    }
  }

  // Schedule periodic tasks
  schedulePeriodicTasks() {
    console.log('⏰ Scheduling periodic tasks...');

    // Daily forecast generation at 2:00 AM
    const forecastJob = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🔮 Running scheduled forecast generation...');
        await forecastService.runDailyForecastGeneration();
        console.log('✅ Scheduled forecast generation completed');
      } catch (error) {
        console.error('❌ Scheduled forecast generation failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    // Data quality check every 6 hours
    const dataQualityJob = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('🔍 Running data quality check...');
        await this.performDataQualityCheck();
        console.log('✅ Data quality check completed');
      } catch (error) {
        console.error('❌ Data quality check failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    // System health check every hour
    const healthCheckJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    // Start all scheduled jobs
    forecastJob.start();
    dataQualityJob.start();
    healthCheckJob.start();

    this.scheduledJobs = [
      { name: 'Daily Forecast Generation', job: forecastJob, schedule: '0 2 * * *' },
      { name: 'Data Quality Check', job: dataQualityJob, schedule: '0 */6 * * *' },
      { name: 'System Health Check', job: healthCheckJob, schedule: '0 * * * *' }
    ];

    console.log(`✅ Scheduled ${this.scheduledJobs.length} periodic tasks`);
  }

  // Perform data quality check
  async performDataQualityCheck() {
    const WaterQuality = require('../models/WaterQuality');
    const Location = require('../models/Location');
    
    try {
      const locations = await Location.find({ isActive: true });
      const issues = [];
      
      for (const location of locations) {
        // Check for recent data (within last 2 hours)
        const recentData = await WaterQuality.findOne({
          locationId: location._id,
          timestamp: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        });
        
        if (!recentData) {
          issues.push({
            type: 'missing_data',
            location: location.name,
            message: 'No recent data available'
          });
        } else {
          // Check for anomalous values
          const anomalies = this.detectAnomalies(recentData);
          if (anomalies.length > 0) {
            issues.push({
              type: 'data_anomaly',
              location: location.name,
              anomalies: anomalies
            });
          }
        }
      }
      
      if (issues.length > 0) {
        console.log(`⚠️ Data quality issues detected: ${issues.length} issues`);
        // In a real system, you might send alerts or notifications here
      } else {
        console.log('✅ Data quality check passed - no issues detected');
      }
      
      return issues;
    } catch (error) {
      console.error('Error in data quality check:', error);
      throw error;
    }
  }

  // Detect anomalies in water quality data
  detectAnomalies(waterQualityData) {
    const anomalies = [];
    const { parameters } = waterQualityData;
    
    // Define expected ranges for anomaly detection
    const expectedRanges = {
      dissolvedOxygen: { min: 0, max: 15, typical: [4, 12] },
      biochemicalOxygenDemand: { min: 0, max: 50, typical: [1, 10] },
      nitrate: { min: 0, max: 200, typical: [0.1, 20] },
      fecalColiform: { min: 0, max: 100000, typical: [10, 5000] },
      ph: { min: 6, max: 9, typical: [6.5, 8.5] },
      turbidity: { min: 0, max: 200, typical: [1, 30] },
      temperature: { min: 5, max: 45, typical: [15, 35] }
    };
    
    Object.keys(expectedRanges).forEach(param => {
      if (parameters[param]) {
        const value = parameters[param].value;
        const range = expectedRanges[param];
        
        // Check for values outside physical limits
        if (value < range.min || value > range.max) {
          anomalies.push({
            parameter: param,
            value: value,
            type: 'out_of_bounds',
            message: `${param} value ${value} is outside expected range [${range.min}, ${range.max}]`
          });
        }
        // Check for values outside typical ranges (potential anomalies)
        else if (value < range.typical[0] || value > range.typical[1]) {
          anomalies.push({
            parameter: param,
            value: value,
            type: 'unusual_value',
            message: `${param} value ${value} is outside typical range [${range.typical[0]}, ${range.typical[1]}]`
          });
        }
      }
    });
    
    return anomalies;
  }

  // Perform system health check
  async performHealthCheck() {
    const status = {
      timestamp: new Date(),
      dataSimulation: dataSimulationService.getStatus(),
      database: await this.checkDatabaseHealth(),
      memory: this.getMemoryUsage(),
      uptime: process.uptime()
    };
    
    // Log health status (in production, you might send this to monitoring service)
    if (status.dataSimulation.isRunning && status.database.connected) {
      console.log('💚 System health check: All systems operational');
    } else {
      console.log('⚠️ System health check: Some issues detected');
      console.log('Status:', JSON.stringify(status, null, 2));
    }
    
    return status;
  }

  // Check database connectivity
  async checkDatabaseHealth() {
    try {
      const mongoose = require('mongoose');
      const isConnected = mongoose.connection.readyState === 1;
      
      if (isConnected) {
        // Test a simple query
        const Location = require('../models/Location');
        await Location.countDocuments();
        
        return {
          connected: true,
          status: 'healthy'
        };
      } else {
        return {
          connected: false,
          status: 'disconnected'
        };
      }
    } catch (error) {
      return {
        connected: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Get memory usage statistics
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }

  // Log system status
  logSystemStatus() {
    console.log('\n📋 System Status:');
    console.log('================');
    console.log(`🔄 Data Simulation: ${dataSimulationService.getStatus().isRunning ? 'Running' : 'Stopped'}`);
    console.log(`⏰ Scheduled Jobs: ${this.scheduledJobs.length} active`);
    console.log(`💾 Memory Usage: ${this.getMemoryUsage().heapUsed} MB`);
    console.log(`⏱️ Uptime: ${Math.round(process.uptime())} seconds`);
    console.log('================\n');
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🛑 Shutting down services...');
    
    try {
      // Stop data simulation
      dataSimulationService.stopSimulation();
      
      // Stop scheduled jobs
      this.scheduledJobs.forEach(({ name, job }) => {
        job.stop();
        console.log(`✅ Stopped ${name}`);
      });
      
      console.log('✅ All services shut down gracefully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      dataSimulation: dataSimulationService.getStatus(),
      scheduledJobs: this.scheduledJobs.map(({ name, schedule }) => ({ name, schedule })),
      uptime: process.uptime()
    };
  }
}

module.exports = new StartupService();