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

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)
  const [selectedItem, setSelectedItem] = useState("ayam bersih")
  const [selectedState, setSelectedState] = useState("selangor")
  const [premiseType, setPremiseType] = useState("hypermarket")
  const [actualMarketPrice, setActualMarketPrice] = useState("")
  const [usdRate, setUsdRate] = useState([4.75])
  const [usdLag60, setUsdLag60] = useState([4.70])
  const [dieselPrice, setDieselPrice] = useState([2.15])
  const [dieselLag30, setDieselLag30] = useState([2.10])
  const [isFestive, setIsFestive] = useState(false)
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
  const [useHistoricalMode, setUseHistoricalMode] = useState(false)
  
  // Prediction state
  const [currentPrediction, setCurrentPrediction] = useState(9.42)
  const [auditReport, setAuditReport] = useState<any>(null)
  const [causalAnalysis, setCausalAnalysis] = useState<any>(null)
  const [geminiReasoning, setGeminiReasoning] = useState("")
  const [featureImpact, setFeatureImpact] = useState<Array<{name: string, value: number}>>([])
  const [historyData, setHistoryData] = useState<Array<{date: string, price: number}>>([])
  const [futureData, setFutureData] = useState<Array<{date: string, price: number}>>([])

  const handleExecute = async () => {
    setIsLoading(true)
    
    // Auto-close sidebar on mobile after clicking execute
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
    
    try {
      const requestBody: any = {
        item: selectedItem,
        state: selectedState,
        premise_type: premiseType,
        is_festive: isFestive ? 1 : 0
      }

      // Add actual market price if provided
      if (actualMarketPrice && parseFloat(actualMarketPrice) > 0) {
        requestBody.actual_market_price = parseFloat(actualMarketPrice)
      }

      // If Manual Simulation Mode is OFF, use target_date; if ON, use slider values
      if (!useHistoricalMode && targetDate) {
        requestBody.target_date = targetDate
      } else if (useHistoricalMode) {
        requestBody.usd_now = usdRate[0]
        requestBody.usd_lag_60 = usdLag60[0]
        requestBody.diesel_now = dieselPrice[0]
        requestBody.diesel_lag_30 = dieselLag30[0]
      }
      
      console.log('Sending request:', requestBody)

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
      console.log('API URL:', `${apiUrl}/predict`)
      
      const response = await fetch(`${apiUrl}/predict`, {
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
      
      // Extract from new API structure
      const pricingHub = data.pricing_hub || {}
      const visualAnalytics = data.visual_analytics || {}
      const sentinelMeta = data.sentinel_meta || {}
      
      setCurrentPrediction(pricingHub.fair_price || 0)
      setAuditReport(pricingHub.audit_report || null)
      
      // Map sentinel_meta regime to causalAnalysis
      setCausalAnalysis({
        regime: sentinelMeta.regime || "STABLE",
        is_sticky: sentinelMeta.regime === "DOWN" && pricingHub.audit_report?.color === "Red"
      })
      
      setGeminiReasoning(data.sentinel_reasoning || "")
      
      // Map visual_analytics.feature_impact to our format
      if (visualAnalytics.feature_impact && visualAnalytics.feature_impact.length > 0) {
        setFeatureImpact(
          visualAnalytics.feature_impact.map((item: any) => ({
            name: item.label,
            value: item.impact
          }))
        )
      }
      
      // Map visual_analytics historical and future lines
      if (visualAnalytics.historical_line) {
        setHistoryData(visualAnalytics.historical_line)
        console.log('Historical data:', visualAnalytics.historical_line)
      }
      if (visualAnalytics.future_line) {
        setFutureData(visualAnalytics.future_line)
        console.log('Future data (orange line):', visualAnalytics.future_line)
      }
    } catch (error) {
      console.error('Error fetching prediction:', error)
      // Keep existing values on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
         isOpen={isSidebarOpen}
         onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
         onExecute={handleExecute} 
         selectedItem={selectedItem}
         setSelectedItem={setSelectedItem}
         selectedState={selectedState}
         setSelectedState={setSelectedState}
         premiseType={premiseType}
         setPremiseType={setPremiseType}
         actualMarketPrice={actualMarketPrice}
         setActualMarketPrice={setActualMarketPrice}
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
        
        <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl space-y-4 sm:space-y-6 md:space-y-8">
          <Header onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="space-y-8">
            <section>
                <HeroPrediction 
                  prediction={currentPrediction}
                  auditReport={auditReport}
                  causalAnalysis={causalAnalysis}
                />
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
      </main>
    </div>
  )
}
