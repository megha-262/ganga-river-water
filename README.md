# Ganga River Water Quality Monitoring System

A comprehensive MERN stack application for monitoring, analyzing, and forecasting water quality in the Ganga River. This system provides real-time water quality data, predictive analytics, alert management, and an AI-powered chatbot for environmental insights.

## 🌊 Features

- **Real-time Water Quality Monitoring**: Track key parameters like dissolved oxygen, BOD, nitrate, fecal coliform, pH, temperature, and turbidity
- **Interactive Dashboard**: Comprehensive visualization of water quality data with charts and maps
- **Predictive Forecasting**: 7-day water quality forecasts using machine learning algorithms
- **Alert System**: Automated alerts for water quality threshold violations with severity levels
- **AI Chatbot**: Intelligent assistant powered by Google Gemini AI for environmental queries
- **Location Management**: Monitor multiple locations along the Ganga River
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Chart.js and Recharts for data visualization
- **Maps**: React Leaflet for interactive location mapping
- **State Management**: React hooks and context API

### Backend (Node.js/Express)
- **Framework**: Express.js with RESTful API design
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **AI Integration**: Google Gemini AI for chatbot functionality
- **Caching**: In-memory caching for performance optimization

## 📁 Project Structure

```
ganga-river-water/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── charts/      # Chart components
│   │   │   ├── common/      # Common UI components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # UI elements
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── styles/          # CSS and styling
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Node.js backend API
│   ├── config/              # Configuration files
│   ├── data/                # Seed data
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── services/            # Business logic services
│   ├── package.json
│   └── server.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ganga-river-water.git
cd ganga-river-water
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create .env file (optional)
cp .env.example .env
```

4. **Database Setup**
```bash
# Start MongoDB service
# Then seed the database
cd backend
npm run seed
```

5. **Start the Application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ganga-water-monitoring

# Server
PORT=5001
NODE_ENV=development

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Machine Learning Service (optional)
ML_SERVICE_URL=http://localhost:5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# App Configuration
REACT_APP_NAME=Ganga River Water Quality Monitoring
REACT_APP_VERSION=1.0.0

# Development
GENERATE_SOURCEMAP=false
```

## 📊 Database Schema

### Location Model
```javascript
{
  name: String,           // Location name
  city: String,           // City name
  state: String,          // State name
  coordinates: {          // GPS coordinates
    latitude: Number,
    longitude: Number
  },
  riverKm: Number,        // Distance from river source
  description: String,    // Location description
  isActive: Boolean,      // Active status
  installationDate: Date  // Installation date
}
```

### WaterQuality Model
```javascript
{
  locationId: ObjectId,   // Reference to Location
  timestamp: Date,        // Measurement timestamp
  parameters: {
    dissolvedOxygen: Number,      // mg/L
    biochemicalOxygenDemand: Number, // mg/L
    nitrate: Number,              // mg/L
    fecalColiform: Number,        // MPN/100ml
    pH: Number,                   // pH units
    temperature: Number,          // °C
    turbidity: Number             // NTU
  },
  waterQualityIndex: Number,      // 0-100
  overallStatus: String,          // excellent/good/moderate/poor/very_poor
  weather: Object,                // Weather conditions
  dataSource: String,             // automated/manual
  qualityFlags: [String]          // Data quality indicators
}
```

### Forecast Model
```javascript
{
  locationId: ObjectId,   // Reference to Location
  forecastDate: Date,     // Forecast generation date
  predictions: [{         // 7-day predictions
    date: Date,
    dayOffset: Number,    // 1-7 days
    parameters: {         // Predicted values with confidence
      dissolvedOxygen: { predicted: Number, confidence: Number, trend: String },
      // ... other parameters
    },
    predictedWQI: Number,
    predictedStatus: String,
    expectedWeather: Object
  }],
  modelInfo: {           // ML model information
    algorithm: String,
    version: String,
    accuracy: Number
  },
  forecastAlerts: [Object] // Predicted alerts
}
```

### Alert Model
```javascript
{
  locationId: ObjectId,   // Reference to Location
  locationName: String,   // Location name
  type: String,          // pollution/contamination/chemical/biological/physical/system
  severity: String,      // low/medium/high/critical
  level: Number,         // 1-5 (NORMAL/ADVISORY/WARNING/CRITICAL/EMERGENCY)
  title: String,         // Alert title
  message: String,       // Alert description
  parameters: Object,    // Affected parameters
  thresholds: Object,    // Threshold information
  status: String,        // active/acknowledged/resolved/false_positive
  resolved: Boolean,     // Resolution status
  resolvedAt: Date,      // Resolution timestamp
  actions: [Object],     // Action history
  priority: Number,      // 1-5 priority level
  source: String         // automated/manual/system
}
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication
Most endpoints are public for monitoring purposes. Future versions may include authentication for administrative functions.

