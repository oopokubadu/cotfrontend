"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"

interface ComparisonViewProps {
  data: any[]
  comparisonData: any[]
  currency: string
  comparisonCurrency: string
}

export function ComparisonView({ data, comparisonData, currency, comparisonCurrency }: ComparisonViewProps) {
  // Function to format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  // Function to get trend icon
  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="h-3 w-3 inline ml-1" />

    if (current > previous) {
      return <TrendingUp className="h-3 w-3 text-green-500 inline ml-1" />
    } else if (current < previous) {
      return <TrendingDown className="h-3 w-3 text-red-500 inline ml-1" />
    }
    return <ArrowRight className="h-3 w-3 inline ml-1" />
  }

  // Combine data for side-by-side comparison
  const combinedData = data
    .map((row) => {
      const matchingComparisonRow = comparisonData.find(
        (cRow) => format(new Date(cRow.date), "yyyy-MM-dd") === format(new Date(row.date), "yyyy-MM-dd"),
      )

      return {
        date: row.date,
        primary: row,
        comparison: matchingComparisonRow || null,
      }
    })
    .filter((row) => row.comparison !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Currency Comparison: {currency} vs {comparisonCurrency}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2}>Date</TableHead>
                <TableHead colSpan={3} className="text-center border-b">
                  {currency}
                </TableHead>
                <TableHead colSpan={3} className="text-center border-b">
                  {comparisonCurrency}
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead>Longs</TableHead>
                <TableHead>Shorts</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Longs</TableHead>
                <TableHead>Shorts</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedData.map((row, index) => {
                // Get previous row data for comparison (if available)
                const prevRow = index < combinedData.length - 1 ? combinedData[index + 1] : null

                return (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {formatNumber(row.primary.longs)} {getTrendIcon(row.primary.longs, prevRow?.primary?.longs)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(row.primary.shorts)} {getTrendIcon(row.primary.shorts, prevRow?.primary?.shorts)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(row.primary.netPosition)}{" "}
                      {getTrendIcon(row.primary.netPosition, prevRow?.primary?.netPosition)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(row.comparison.longs)}{" "}
                      {getTrendIcon(row.comparison.longs, prevRow?.comparison?.longs)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(row.comparison.shorts)}{" "}
                      {getTrendIcon(row.comparison.shorts, prevRow?.comparison?.shorts)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(row.comparison.netPosition)}{" "}
                      {getTrendIcon(row.comparison.netPosition, prevRow?.comparison?.netPosition)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
