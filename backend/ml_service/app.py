from flask import Flask, request, jsonify
from flask_restful import Resource, Api
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
# from prophet import Prophet
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense

app = Flask(__name__)
api = Api(app)

def train_and_predict_arima(series, order=(5,1,0), steps=5):
    model = ARIMA(series, order=order)
    model_fit = model.fit()
    forecast = model_fit.predict(start=len(series), end=len(series)+steps-1)
    return forecast.tolist()

class PredictWaterQuality(Resource):
    def post(self):
        data = request.get_json()
        if not data or 'historical_data' not in data or 'locationId' not in data:
            return {'message': 'Invalid request data'}, 400

        historical_data_df = pd.DataFrame(data['historical_data'])
        # Ensure timestamp is datetime and set as index for time series analysis
        historical_data_df['timestamp'] = pd.to_datetime(historical_data_df['timestamp'])
        historical_data_df = historical_data_df.set_index('timestamp').sort_index()

        # Parameters to forecast
        parameters = ['bod', 'do', 'ph', 'nitrate', 'fecalColiform']
        predictions = {}

        for param in parameters:
            if param in historical_data_df.columns:
                # For simplicity, using a fixed ARIMA order. In a real scenario, this would be optimized.
                # Also, handling missing values and stationarity would be crucial.
                series = historical_data_df[param].dropna()
                if len(series) > 10: # Need enough data points for ARIMA
                    try:
                        predictions[f'{param}_forecast'] = train_and_predict_arima(series, steps=5)
                    except Exception as e:
                        print(f"Error forecasting {param}: {e}")
                        predictions[f'{param}_forecast'] = [np.nan] * 5 # Return NaNs on error
                else:
                    predictions[f'{param}_forecast'] = [np.nan] * 5 # Not enough data
            else:
                predictions[f'{param}_forecast'] = [np.nan] * 5 # Parameter not in data

        return jsonify(predictions)

api.add_resource(PredictWaterQuality, '/predict')

if __name__ == '__main__':
    app.run(debug=True, port=5000)