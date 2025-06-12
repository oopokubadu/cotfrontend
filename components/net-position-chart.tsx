"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface NetPositionChartProps {
  data: any[]
  comparisonData?: any[]
  priceData?: any[]
  loading: boolean
  currency: string
  comparisonCurrency?: string
}

export function NetPositionChart({
  data,
  comparisonData = [],
  priceData = [],
  loading,
  currency,
  comparisonCurrency,
}: NetPositionChartProps) {
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
      netPosition: item.netPosition,
      rawDate: new Date(item.date),
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  // Add comparison data if available
  if (comparisonData.length > 0) {
    comparisonData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((item) => {
        const dateStr = format(new Date(item.date), "MMM d")
        const existingIndex = chartData.findIndex((d) => d.date === dateStr)

        if (existingIndex >= 0) {
          chartData[existingIndex].comparisonNetPosition = item.netPosition
        }
      })
  }

  // Add price data if available
  if (priceData.length > 0) {
    // Find price data points that match our COT dates
    data.forEach((cotItem) => {
      const cotDate = new Date(cotItem.date)
      // Find closest price data point
      const closestPrice = priceData.reduce((closest, current) => {
        const currentDate = new Date(current.date)
        const closestDate = closest ? new Date(closest.date) : null

        if (!closest) return current

        const currentDiff = Math.abs(currentDate.getTime() - cotDate.getTime())
        const closestDiff = Math.abs(closestDate.getTime() - cotDate.getTime())

        return currentDiff < closestDiff ? current : closest
      }, null)

      if (closestPrice) {
        const dateStr = format(cotDate, "MMM d")
        const existingIndex = chartData.findIndex((d) => d.date === dateStr)

        if (existingIndex >= 0) {
          chartData[existingIndex].price = closestPrice.price
        }
      }
    })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNetPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(34, 197, 94, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(34, 197, 94, 0.25)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(59, 130, 246, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(59, 130, 246, 0.25)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) =>
            new Intl.NumberFormat("en", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        {priceData.length > 0 && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => value.toFixed(4)}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
        )}
        <Tooltip
          formatter={(value, name) => {
            if (name.includes("Net Position")) {
              return [new Intl.NumberFormat().format(value), name]
            }
            if (name === "Price") {
              return [value.toFixed(4), name]
            }
            return [value, name]
          }}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="netPosition"
          name={`${currency} Net Position`}
          stroke="rgba(34, 197, 94, 0.8)"
          fillOpacity={1}
          fill="url(#colorNetPositive)"
        />
        {comparisonData.length > 0 && comparisonCurrency && (
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="comparisonNetPosition"
            name={`${comparisonCurrency} Net Position`}
            stroke="rgba(59, 130, 246, 0.8)"
            fillOpacity={0.5}
            fill="url(#colorComparison)"
          />
        )}
        {priceData.length > 0 && (
          <Line yAxisId="right" type="monotone" dataKey="price" name="Price" stroke="#ff7300" dot={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
