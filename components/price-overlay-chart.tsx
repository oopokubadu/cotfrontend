"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface PriceOverlayChartProps {
  data: any[]
  priceData: any[]
  loading: boolean
  currency: string
}

export function PriceOverlayChart({ data, priceData, loading, currency }: PriceOverlayChartProps) {
  if (loading) {
    return <Skeleton className="h-full w-full" />
  }

  if (!data.length || !priceData.length) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
  }

  // Combine COT data and price data
  const combinedData = []
  const cotDates = data.map((item) => new Date(item.date).toISOString().split("T")[0])

  // Process price data first (daily data)
  priceData.forEach((priceItem) => {
    const dateStr = new Date(priceItem.date).toISOString().split("T")[0]
    combinedData.push({
      date: dateStr,
      price: priceItem.price,
      formattedDate: format(new Date(priceItem.date), "MMM d"),
    })
  })

  // Add COT data where available (weekly data)
  combinedData.forEach((item) => {
    const cotIndex = cotDates.indexOf(item.date)
    if (cotIndex !== -1) {
      item.netPosition = data[cotIndex].netPosition
      item.percentLong = data[cotIndex].percentLong
    }
  })

  // Sort by date
  combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate min/max for scaling
  const maxPrice = Math.max(...combinedData.filter((d) => d.price).map((d) => d.price))
  const minPrice = Math.min(...combinedData.filter((d) => d.price).map((d) => d.price))
  const priceRange = maxPrice - minPrice

  const maxNet = Math.max(...combinedData.filter((d) => d.netPosition).map((d) => d.netPosition))
  const minNet = Math.min(...combinedData.filter((d) => d.netPosition).map((d) => d.netPosition))
  const netRange = maxNet - minNet

  // Scale net position to price range for better visualization
  combinedData.forEach((item) => {
    if (item.netPosition !== undefined) {
      item.scaledNetPosition = ((item.netPosition - minNet) / netRange) * priceRange + minPrice
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
        <YAxis
          yAxisId="price"
          domain={[minPrice * 0.999, maxPrice * 1.001]}
          tickFormatter={(value) => value.toFixed(4)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          orientation="right"
        />
        <YAxis
          yAxisId="cot"
          domain={[minNet, maxNet]}
          tickFormatter={(value) =>
            new Intl.NumberFormat("en", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          orientation="left"
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "Price") return [value.toFixed(4), name]
            if (name === "Net Position") return [new Intl.NumberFormat().format(value), name]
            if (name === "%Long") return [`${value.toFixed(2)}%`, name]
            return [value, name]
          }}
          labelFormatter={(label) =>
            format(new Date(combinedData.find((d) => d.formattedDate === label).date), "MMM d, yyyy")
          }
        />
        <Legend />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="price"
          name={`${currency} Price`}
          stroke="#8884d8"
          dot={false}
          strokeWidth={2}
        />
        <Line
          yAxisId="cot"
          type="monotone"
          dataKey="netPosition"
          name="Net Position"
          stroke="#82ca9d"
          strokeDasharray="5 5"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="percentLong"
          name="%Long"
          stroke="#ff7300"
          strokeDasharray="3 3"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
