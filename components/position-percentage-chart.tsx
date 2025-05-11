"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PositionPercentageChartProps {
  data: any[]
  loading: boolean
}

export function PositionPercentageChart({ data, loading }: PositionPercentageChartProps) {
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
      percentLong: item.percentLong,
      percentShort: item.percentShort,
      rawDate: new Date(item.date),
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  return (
    <ChartContainer
      config={{
        percentLong: {
          label: "% Long",
          color: "hsl(142, 76%, 36%)",
        },
        percentShort: {
          label: "% Short",
          color: "hsl(0, 84%, 60%)",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          stackOffset="expand"
          barGap={0}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="percentLong" stackId="a" fill="var(--color-percentLong)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="percentShort" stackId="a" fill="var(--color-percentShort)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