### Health Check
```http
GET /health
```
Returns system health status and database connectivity.

### Locations API

#### Get All Locations
```http
GET /locations
```
Returns all active monitoring locations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "location_id",
      "name": "Haridwar",
      "city": "Haridwar",
      "state": "Uttarakhand",
      "coordinates": {
        "latitude": 29.9457,
        "longitude": 78.1642
      },
      "riverKm": 253,
      "isActive": true
    }
  ]
}
```

#### Get Location by ID
```http
GET /locations/:id
```
Returns detailed information for a specific location.

#### Get Nearby Locations
```http
GET /locations/nearby?lat=29.9457&lng=78.1642&radius=50
```
Returns locations within specified radius (km).

#### Create Location (Admin)
```http
POST /locations
Content-Type: application/json

{
  "name": "New Location",
  "city": "City Name",
  "state": "State Name",
  "coordinates": {
    "latitude": 29.9457,
    "longitude": 78.1642
  },
  "riverKm": 100,
  "description": "Location description"
}
```

#### Update Location (Admin)
```http
PUT /locations/:id
```

#### Delete Location (Admin)
```http
DELETE /locations/:id
```

### Water Quality API

#### Get Water Quality Data
```http
GET /water-quality?locationId=location_id&startDate=2024-01-01&endDate=2024-01-31&limit=100&page=1
```

**Query Parameters:**
- `locationId` (optional): Filter by location
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Results per page (default: 50)
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status (excellent/good/moderate/poor/very_poor)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "reading_id",
      "locationId": "location_id",
      "timestamp": "2024-01-15T10:30:00Z",
      "parameters": {
        "dissolvedOxygen": 8.5,
        "biochemicalOxygenDemand": 2.1,
        "nitrate": 1.2,
        "fecalColiform": 150,
        "pH": 7.8,
        "temperature": 22.5,
        "turbidity": 5.2
      },
      "waterQualityIndex": 78,
      "overallStatus": "good"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 250,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Latest Water Quality
```http
GET /water-quality/latest
```
Returns the most recent water quality reading for each location.

#### Get Location-Specific Data
```http
GET /water-quality/location/:locationId?days=30
```
Returns water quality data for a specific location.

#### Get Trends
```http
GET /water-quality/trends/:locationId?parameter=dissolvedOxygen&days=30
```
Returns trend analysis for a specific parameter.

#### Get Alerts
```http
GET /water-quality/alerts?severity=high&status=active
```
Returns water quality alerts.

#### Submit Water Quality Data
```http
POST /water-quality
Content-Type: application/json

{
  "locationId": "location_id",
  "parameters": {
    "dissolvedOxygen": 8.5,
    "biochemicalOxygenDemand": 2.1,
    "nitrate": 1.2,
    "fecalColiform": 150,
    "pH": 7.8,
    "temperature": 22.5,
    "turbidity": 5.2
  },
  "weather": {
    "temperature": 25,
    "humidity": 65,
    "rainfall": 0
  },
  "dataSource": "automated"
}
```

#### Get Combined Data
```http
GET /water-quality/combined/:locationId?days=7
```
Returns combined water quality data with location details.

### Forecasts API

#### Get Forecasts
```http
GET /forecasts?locationId=location_id&days=7
```
Returns water quality forecasts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "forecast_id",
      "locationId": "location_id",
      "forecastDate": "2024-01-15T00:00:00Z",
      "predictions": [
        {
          "date": "2024-01-16T00:00:00Z",
          "dayOffset": 1,
          "parameters": {
            "dissolvedOxygen": {
              "predicted": 8.2,
              "confidence": 85,
              "trend": "stable"
            }
          },
          "predictedWQI": 76,
          "predictedStatus": "good"
        }
      ],
      "modelInfo": {
        "algorithm": "rule-based",
        "version": "1.0",
        "accuracy": 75
      }
    }
  ]
}
```

