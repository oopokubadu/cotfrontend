"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface NetPositionChartProps {
  data: any[]
  loading: boolean
}

export function NetPositionChart({ data, loading }: NetPositionChartProps) {
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

  return (
    <ChartContainer
      config={{
        netPosition: {
          label: "Net Position",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(34, 197, 94, 0.8)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(34, 197, 94, 0.2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNetNegative" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="netPosition"
            stroke="var(--color-netPosition)"
            fillOpacity={1}
            fill="url(#colorNetPositive)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
