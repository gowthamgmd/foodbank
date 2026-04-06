import pandas as pd
from prophet import Prophet
from prophet.serialize import model_to_json
import os

CATEGORIES = ["Grains", "Dairy", "Proteins", "Vegetables", "Fruits", "Beverages", "Canned Goods", "Bakery"]

def train_and_save_models():
    print("Loading historical data...")
    df = pd.read_csv("data/historical_demand.csv")
    
    os.makedirs("models", exist_ok=True)
    
    for cat in CATEGORIES:
        print(f"Training Prophet model for {cat}...")
        
        # Filter data for the specific category
        cat_df = df[df["category"] == cat][["ds", "y"]]
        
        # Initialize and fit the model
        # You can tune parameters here (e.g., seasonality_mode='multiplicative')
        m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        m.fit(cat_df)
        
        # Save the model to a JSON file
        model_path = f"models/prophet_{cat.replace(' ', '_').lower()}.json"
        with open(model_path, 'w') as fout:
            fout.write(model_to_json(m))
            
        print(f"Model saved to {model_path}")

    print("All models trained and saved successfully.")

if __name__ == "__main__":
    train_and_save_models()