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
# 1. SETUP & INSTITUTIONAL ASSETS
# ==========================================
load_dotenv()
app = FastAPI(title="Helang: Malaysian National Market Sentinel")

origins = [
    "http://localhost:1000",
    "https://helang.vercel.app",
    "https://retail-price-predictor.vercel.app" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load machine learning models (XGBoost)
models_dict = joblib.load('price_models.pkl')

# Load institutional databases
df_history = pd.read_parquet("price_history.parquet") 
df_econ = pd.read_parquet("econ_history.parquet")    

# Official MAE values (Statistical Noise Floor) from Notebook Page 68
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

# Empirical Item-Specific Premise Multipliers
# Derived from Aligned 3.5-year cross-sectional analysis (2022-2025)
PREMISE_WEIGHTS = {
    "AYAM BERSIH - STANDARD": {
        "hypermarket": 1.000,
        "supermarket": 1.026,
        "wet_market": 1.118,  # Logistical fragmentation premium
        "mini_mart": 1.088,
        "other": 1.050
    },
    "BETIK BIASA": {
        "hypermarket": 1.000,
        "supermarket": 0.946, 
        "wet_market": 0.983,  # Direct-from-farm efficiency
        "mini_mart": 1.050,
        "other": 1.000
    }
}

# Setup Gemini 2.0 Flash for automated economic reasoning
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# ==========================================
# 2. DATA SCHEMAS
# ==========================================
class PriceInput(BaseModel):
    item: str
    state: str
    premise_type: str = "hypermarket"  
    actual_market_price: float = None  # Live price to be audited
    target_date: str = None            # Format: YYYY-MM-DD
    # Manual overrides for simulation mode
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
# 3. CORE SENTINEL ENGINE
# ==========================================
@app.post("/predict")
async def get_prediction(data: PriceInput):
    # A. Name Normalization & Model Fetch
    official_item_name = ITEM_MAP.get(data.item.lower(), data.item)
    state_name = data.state.capitalize()
    model_key = f"{official_item_name}_{state_name}"
    
    if model_key not in models_dict:
        raise HTTPException(status_code=404, detail="Regional model configuration not found.")

    # B. Global Variables (Pre-defining base_mae to avoid scope errors)
    base_mae = MAE_MAPPING.get(model_key, 0.15) 
    cost_regime = "STABLE"
    is_controlled = "MINYAK" in official_item_name.upper()
    model = models_dict[model_key]
    
    # C. FEATURE PIPELINE
    if data.target_date:
        target_dt = pd.to_datetime(data.target_date)
        econ_row = df_econ[df_econ['date'] == target_dt]
        
        if econ_row.empty:
            raise HTTPException(status_code=404, detail=f"No economic data available for {data.target_date}")
        
        # Causal Regime Detection (Checking the cost trend vs yesterday)
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
    else:
        usd_now, usd_lag = data.usd_now, data.usd_lag_60
        diesel_now, diesel_lag = data.diesel_now, data.diesel_lag_30

    # D. FAIR PRICE INFERENCE (Today)
    features = np.array([[usd_now, usd_lag, diesel_now, diesel_lag, data.is_festive]])
    fair_prediction = 2.50 if is_controlled else float(model.predict(features)[0])

    # E. DYNAMIC 30-DAY SENTINEL HORIZON (The Orange Line Curve)
    future_points = []
    forecast_start = pd.to_datetime(data.target_date) if data.target_date else datetime.now()
    
    for i in range(0, 31):
        f_date = forecast_start + timedelta(days=i)
        f_econ = df_econ[df_econ['date'] == f_date]
        
        if not f_econ.empty and not is_controlled:
            # Extract features for each day in the horizon
            # This is possible because P(t) depends on Cost(t-60), which is known.
            f_u_now = float(f_econ['USD'].iloc[0])
            f_u_lag = float(f_econ['usd_lag_60'].iloc[0])
            f_d_now = float(f_econ['diesel_eastmsia'].iloc[0] if state_name == "Sarawak" else f_econ['diesel'].iloc[0])
            f_d_lag = float(f_econ['diesel_EM_lag_30'].iloc[0] if state_name == "Sarawak" else f_econ['diesel_lag_30'].iloc[0])
            
            f_feat = np.array([[f_u_now, f_u_lag, f_d_now, f_d_lag, data.is_festive]])
            f_price = float(model.predict(f_feat)[0])
            future_points.append({"date": f_date.strftime('%Y-%m-%d'), "price": round(f_price, 2)})
        else:
            # Default to flat line if no future econ data or item is controlled
            future_points.append({"date": f_date.strftime('%Y-%m-%d'), "price": round(fair_prediction, 2)})

    # F. THE AUDIT LAYER (Premise-Weighted Confidence Intervals)
    audit = {"status": "Monitoring Only", "color": "Grey", "gap_sen": 0}
    if data.actual_market_price:
        item_map = PREMISE_WEIGHTS.get(official_item_name, {})
        weight = item_map.get(data.premise_type.lower(), 1.0)
        
        # Calculate Adjusted Buffer (The 1x vs 2x MAE rule)
        tolerance_buffer = base_mae * weight
        gap = data.actual_market_price - fair_prediction
        
        if gap > (2 * tolerance_buffer):
            status, color = "HIGH RISK (High Price Anomaly)", "Red"
        elif gap > tolerance_buffer:
            status, color = "CAUTION (Significant Asymmetry)", "Yellow"
        elif gap < -tolerance_buffer:
            status, color = "SAFE (Competitive Pricing)", "Blue"
        else:
            status, color = "STABILIZED (Fair Market)", "Green"
            
        audit = {
            "status": status,
            "color": color,
            "gap_sen": round(gap * 100, 1),
            "threshold_used_sen": round(tolerance_buffer * 100, 1),
            "premise_multiplier": weight
        }

    # G. GENERATIVE REASONING (Explainable AI)
    prompt = (
        f"Act as a Senior Sentinel at Bank Negara Malaysia. Analyze {official_item_name} in {state_name} ({data.premise_type}). "
        f"Retailer is charging RM {data.actual_market_price or 'N/A'}. Model Fair Price is RM {fair_prediction:.2f}. "
        f"Economic Basis: USD {usd_now}, Diesel RM {diesel_now}. Trend: {cost_regime}. "
        f"In 2 sentences, explain if the markup is justified by structural overhead or indicates price stickiness."
    )
    try:
        response = gemini_model.generate_content(prompt)
        reasoning = response.text.strip()
    except Exception as e:
        # Log the actual error for debugging
        print(f"Gemini API Error: {type(e).__name__}: {str(e)}")
        reasoning = f"Causal reasoning temporarily unavailable. Error: {type(e).__name__}. Analytical output remains valid."

    # H. SENTINEL DATA ASSEMBLY
    hist_df = df_history[(df_history['item'] == official_item_name) & 
                         (df_history['state'] == state_name)].sort_values('date').tail(180)
    
    return {
        "sentinel_meta": {
            "item": official_item_name, "state": state_name, "premise": data.premise_type, "regime": cost_regime
        },
        "pricing_hub": {
            "fair_price": round(fair_prediction, 2),
            "actual_price": data.actual_market_price,
            "audit_report": audit
        },
        "visual_analytics": {
            "historical_line": [{"date": r['date'].strftime('%Y-%m-%d'), "price": r['price']} for _, r in hist_df.iterrows()],
            "future_line": future_points,
            "feature_impact": [
                {"label": "Currency Basis (60d)", "impact": round(float(model.feature_importances_[1]) * 100, 1)},
                {"label": "Logistics Basis (30d)", "impact": round(float(model.feature_importances_[3]) * 100, 1)},
                {"label": "Seasonal/Policy", "impact": round(float(model.feature_importances_[4]) * 100, 1)}
            ]
        },
        "sentinel_reasoning": reasoning,
        "system_health": {
            "mae_noise_floor_sen": round(base_mae * 100, 1),
            "data_cutoff": "2025-07-28"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)