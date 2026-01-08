"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { HeroPrediction } from "@/components/hero-prediction"
import { GeminiAnalyst } from "@/components/gemini-analyst"
import { FeatureImpact } from "@/components/feature-impact"
import { HistoricalContext } from "@/components/historical-context"
import { Footer } from "@/components/footer"
import { LoadingState } from "@/components/loading-state"

import { Chatbot } from "@/components/chatbot"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState("ayam bersih")
  const [selectedState, setSelectedState] = useState("selangor")
  const [usdRate, setUsdRate] = useState([4.75])
  const [usdLag60, setUsdLag60] = useState([4.70])
  const [dieselPrice, setDieselPrice] = useState([2.15])
  const [dieselLag30, setDieselLag30] = useState([2.10])
  const [isFestive, setIsFestive] = useState(false)
  const [targetDate, setTargetDate] = useState("")
  const [useHistoricalMode, setUseHistoricalMode] = useState(false)
  
  // Prediction state
  const [currentPrediction, setCurrentPrediction] = useState(9.42)
  const [stickyPrice, setStickyPrice] = useState(9.46)
  const [asymmetryGap, setAsymmetryGap] = useState(0.04)
  const [alertLevel, setAlertLevel] = useState("High Risk")
  const [geminiReasoning, setGeminiReasoning] = useState("")
  const [featureImpact, setFeatureImpact] = useState<Array<{name: string, value: number}>>([])
  const [historyData, setHistoryData] = useState<Array<{date: string, price: number}>>([])
  const [futureData, setFutureData] = useState<Array<{date: string, price: number}>>([])

  const handleExecute = async () => {
    setIsLoading(true)
    
    try {
      const requestBody: any = {
        item: selectedItem,
        state: selectedState,
        is_festive: isFestive ? 1 : 0
      }

      // If using historical mode, send target_date; otherwise send slider values
      if (useHistoricalMode && targetDate) {
        requestBody.target_date = targetDate
      } else {
        requestBody.usd_now = usdRate[0]
        requestBody.usd_lag_60 = usdLag60[0]
        requestBody.diesel_now = dieselPrice[0]
        requestBody.diesel_lag_30 = dieselLag30[0]
      }

      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch prediction')
      }

      const data = await response.json()
      
      // Check for backend error (e.g., missing date data)
      if (data.error) {
        console.error('Backend error:', data.error)
        alert(data.error)
        return
      }
      
      setCurrentPrediction(data.price)
      setStickyPrice(data.sticky_price || data.price + 0.04)
      setAsymmetryGap(data.asymmetry_gap || 0.04)
      setAlertLevel(data.alert_level || "High Risk")
      setGeminiReasoning(data.reasoning)
      setFeatureImpact(data.feature_impact || [])
      setHistoryData(data.history || [])
      setFutureData(data.future || [])
    } catch (error) {
      console.error('Error fetching prediction:', error)
      // Keep existing values on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
         isOpen={isSidebarOpen}
         onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
         onExecute={handleExecute} 
         selectedItem={selectedItem}
         setSelectedItem={setSelectedItem}
         selectedState={selectedState}
         setSelectedState={setSelectedState}
         usdRate={usdRate}
         setUsdRate={setUsdRate}
         usdLag60={usdLag60}
         setUsdLag60={setUsdLag60}
         dieselPrice={dieselPrice}
         setDieselPrice={setDieselPrice}
         dieselLag30={dieselLag30}
         setDieselLag30={setDieselLag30}
         isFestive={isFestive}
         setIsFestive={setIsFestive}
         targetDate={targetDate}
         setTargetDate={setTargetDate}
         useHistoricalMode={useHistoricalMode}
         setUseHistoricalMode={setUseHistoricalMode}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        {isLoading && <LoadingState />}
        
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
          <Header />
          
          <div className="space-y-8">
            <section>
                <HeroPrediction 
                  prediction={currentPrediction} 
                  stickyPrice={stickyPrice}
                  asymmetryGap={asymmetryGap}
                  alertLevel={alertLevel}
                />
            </section>
            
            <section>
                <GeminiAnalyst reasoning={geminiReasoning} />
            </section>
            
            <section>
                <FeatureImpact data={featureImpact} />
            </section>
            
            <section>
                <HistoricalContext history={historyData} future={futureData} />
            </section>
          </div>
          
          <Footer />
        </div>
        
        <Chatbot currentPrediction={currentPrediction} currentItem={selectedItem} />
      </main>
    </div>
  )
}
