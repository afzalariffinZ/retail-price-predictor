"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface FeatureImpactData {
  name: string
  value: number
}

export function FeatureImpact({ data = [] }: { data?: FeatureImpactData[] }) {
  const hasData = data.length > 0

  const chartData = hasData ? data.map(item => ({
    name: item.name,
    impact: item.value,
    fill: item.value >= 0 ? "#ef4444" : "#3b82f6" // Red for positive, Blue for negative
  })) : []

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Key Drivers of Predicted Price</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] sm:h-[320px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Execute analysis to view feature impact
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                tick={{ fontSize: 11, fill: 'currentColor' }} 
                interval={0}
                tickLine={false}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  borderRadius: '8px', 
                  border: '1px solid #334155', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
