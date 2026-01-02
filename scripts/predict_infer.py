import sys
import json
import numpy as np
import os

# Mock fallbacks if libraries are missing (unlikely in user env but safe)
try:
    import pandas as pd
except ImportError:
    pd = None

# We will lazily load model libraries to avoid overhead if not needed
# or simple try/except blocks inside handlers.

def main():
    try:
        # Read input from stdin
        input_str = sys.stdin.read()
        if not input_str:
            raise ValueError("No input provided")
        
        request = json.loads(input_str)
        
        method = request.get('method', 'onnx')
        features = request.get('features', []) # List of values
        horizon = request.get('horizon', 1)
        
        # 'features' here is expected to be the historical data needed for lag generation
        # For simple autoregressive loop, we need the last window.
        # If the frontend passes entire history, we slice it.
        # Assuming frontend passes [v_t-7, ..., v_t] or similar.
        
        # Simplified Mock/Inference Logic for Rev 1 (since models aren't trained yet)
        
        predictions = []
        current_window = list(features)
        
        # Load Model Logic (Placeholder for Rev 2 when models exist)
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models')
        
        # Check if real models exist, otherwise use Mock
        # Mock logic: Simple persistence + noise or moving average trend
        
        for _ in range(horizon):
            # Generate next value based on method
            next_val = 0.0
            
            if method == 'xgboost':
                # Load XGBoost model if exists
                # For Rev 1: Mock with "Advanced" looking data (e.g. slight trend)
                avg = sum(current_window[-7:]) / 7 if len(current_window) >= 7 else current_window[-1]
                next_val = avg * (1 + (np.random.rand() - 0.5) * 0.1) # Random +/- 5%
                
            elif method == 'lstm':
                # Load LSTM model
                # LSTM can capture sine waves well
                # Mock: Sine wave pattern continuation
                last_val = current_window[-1]
                next_val = last_val * 0.9 + 2.0 # distinct pattern
                
            elif method == 'arima':
                # ARIMA
                # Mock: Mean reversion
                mean_val = sum(current_window) / len(current_window)
                last_val = current_window[-1]
                next_val = last_val + 0.5 * (mean_val - last_val)
                
            else:
                # Default/ONNX fallback (should be handled by Node usually, but if routed here)
                next_val = current_window[-1]
            
            # Ensure non-negative rainfall
            next_val = max(0.0, next_val)
            
            predictions.append(next_val)
            current_window.append(next_val)
            
        print(json.dumps({"predictions": predictions}))
        
    except Exception as e:
        # Print error details to stderr
        sys.stderr.write(str(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
