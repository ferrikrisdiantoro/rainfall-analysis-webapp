// Type definitions for the application

export interface DataPoint {
  x: number;
  y: number;
  enabled?: boolean;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface RegressionResult {
  type: 'linear' | 'polynomial' | 'exponential' | 'power' | 'logarithmic' | 'moving-average';
  formula: string;
  coefficients: number[];
  r2: number;
  mae: number;
  rmse: number;
  predictions: number[];
}

// Model types for prediction
export type ModelType = 'gbr' | 'xgb' | 'lstm' | 'bilstm' | 'hybrid' | 'arima';

// Model metadata info
export interface ModelInfo {
  type: ModelType;
  name: string;
  description: string;
  mae: number;
  rmse: number;
}

export interface PredictionResult {
  prediction: number;
  features: number[];
}

// Multi-model prediction response
export interface MultiModelPredictionResponse {
  success: true;
  model: {
    type: ModelType;
    name: string;
    mae: number;
    rmse: number;
  };
  horizon: number;
  predictions: TimeSeriesDataPoint[];
  historicalSummary: {
    count: number;
    startDate: string;
    endDate: string;
  };
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
  success?: false;
  error: string;
  details?: string;
}

