import os
import joblib
import numpy as np
import pandas as pd
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime, timedelta

# ==========================================
# 1. SETUP & ASSET LOADING
# ==========================================
load_dotenv()
app = FastAPI(title="Project Helang: Malaysian National Market Sentinel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the "Brains" (XGBoost Models)
models_dict = joblib.load('price_models.pkl')

# Load the "Memory" (Historical Data)
df_history = pd.read_parquet("price_history.parquet") 
df_econ = pd.read_parquet("econ_history.parquet")    

# Official MAE values (Statistical Noise Floor)
MAE_MAPPING = {
    "AYAM BERSIH - STANDARD_Selangor": 0.142,
    "AYAM BERSIH - STANDARD_Sarawak": 0.209,
    "AYAM BERSIH - STANDARD_Kelantan": 0.175,
    "BETIK BIASA_Sarawak": 0.109,
    "BETIK BIASA_Selangor": 0.383,
    "BETIK BIASA_Kelantan": 0.198,
    "MINYAK MASAK PAKET (PELBAGAI JENAMA)_Selangor": 0.0,
    "MINYAK MASAK PAKET (PELBAGAI JENAMA)_Sarawak": 0.0,
    "MINYAK MASAK PAKET (PELBAGAI JENAMA)_Kelantan": 0.0
}

# Empirical Premise Multipliers (Structural Market Overhead)
PREMISE_WEIGHTS = {
    "AYAM BERSIH - STANDARD": {
        "hypermarket": 1.000,
        "supermarket": 1.026,
        "wet_market": 1.118, 
        "mini_mart": 1.088,
        "other": 1.050
    },
    "BETIK BIASA": {
        "hypermarket": 1.000,
        "supermarket": 0.946, 
        "wet_market": 0.983,   
        "mini_mart": 1.050,
        "other": 1.000
    }
}

# Setup Gemini 2.0 Flash
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# ==========================================
# 2. API SCHEMAS
# ==========================================
class PriceInput(BaseModel):
    item: str
    state: str
    premise_type: str = "hypermarket"  
    actual_market_price: float = None  
    target_date: str = None            
    usd_now: float = None
    usd_lag_60: float = None
    diesel_now: float = None
    diesel_lag_30: float = None
    is_festive: int = 0

ITEM_MAP = {
    "ayam bersih": "AYAM BERSIH - STANDARD",
    "betik biasa": "BETIK BIASA",
    "minyak masak paket": "MINYAK MASAK PAKET (PELBAGAI JENAMA)"
}

# ==========================================
# 3. THE SENTINEL ENGINE
# ==========================================
@app.post("/predict")
async def get_prediction(data: PriceInput):
    # A. Model Identification
    official_item_name = ITEM_MAP.get(data.item.lower(), data.item)
    state_name = data.state.capitalize()
    model_key = f"{official_item_name}_{state_name}"
    
    if model_key not in models_dict:
        raise HTTPException(status_code=404, detail="Model configuration not found.")

    # B. Global Variables Initialization
    base_mae = MAE_MAPPING.get(model_key, 0.15) 
    cost_regime = "STABLE"
    
    # C. FEATURE PIPELINE
    if data.target_date:
        target_dt = pd.to_datetime(data.target_date)
        econ_row = df_econ[df_econ['date'] == target_dt]
        
        if econ_row.empty:
            raise HTTPException(status_code=404, detail="Econ data missing for target date.")
        
        # Causal Regime Detection (Rocket vs Feather)
        prev_dt = target_dt - pd.Timedelta(days=1)
        prev_row = df_econ[df_econ['date'] == prev_dt]
        if not prev_row.empty:
            curr_basis = float(econ_row['usd_lag_60'].iloc[0])
            prev_basis = float(prev_row['usd_lag_60'].iloc[0])
            cost_regime = "DOWN" if curr_basis < prev_basis else "UP"

        usd_now = float(econ_row['USD'].iloc[0])
        usd_lag = float(econ_row['usd_lag_60'].iloc[0])
        is_sarawak = (state_name == "Sarawak")
        diesel_now = float(econ_row['diesel_eastmsia'].iloc[0] if is_sarawak else econ_row['diesel'].iloc[0])
        diesel_lag = float(econ_row['diesel_EM_lag_30'].iloc[0] if is_sarawak else econ_row['diesel_lag_30'].iloc[0])
        is_festive = data.is_festive
    else:
        usd_now, usd_lag = data.usd_now, data.usd_lag_60
        diesel_now, diesel_lag = data.diesel_now, data.diesel_lag_30
        is_festive = data.is_festive

    # D. FAIR PRICE INFERENCE
    model = models_dict[model_key]
    features = np.array([[usd_now, usd_lag, diesel_now, diesel_lag, is_festive]])
    fair_prediction = float(model.predict(features)[0])

    # Policy Override (Cooking Oil)
    is_controlled = "MINYAK" in official_item_name.upper()
    if is_controlled:
        fair_prediction = 2.50

    # E. AUDIT ENGINE (Context-Aware Thresholds)
    audit = {"status": "Monitoring", "color": "Grey", "gap_sen": 0}
    if data.actual_market_price:
        item_weights = PREMISE_WEIGHTS.get(official_item_name, {})
        weight = item_weights.get(data.premise_type.lower(), 1.0)
        
        adjusted_buffer = base_mae * weight
        gap = data.actual_market_price - fair_prediction
        
        if gap > (2 * adjusted_buffer):
            status, color = "HIGH RISK (Profiteering Suspected)", "Red"
        elif gap > adjusted_buffer:
            status, color = "CAUTION (Asymmetric Behavior)", "Yellow"
        elif gap < -adjusted_buffer:
            status, color = "SAFE (Market Efficiency)", "Blue"
        else:
            status, color = "STABILIZED (Fair Price)", "Green"
            
        audit = {
            "status": status,
            "color": color,
            "gap_sen": round(gap * 100, 1),
            "buffer_sen": round(adjusted_buffer * 100, 1)
        }

    # F. HISTORICAL CONTEXT & FUTURE PROJECTION
    hist_df = df_history[(df_history['item'] == official_item_name) & 
                         (df_history['state'] == state_name)].sort_values('date').tail(180)
    
    history_points = [{"date": r['date'].strftime('%Y-%m-%d'), "price": round(r['price'], 2)} 
                      for _, r in hist_df.iterrows()]

    # Future 30-day projection (Constant based on today's cost-basis)
    future_points = []
    last_date = hist_df['date'].max() if not hist_df.empty else datetime.now()
    for i in range(1, 31):
        future_points.append({
            "date": (last_date + timedelta(days=i)).strftime('%Y-%m-%d'),
            "price": round(2.50 if is_controlled else fair_prediction, 2)
        })

    # G. GENERATIVE REASONING (The "Sentinel Voice")
    prompt = (
        f"You are a Senior Sentinel at Bank Negara. Analyze {official_item_name} in {state_name}. "
        f"Retailer is charging RM {data.actual_market_price or 'N/A'}. Fair Price is RM {fair_prediction:.2f}. "
        f"USD cost basis: {usd_now}. Diesel: {diesel_now}. Trend: {cost_regime}. "
        f"Explain in 2 sentences if this price is justified by supply chain lags or indicates stickiness."
    )
    try:
        reasoning = gemini_model.generate_content(prompt).text.strip()
    except:
        reasoning = "Causal reasoning engine busy."

    # H. FINAL SENTINEL PAYLOAD
    return {
        "sentinel_meta": {
            "item": official_item_name,
            "state": state_name,
            "premise": data.premise_type,
            "regime": cost_regime
        },
        "pricing_hub": {
            "fair_price": round(fair_prediction, 2),
            "actual_price": data.actual_market_price,
            "audit_report": audit
        },
        "visual_analytics": {
            "historical_line": history_points,
            "future_line": future_points,
            "feature_impact": [
                {"label": "Currency Basis (60d)", "impact": round(float(model.feature_importances_[1]) * 100, 1)},
                {"label": "Logistics Basis (30d)", "impact": round(float(model.feature_importances_[3]) * 100, 1)},
                {"label": "Seasonal/Policy", "impact": round(float(model.feature_importances_[4]) * 100, 1)}
            ]
        },
        "sentinel_reasoning": reasoning,
        "system_status": {
            "mae_floor_sen": round(base_mae * 100, 1),
            "data_integrity_date": "2025-07-28"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)