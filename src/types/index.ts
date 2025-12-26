// Type definitions for the application

export interface DataPoint {
  x: number;
  y: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface RegressionResult {
  type: 'linear' | 'polynomial' | 'exponential';
  formula: string;
  coefficients: number[];
  r2: number;
  mae: number;
  rmse: number;
  predictions: number[];
}

export interface PredictionResult {
  prediction: number;
  features: number[];
}

export interface TimeSeriesPredictionResult {
  predictions: TimeSeriesDataPoint[];
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}
