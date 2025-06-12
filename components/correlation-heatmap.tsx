"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CorrelationHeatmapProps {
  loading: boolean
}

export function CorrelationHeatmap({ loading }: CorrelationHeatmapProps) {
  const [correlationData, setCorrelationData] = useState([])

  useEffect(() => {
    // Generate mock correlation data
    const currencies = ["EUR", "GBP", "USD", "JPY", "CHF", "AUD", "CAD", "NZD"]
    const data = []

    for (let i = 0; i < currencies.length; i++) {
      const row = []
      for (let j = 0; j < currencies.length; j++) {
        if (i === j) {
          row.push(1) // Perfect correlation with self
        } else {
          // Generate random correlation between -1 and 1
          // Make nearby currencies more likely to be correlated
          const baseCor = Math.abs(i - j) < 3 ? 0.7 : 0.2
          const randomFactor = Math.random() * 0.6 - 0.3
          row.push(Math.min(Math.max(baseCor + randomFactor, -1), 1))
        }
      }
      data.push(row)
    }

    setCorrelationData(
      data.map((row, i) => ({
        currency: currencies[i],
        correlations: row.map((value, j) => ({
          currency: currencies[j],
          value,
        })),
      })),
    )
  }, [])

  if (loading) {
    return <Skeleton className="h-full w-full" />
  }

  if (!correlationData.length) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-9 gap-1">
          <div className="font-medium"></div>
          {correlationData.map((row) => (
            <div key={row.currency} className="font-medium text-center">
              {row.currency}
            </div>
          ))}

          {correlationData.map((row) => (
            <>
              <div key={`label-${row.currency}`} className="font-medium">
                {row.currency}
              </div>
              {row.correlations.map((corr) => (
                <div
                  key={`${row.currency}-${corr.currency}`}
                  className={`h-10 flex items-center justify-center ${
                    corr.value === 1
                      ? "bg-gray-200 dark:bg-gray-700"
                      : corr.value > 0.7
                        ? "bg-green-600 text-white dark:bg-green-700"
                        : corr.value > 0.3
                          ? "bg-green-400 dark:bg-green-600 dark:text-white"
                          : corr.value > 0
                            ? "bg-green-200 dark:bg-green-800 dark:text-green-100"
                            : corr.value > -0.3
                              ? "bg-red-200 dark:bg-red-800 dark:text-red-100"
                              : corr.value > -0.7
                                ? "bg-red-400 dark:bg-red-600 dark:text-white"
                                : "bg-red-600 text-white dark:bg-red-700"
                  }`}
                >
                  {corr.value.toFixed(2)}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
