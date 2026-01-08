"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeroPredictionProps {
  prediction?: number
  stickyPrice?: number
  asymmetryGap?: number
  alertLevel?: string
}

export function HeroPrediction({ 
  prediction = 9.42, 
  stickyPrice: backendStickyPrice = 9.46,
  asymmetryGap = 0.04,
  alertLevel = "High Risk"
}: HeroPredictionProps) {
  const [isSticky, setIsSticky] = useState(false)
  
  // Base fair price prediction
  const fairPrice = prediction
  // Use backend's sticky price calculation based on asymmetry research
  const stickyPrice = backendStickyPrice
  
  const displayPrice = isSticky ? stickyPrice.toFixed(2) : fairPrice.toFixed(2)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className={cn(
        "transition-colors duration-300", 
        isSticky && "border-red-500/50 bg-red-500/5"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isSticky ? "Sticky Price (Retailer)" : "Predicted Fair Price"}
          </CardTitle>
          <TrendingUp className={cn("h-4 w-4", isSticky ? "text-red-500" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-3xl font-bold", isSticky && "text-red-500")}>
            RM {displayPrice}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
             {isSticky ? "Includes estimated surcharge" : "Estimated Market Value based on cost lags"}
          </p>
          
          <div className="flex items-center space-x-2 mt-4">
             <Switch id="sticky-mode" checked={isSticky} onCheckedChange={setIsSticky} />
             <Label htmlFor="sticky-mode" className="text-xs">Sticky vs. Fair</Label>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "border-yellow-500/50",
        alertLevel === "High Risk" ? "bg-yellow-500/10" : "bg-green-500/10"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn(
            "text-sm font-medium",
            alertLevel === "High Risk" ? "text-yellow-500" : "text-green-500"
          )}>Stickiness Alert</CardTitle>
          <AlertTriangle className={cn(
            "h-4 w-4",
            alertLevel === "High Risk" ? "text-yellow-500" : "text-green-500"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            alertLevel === "High Risk" ? "text-yellow-500" : "text-green-500"
          )}>{alertLevel}</div>
          <p className={cn(
            "text-xs mt-1",
            alertLevel === "High Risk" ? "text-yellow-500/80" : "text-green-500/80"
          )}>
            {isSticky 
              ? `Retailer surcharge: ${(asymmetryGap * 100).toFixed(1)} sen (${asymmetryGap >= 0.03 ? 'significant' : 'minor'} asymmetry)`
              : `Asymmetry gap detected: ${(asymmetryGap * 100).toFixed(1)} sen from research data`
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certainty Horizon</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">30 Days</div>
          <p className="text-xs text-muted-foreground mt-1">
            Prediction valid based on minimum feature lag
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
