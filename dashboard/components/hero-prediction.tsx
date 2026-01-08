"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeroPredictionProps {
  prediction?: number
  auditReport?: any
  causalAnalysis?: any
}

export function HeroPrediction({ 
  prediction = 0, 
  auditReport = null,
  causalAnalysis = null
}: HeroPredictionProps) {
  
  const fairPrice = prediction
  const status = auditReport?.status || "Awaiting Analysis"
  const color = auditReport?.color || "Grey"
  const gapSen = auditReport?.gap_sen || 0
  const bufferSen = auditReport?.buffer_sen || 0
  const regime = causalAnalysis?.regime || "STABLE"
  const isSticky = causalAnalysis?.is_sticky || false

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fair Price Model</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">
            RM {fairPrice.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on XGBoost causal model
          </p>
        </CardContent>
      </Card>

      <Card className={cn(
        "border-2",
        color === "Red" && "border-red-500 bg-red-500/10",
        color === "Yellow" && "border-yellow-500 bg-yellow-500/10",
        color === "Green" && "border-green-500 bg-green-500/10",
        color === "Blue" && "border-blue-500 bg-blue-500/10",
        color === "Grey" && "border-muted"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn(
            "text-sm font-medium",
            color === "Red" && "text-red-500",
            color === "Yellow" && "text-yellow-500",
            color === "Green" && "text-green-500",
            color === "Blue" && "text-blue-500",
            color === "Grey" && "text-muted-foreground"
          )}>Audit Status</CardTitle>
          <AlertTriangle className={cn(
            "h-4 w-4",
            color === "Red" && "text-red-500",
            color === "Yellow" && "text-yellow-500",
            color === "Green" && "text-green-500",
            color === "Blue" && "text-blue-500",
            color === "Grey" && "text-muted-foreground"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-base sm:text-lg font-bold",
            color === "Red" && "text-red-500",
            color === "Yellow" && "text-yellow-500",
            color === "Green" && "text-green-500",
            color === "Blue" && "text-blue-500",
            color === "Grey" && "text-muted-foreground"
          )}>{status}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {auditReport ? `Gap: ${gapSen > 0 ? '+' : ''}${gapSen} sen | Buffer: ±${bufferSen} sen` : 'Provide market price for audit'}
          </p>
        </CardContent>
      </Card>

      <Card className={cn(
        isSticky && "border-orange-500/50 bg-orange-500/10"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Regime</CardTitle>
          <Clock className={cn("h-4 w-4", isSticky ? "text-orange-500" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-xl sm:text-2xl font-bold", isSticky && "text-orange-500")}>
            {regime}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isSticky ? "⚠️ Feather effect detected" : "Normal market dynamics"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
