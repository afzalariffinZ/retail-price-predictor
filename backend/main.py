import os
import joblib
import numpy as np
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
import json
from datetime import datetime

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. LOAD ALL ASSETS
models_dict = joblib.load('price_models.pkl')
df_history = pd.read_parquet("price_history.parquet") # Retail history
df_econ = pd.read_parquet("econ_history.parquet")    # Economic history (USD/Diesel)

try:
    with open('asymmetry_offsets.json', 'r') as f:
        asymmetry_map = json.load(f)
except:
    asymmetry_map = {}

# 2. SETUP GEMINI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# 3. INPUT/OUTPUT SCHEMAS
class PriceInput(BaseModel):
    item: str
    state: str
    # These are optional if a target_date is provided
    usd_now: float = None
    usd_lag_60: float = None
    diesel_now: float = None
    diesel_lag_30: float = None
    is_festive: int = 0
    target_date: str = None # Format: YYYY-MM-DD

ITEM_MAP = {
    "ayam bersih": "AYAM BERSIH - STANDARD",
    "betik biasa": "BETIK BIASA",
    "minyak masak paket": "MINYAK MASAK PAKET (PELBAGAI JENAMA)"
}

@app.post("/predict")
async def get_prediction(data: PriceInput):
    # A. Map Names
    official_item_name = ITEM_MAP.get(data.item.lower(), data.item)
    state_name = data.state.capitalize()
    model_key = f"{official_item_name}_{state_name}"
    
    # B. DECIDE FEATURE SOURCE: Date Lookup OR Manual Sliders
    if data.target_date:
        # Search our econ database for this specific day
        target_dt = pd.to_datetime(data.target_date)
        econ_row = df_econ[df_econ['date'] == target_dt]
        
        if econ_row.empty:
            return {"error": f"No economic data available for {data.target_date}"}
        
        # Pull actual historical values
        usd_now = float(econ_row['USD'].iloc[0])
        usd_lag = float(econ_row['usd_lag_60'].iloc[0]) # Use your lag choice
        # Apply regional diesel logic
        diesel_now = float(econ_row['diesel_eastmsia'].iloc[0] if state_name == "Sarawak" else econ_row['diesel'].iloc[0])
        diesel_lag = float(econ_row['diesel_EM_lag_30'].iloc[0] if state_name == "Sarawak" else econ_row['diesel_lag_30'].iloc[0])
        is_festive = data.is_festive # Usually manual or check calendar
    else:
        # Use slider values from the frontend
        usd_now = data.usd_now
        usd_lag = data.usd_lag_60
        diesel_now = data.diesel_now
        diesel_lag = data.diesel_lag_30
        is_festive = data.is_festive

    # C. Run XGBoost Prediction
    model = models_dict[model_key]
    features = np.array([[usd_now, usd_lag, diesel_now, diesel_lag, is_festive]])
    prediction = float(model.predict(features)[0])

    # D. Corrective Policy Logic (Oil is always 2.50)
    is_controlled = "MINYAK" in official_item_name.upper()
    if is_controlled:
        prediction = 2.50

    # E. Stickiness / Asymmetry (Objective 3)
    offset = asymmetry_map.get(model_key, 0.0)
    sticky_price = prediction + offset
    alert = "High Risk" if offset > 0.03 else "Stabilized"

    # F. Feature Impact (Directions)
    raw_imp = model.feature_importances_
    feature_impact = [
        {"name": "USD (Lagged)", "value": float(raw_imp[1]) * 100, "desc": "Imported feed cost impact."},
        {"name": "Diesel (Lagged)", "value": float(raw_imp[3]) * -100, "desc": "Logistics cost suppression."},
        {"name": "Supply Policy", "value": -25.0 if is_controlled else -5.0, "desc": "Institutional price rigidity."}
    ]

    # G. Historical & Future Context
    hist_df = df_history[(df_history['item'] == official_item_name) & (df_history['state'] == state_name)].sort_values('date').tail(180)
    history_list = [{"date": r['date'].strftime('%Y-%m-%d'), "price": round(r['price'], 2)} for _, r in hist_df.iterrows()]

    # H. Smart Future Projection (Flat for prediction, 2.50 for Oil)
    future = []
    last_date = hist_df['date'].max() if not hist_df.empty else pd.to_datetime("2025-07-28")
    for i in range(1, 31):
        proj_price = 2.50 if is_controlled else prediction
        future.append({
            "date": (last_date + pd.Timedelta(days=i)).strftime('%Y-%m-%d'),
            "price": round(proj_price, 2)
        })

    # I. Gemini Reasoning
    prompt = f"Explain RM {prediction:.2f} price for {data.item} in {data.state}. Inputs: USD {usd_now}, Diesel {diesel_now}. Max 2 sentences."
    try:
        response = gemini_model.generate_content(prompt)
        reasoning_text = response.text
    except:
        reasoning_text = "Analysis engine busy."

    return {
        "price": round(prediction, 2),
        "sticky_price": round(sticky_price, 2),
        "asymmetry_gap": round(offset, 3),
        "alert_level": alert,
        "feature_impact": feature_impact,
        "history": history_list,
        "future": future,
        "reasoning": reasoning_text
    }