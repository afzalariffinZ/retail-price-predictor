"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export function GeminiAnalyst({ reasoning = "" }: { reasoning?: string }) {
  const defaultText = "Execute analysis to generate AI-powered causal reasoning for price predictions"
  const text = reasoning || defaultText
  
  const words = text.split(" ")
  const hasHighUSD = reasoning ? text.toLowerCase().includes("high usd") : false

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <Card className="col-span-full border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-medium">AI Reasoning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <motion.div 
               className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground flex-1"
               variants={container}
               initial="hidden"
               animate="visible"
            >
              {words.map((word, index) => (
                <motion.span variants={child} key={index} className="mr-1 inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.div>
            
            <div className="flex sm:flex-col gap-3 sm:gap-2 sm:min-w-[80px]">
                <div className="flex flex-col items-center gap-1 text-xs text-blue-500">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[10px] sm:text-xs">Stabilized</span>
                </div>
                
                {hasHighUSD && (
                    <div className="flex flex-col items-center gap-1 text-xs text-red-500">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-[10px] sm:text-xs">High USD</span>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