#### Get Latest Forecast
```http
GET /forecasts/latest/:locationId
```
Returns the most recent forecast for a location.

#### Generate Forecast
```http
POST /forecasts/generate/:locationId
```
Generates a new forecast for the specified location.

#### Generate All Forecasts
```http
POST /forecasts/generate-all
```
Generates forecasts for all active locations.

#### Get All Locations Forecasts
```http
GET /forecasts/all-locations
```
Returns latest forecasts for all locations.

#### Generate ML Forecast
```http
POST /forecasts/generate-ml/:locationId
```
Generates forecast using machine learning service.

### Alerts API

#### Get Alerts
```http
GET /alerts?severity=high&status=active&locationId=location_id&limit=50&page=1
```

**Query Parameters:**
- `severity` (optional): low/medium/high/critical
- `status` (optional): active/acknowledged/resolved
- `locationId` (optional): Filter by location
- `level` (optional): Alert level 1-5
- `type` (optional): Alert type
- `limit` (optional): Results per page
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "alert_id",
      "locationId": "location_id",
      "locationName": "Haridwar",
      "type": "pollution",
      "severity": "high",
      "level": 4,
      "levelName": "CRITICAL",
      "title": "High Fecal Coliform Detected",
      "message": "Fecal coliform levels exceed safe limits",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 25
  }
}
```

#### Get Recent Alerts
```http
GET /alerts/recent?hours=24
```
Returns alerts from the last specified hours.

#### Get Alert Summary
```http
GET /alerts/summary
```
Returns alert statistics and summary.

#### Get Alert Statistics
```http
GET /alerts/statistics?days=30
```
Returns detailed alert statistics.

#### Get Alert Trends
```http
GET /alerts/trends?days=30&groupBy=day
```
Returns alert trend analysis.

#### Get Alerts by Level
```http
GET /alerts/level/:level
```
Returns alerts for a specific severity level.

#### Get Location Alerts
```http
GET /alerts/location/:locationId?days=30
```
Returns alerts for a specific location.

#### Get Parameter Alerts
```http
GET /alerts/parameters/:parameter?days=30
```
Returns alerts for a specific parameter.

#### Resolve Alert
```http
POST /alerts/:id/resolve
Content-Type: application/json

{
  "resolvedBy": "admin_user",
  "notes": "Issue resolved after maintenance"
}
```

#### Acknowledge Alert
```http
POST /alerts/:id/acknowledge
Content-Type: application/json

{
  "acknowledgedBy": "operator_user",
  "notes": "Alert acknowledged, investigating"
}
```

### Chatbot API

#### Send Message
```http
POST /chatbot/message
Content-Type: application/json

{
  "message": "What is the current water quality at Haridwar?",
  "sessionId": "session_123",
  "stationId": "location_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "The current water quality at Haridwar shows...",
    "sessionId": "session_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Conversation
```http
GET /chatbot/conversation/:sessionId
```
Returns conversation history for a session.

#### Delete Conversation
```http
DELETE /chatbot/conversation/:sessionId
```
Deletes a conversation session.

#### Chatbot Health
```http
GET /chatbot/health
```
Returns chatbot service health status.

## 🔍 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Environment Variables

#### Backend
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ganga-water-monitoring
PORT=5001
NODE_ENV=production
GEMINI_API_KEY=your_production_gemini_key
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_NAME=Ganga River Water Quality Monitoring
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### Build Commands
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Indian government water quality standards
- MongoDB for database solutions
- Google Gemini AI for chatbot capabilities
- React and Node.js communities
- Environmental monitoring best practices

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ for environmental conservation and water quality monitoring**
