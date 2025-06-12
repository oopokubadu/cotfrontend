"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface PositionPercentageChartProps {
  data: any[]
  comparisonData?: any[]
  loading: boolean
  currency: string
  comparisonCurrency?: string
}

export function PositionPercentageChart({
  data,
  comparisonData = [],
  loading,
  currency,
  comparisonCurrency,
}: PositionPercentageChartProps) {
  if (loading) {
    return <Skeleton className="h-full w-full" />
  }

  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
  }

  // Format data for the chart
  const chartData = data
    .map((item) => ({
      date: format(new Date(item.date), "MMM d"),
      [`${currency}PercentLong`]: item.percentLong,
      [`${currency}PercentShort`]: item.percentShort,
      rawDate: new Date(item.date),
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  // Add comparison data if available
  if (comparisonData.length > 0 && comparisonCurrency) {
    comparisonData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((item) => {
        const dateStr = format(new Date(item.date), "MMM d")
        const existingIndex = chartData.findIndex((d) => d.date === dateStr)

        if (existingIndex >= 0) {
          chartData[existingIndex][`${comparisonCurrency}PercentLong`] = item.percentLong
          chartData[existingIndex][`${comparisonCurrency}PercentShort`] = item.percentShort
        }
      })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={0} barCategoryGap={8}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickFormatter={(value) => `${(value).toFixed(0)}%`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 100]}
        />
        <Tooltip formatter={(value, name) => [`${value.toFixed(2)}%`, name]} />
        <Legend />
        <Bar
          dataKey={`${currency}PercentLong`}
          name={`${currency} %Long`}
          fill="rgba(34, 197, 94, 0.8)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey={`${currency}PercentShort`}
          name={`${currency} %Short`}
          fill="rgba(239, 68, 68, 0.8)"
          radius={[4, 4, 0, 0]}
        />
        {comparisonData.length > 0 && comparisonCurrency && (
          <>
            <Bar
              dataKey={`${comparisonCurrency}PercentLong`}
              name={`${comparisonCurrency} %Long`}
              fill="rgba(59, 130, 246, 0.8)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey={`${comparisonCurrency}PercentShort`}
              name={`${comparisonCurrency} %Short`}
              fill="rgba(147, 51, 234, 0.8)"
              radius={[4, 4, 0, 0]}
            />
          </>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
