"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface PositionChangeChartProps {
  data: any[]
  comparisonData?: any[]
  loading: boolean
  currency: string
  comparisonCurrency?: string
}

export function PositionChangeChart({
  data,
  comparisonData = [],
  loading,
  currency,
  comparisonCurrency,
}: PositionChangeChartProps) {
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
      [`${currency}ChangeLong`]: item.changeLong,
      [`${currency}ChangeShort`]: item.changeShort,
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
          chartData[existingIndex][`${comparisonCurrency}ChangeLong`] = item.changeLong
          chartData[existingIndex][`${comparisonCurrency}ChangeShort`] = item.changeShort
        }
      })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorChangeLong" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(34, 197, 94, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(34, 197, 94, 0.25)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorChangeShort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(239, 68, 68, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(239, 68, 68, 0.25)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorComparisonLong" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(59, 130, 246, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(59, 130, 246, 0.25)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorComparisonShort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(147, 51, 234, 0.9)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="rgba(147, 51, 234, 0.25)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
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
        <Tooltip formatter={(value, name) => [new Intl.NumberFormat().format(value), name]} />
        <Legend />
        <Area
          type="monotone"
          dataKey={`${currency}ChangeLong`}
          name={`${currency} Change Long`}
          stroke="rgba(34, 197, 94, 0.8)"
          fillOpacity={0.5}
          fill="url(#colorChangeLong)"
        />
        <Area
          type="monotone"
          dataKey={`${currency}ChangeShort`}
          name={`${currency} Change Short`}
          stroke="rgba(239, 68, 68, 0.8)"
          fillOpacity={0.5}
          fill="url(#colorChangeShort)"
        />
        {comparisonData.length > 0 && comparisonCurrency && (
          <>
            <Area
              type="monotone"
              dataKey={`${comparisonCurrency}ChangeLong`}
              name={`${comparisonCurrency} Change Long`}
              stroke="rgba(59, 130, 246, 0.8)"
              fillOpacity={0.3}
              fill="url(#colorComparisonLong)"
            />
            <Area
              type="monotone"
              dataKey={`${comparisonCurrency}ChangeShort`}
              name={`${comparisonCurrency} Change Short`}
              stroke="rgba(147, 51, 234, 0.8)"
              fillOpacity={0.3}
              fill="url(#colorComparisonShort)"
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
