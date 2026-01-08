# Helang: Malaysian National Market Sentinel


A sophisticated price monitoring and prediction system designed to detect price anomalies and profiteering in essential goods across Malaysian states. Built with machine learning and AI-powered economic reasoning to provide real-time market surveillance.

**[Try the live application →](https://helang.vercel.app/)**

Test the dashboard with real-time predictions and AI-powered market analysis.

<img width="2522" height="1171" alt="image" src="https://github.com/user-attachments/assets/e081726c-0b17-46a9-afdb-97e445f725c9" />

## 🎯 Overview


Helang (named after the Malaysian eagle) is a full-stack data science application that serves as a "market sentinel" for monitoring essential commodity prices in Malaysia. The system combines XGBoost predictive models with Google's Gemini AI to provide:

- **Fair Price Predictions**: Machine learning models trained on 3.5 years of cross-sectional data (2022-2025)
- **Price Anomaly Detection**: Automated auditing system that flags suspicious pricing patterns
- **Economic Reasoning**: AI-powered causal analysis explaining price movements
- **30-Day Price Forecasts**: Forward-looking predictions based on economic indicators
- **Regional Monitoring**: State-specific tracking (Selangor, Sarawak, Kelantan)

### Monitored Items
- Ayam Bersih (Standard Chicken)
- Betik Biasa (Papaya)
- Minyak Masak Paket (Cooking Oil)

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **ML Engine**: XGBoost models with premise-specific multipliers
- **Economic Features**: USD/MYR exchange rates, diesel prices (with lag coefficients)
- **Audit System**: MAE-based confidence intervals with color-coded risk levels
- **AI Reasoning**: Gemini 2.0 Flash for explainable economic analysis
- **Data Pipeline**: Historical price data (180 days) + future projections (30 days)

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Interactive Dashboard**: Real-time price predictions and visualizations
- **Historical Context**: Recharts-powered trend analysis
- **Feature Impact**: Visual representation of economic drivers
- **Audit Reporting**: Color-coded alerts (Green/Yellow/Red/Blue/Grey)
- **Gemini Analyst**: AI-generated market insights panel

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Ensure data files are present:
- `price_models.pkl` - Trained XGBoost models
- `price_history.parquet` - Historical pricing data
- `econ_history.parquet` - Economic indicators
- `asymmetry_offsets.json` - Premise-specific adjustments

5. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 📊 Key Features

### 1. Fair Price Calculation
Uses lagged economic indicators to predict fair market prices:
- **USD/MYR Exchange Rate** (current + 60-day lag)
- **Diesel Prices** (current + 30-day lag)
- **Festive Season Flags**
- **Premise Type Adjustments**

### 2. Audit System
Four-tier classification system:
- 🟢 **Green**: Stabilized (Fair Market)
- 🟡 **Yellow**: Caution (Significant Asymmetry)
- 🔴 **Red**: High Risk (Profiteering Suspected)
- 🔵 **Blue**: Safe (Competitive Pricing)
- ⚪ **Grey**: Monitoring Only (No market price provided)

### 3. Premise-Specific Multipliers
Empirically-derived weights accounting for structural cost differences:
- Hypermarket: 1.000 (baseline)
- Supermarket: 1.026
- Wet Market: 1.118 (logistical fragmentation premium)
- Mini Mart: 1.088

### 4. Regime Detection
Identifies market trends:
- **UP**: Rising input costs
- **DOWN**: Falling input costs (potential price stickiness)
- **STABLE**: Equilibrium conditions

## 🔧 API Endpoints

### POST `/predict`
Main prediction endpoint for price analysis.

**Request Body:**
```json
{
  "item": "ayam bersih",
  "state": "selangor",
  "premise_type": "hypermarket",
  "actual_market_price": 9.80,
  "target_date": "2025-07-28",
  "is_festive": 0,
  "usd_now": 4.75,
  "usd_lag_60": 4.70,
  "diesel_now": 2.15,
  "diesel_lag_30": 2.10
}
```

**Response:**
```json
{
  "sentinel_meta": {
    "item": "AYAM BERSIH - STANDARD",
    "state": "Selangor",
    "premise": "hypermarket",
    "regime": "UP"
  },
  "pricing_hub": {
    "fair_price": 9.42,
    "actual_price": 9.80,
    "audit_report": {
      "status": "CAUTION (Significant Asymmetry)",
      "color": "Yellow",
      "gap_sen": 38,
      "threshold_used_sen": 14.2
    }
  },
  "visual_analytics": {
    "historical_line": [...],
    "future_line": [...],
    "feature_impact": [...]
  },
  "sentinel_reasoning": "AI-generated analysis...",
  "system_health": {
    "mae_noise_floor_sen": 14.2,
    "data_cutoff": "2025-07-28"
  }
}
```

## 📁 Project Structure

```
dsproject_dashboard/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── price_models.pkl          # Trained ML models
│   ├── price_history.parquet     # Historical data
│   ├── econ_history.parquet      # Economic indicators
│   └── .env                      # API keys (not in repo)
│
└── dashboard/
    ├── app/
    │   ├── page.tsx              # Main dashboard page
    │   ├── layout.tsx            # App layout
    │   └── globals.css           # Global styles
    ├── components/
    │   ├── hero-prediction.tsx   # Main prediction card
    │   ├── gemini-analyst.tsx    # AI reasoning panel
    │   ├── feature-impact.tsx    # Feature importance chart
    │   ├── historical-context.tsx # Price trend visualization
    │   ├── sidebar.tsx           # Controls & inputs
    │   └── ui/                   # shadcn/ui components
    └── package.json              # Node dependencies
```

## 🧪 Technology Stack

**Backend:**
- FastAPI - High-performance API framework
- Scikit-learn - XGBoost model training & inference
- Pandas & NumPy - Data processing
- Google Generative AI - Gemini 2.0 Flash integration
- Python-dotenv - Environment management

**Frontend:**
- Next.js 16 - React framework
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- Recharts - Data visualization
- Radix UI - Accessible components
- Framer Motion - Smooth animations
- Lucide React - Icon library

## 📈 Data Sources

- **Price History**: 3.5 years of commodity pricing (2022-2025)
- **Economic Indicators**: USD/MYR exchange rates, diesel prices
- **Statistical Baselines**: Empirically-derived MAE values from 68-page analysis notebook

## 🎓 Use Cases

1. **Government Monitoring**: Bank Negara Malaysia-style market surveillance
2. **Consumer Protection**: Identifying unfair pricing practices
3. **Economic Research**: Understanding price transmission mechanisms
4. **Business Intelligence**: Competitive pricing strategies
5. **Policy Analysis**: Evaluating subsidy effectiveness (e.g., cooking oil controls)

## 🔐 Security Notes

- Store API keys in `.env` files (never commit to version control)
- Backend uses CORS middleware (configure for production)
- Consider rate limiting for production deployments

## 📝 License

This project is for educational and research purposes.

## 🙏 Acknowledgments

- Economic data aligned with Malaysian market structures
- ML models optimized for Southeast Asian commodity dynamics
- UI/UX inspired by financial market dashboards

---

**Built with 🦅 for transparent market governance**
