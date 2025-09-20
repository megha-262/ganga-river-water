const cron = require('node-cron');
const forecastService = require('./forecastService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Start all scheduled tasks
  start() {
    console.log('🕐 Starting scheduler service...');
    
    // Schedule daily forecast generation at 6:00 AM
    this.scheduleDailyForecasts();
    
    // Schedule cleanup of old forecasts at 2:00 AM daily
    this.scheduleCleanup();
    
    console.log('✅ Scheduler service started successfully');
  }

  // Schedule daily forecast generation
  scheduleDailyForecasts() {
    // Run at 6:00 AM every day
    const job = cron.schedule('0 6 * * *', async () => {
      console.log('🔮 Running scheduled daily forecast generation...');
      try {
        const forecasts = await forecastService.runDailyForecastGeneration();
        console.log(`✅ Generated ${forecasts.length} forecasts for ${forecasts.length / 3} locations`);
      } catch (error) {
        console.error('❌ Error in scheduled forecast generation:', error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('dailyForecasts', job);
    job.start();
    console.log('📅 Scheduled daily forecast generation at 6:00 AM IST');
  }

  // Schedule cleanup of old forecasts
  scheduleCleanup() {
    // Run at 2:00 AM every day
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running scheduled cleanup of old forecasts...');
      try {
        const Forecast = require('../models/Forecast');
        
        // Delete forecasts older than 30 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        
        const result = await Forecast.deleteMany({
          createdAt: { $lt: cutoffDate }
        });
        
        console.log(`🗑️ Cleaned up ${result.deletedCount} old forecasts`);
      } catch (error) {
        console.error('❌ Error in scheduled cleanup:', error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    this.jobs.set('cleanup', job);
    job.start();
    console.log('🧹 Scheduled cleanup at 2:00 AM IST');
  }

  // Generate forecasts immediately (for testing or manual trigger)
  async generateForecastsNow() {
    console.log('🚀 Manually triggering forecast generation...');
    try {
      const forecasts = await forecastService.runDailyForecastGeneration();
      console.log(`✅ Generated ${forecasts.length} forecasts for ${forecasts.length / 3} locations`);
      return forecasts;
    } catch (error) {
      console.error('❌ Error in manual forecast generation:', error);
      throw error;
    }
  }

  // Stop a specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`⏹️ Stopped job: ${jobName}`);
    }
  }

  // Stop all jobs
  stopAll() {
    console.log('⏹️ Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  // Get status of all jobs
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  // Restart a job
  restartJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.start();
      console.log(`🔄 Restarted job: ${jobName}`);
    }
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;