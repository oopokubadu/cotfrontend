"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PositionChangeChartProps {
  data: any[]
  loading: boolean
}

export function PositionChangeChart({ data, loading }: PositionChangeChartProps) {
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
      changeLong: item.changeLong,
      changeShort: item.changeShort,
      rawDate: new Date(item.date),
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  return (
    <ChartContainer
      config={{
        changeLong: {
          label: "Change Long",
          color: "hsl(142, 76%, 36%)",
        },
        changeShort: {
          label: "Change Short",
          color: "hsl(0, 84%, 60%)",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorChangeLong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(34, 197, 94, 0.8)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(34, 197, 94, 0.2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorChangeShort" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(239, 68, 68, 0.8)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(239, 68, 68, 0.2)" stopOpacity={0} />
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="changeLong"
            stroke="var(--color-changeLong)"
            fillOpacity={0.5}
            fill="url(#colorChangeLong)"
          />
          <Area
            type="monotone"
            dataKey="changeShort"
            stroke="var(--color-changeShort)"
            fillOpacity={0.5}
            fill="url(#colorChangeShort)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
