import pandas as pd
import numpy as np
import datetime
import os

CATEGORIES = ["Grains", "Dairy", "Proteins", "Vegetables", "Fruits", "Beverages", "Canned Goods", "Bakery"]
DAYS_OF_HISTORY = 730 # 2 years

def generate_data():
    print("Generating historical dataset...")
    today = datetime.date.today()
    dates = [today - datetime.timedelta(days=x) for x in range(DAYS_OF_HISTORY)]
    dates.reverse() # Chronological order

    data = []
    
    for cat in CATEGORIES:
        # Give each category a different baseline and trend
        base_demand = np.random.randint(50, 200)
        
        for i, d in enumerate(dates):
            # Add a slight upward trend over time
            trend = i * 0.05
            
            # Add weekly seasonality (e.g., higher demand on weekends)
            weekly_seasonality = 20 if d.weekday() >= 5 else 0
            
            # Add random noise
            noise = np.random.normal(0, 15)
            
            # Calculate final daily demand (prevent negative values)
            y = max(0, int(base_demand + trend + weekly_seasonality + noise))
            
            data.append({
                "category": cat,
                "ds": d,  # Prophet requires the date column to be named 'ds'
                "y": y    # Prophet requires the target column to be named 'y'
            })

    df = pd.DataFrame(data)
    
    # Ensure a data directory exists
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/historical_demand.csv", index=False)
    print(f"Dataset generated with {len(df)} rows and saved to data/historical_demand.csv")

if __name__ == "__main__":
    generate_data()