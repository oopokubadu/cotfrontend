"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { ArrowDown, ArrowUp, ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"

interface DataTableProps {
  data: any[]
  comparisonData?: any[]
  loading: boolean
  sortConfig: { key: string; direction: string }
  onSortChange: (config: { key: string; direction: string }) => void
  currency?: string
  comparisonCurrency?: string
}

export function DataTable({
  data,
  comparisonData = [],
  loading,
  sortConfig,
  onSortChange,
  currency = "Currency",
  comparisonCurrency,
}: DataTableProps) {
  const [activeTab, setActiveTab] = useState(currency)

  // Function to determine cell background color based on value and type
  const getCellStyle = (value: number, type: "position" | "net", prevValue?: number) => {
    // For position columns (Longs, Shorts), we need to compare with previous value
    if (type === "position" && prevValue !== undefined) {
      const change = value - prevValue
      // No change
      if (change === 0) return {}

      // Calculate intensity based on percentage change
      const percentChange = Math.abs(change) / prevValue
      const intensity = Math.min(percentChange * 10, 0.6) // Cap at 0.6 for better visibility

      if (change > 0) {
        return {
          backgroundColor: `rgba(34, 197, 94, ${intensity})`,
          color: intensity > 0.3 ? "white" : undefined,
        }
      } else {
        return {
          backgroundColor: `rgba(239, 68, 68, ${intensity})`,
          color: intensity > 0.3 ? "white" : undefined,
        }
      }
    }

    // For net position
    if (type === "net") {
      const intensity = Math.min(Math.abs(value) / 20000, 1) * 0.6

      if (value > 0) {
        return {
          backgroundColor: `rgba(34, 197, 94, ${intensity})`,
          color: intensity > 0.3 ? "white" : undefined,
        }
      } else if (value < 0) {
        return {
          backgroundColor: `rgba(239, 68, 68, ${intensity})`,
          color: intensity > 0.3 ? "white" : undefined,
        }
      }
    }

    return {}
  }

  // Function to format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  // Function to format percentages
  const formatPercent = (num: number) => {
    return `${num.toFixed(2)}%`
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

  // Function to handle column sorting
  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      onSortChange({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      })
    } else {
      onSortChange({ key, direction: "desc" })
    }
  }

  // Function to get sort direction icon
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <div className="py-8 text-center text-muted-foreground">No data available</div>
  }

  // Sort data based on current sort configuration
  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key === "date") {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
    }

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1
    }
    return 0
  })

  // Sort comparison data
  const sortedComparisonData = comparisonData.length
    ? [...comparisonData].sort((a, b) => {
        if (sortConfig.key === "date") {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
        }
        return 0
      })
    : []

  // If we have comparison data, show tabs to switch between currencies
  if (comparisonData.length > 0 && comparisonCurrency) {
    return (
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value={currency}>{currency}</TabsTrigger>
            <TabsTrigger value={comparisonCurrency}>{comparisonCurrency}</TabsTrigger>
          </TabsList>
        </Tabs>

        <TooltipProvider>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("date")}>
                    Date {getSortIcon("date")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("longs")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">Longs {getSortIcon("longs")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Total long positions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("shorts")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">Shorts {getSortIcon("shorts")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Total short positions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("changeLong")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">Change Long {getSortIcon("changeLong")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Change in long positions from previous report</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("changeShort")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">Change Short {getSortIcon("changeShort")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Change in short positions from previous report</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("percentLong")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">%Long {getSortIcon("percentLong")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Long / (Long + Short)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("percentShort")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">%Short {getSortIcon("percentShort")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Short / (Long + Short)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("netPosition")}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="flex w-full">Net Position {getSortIcon("netPosition")}</TooltipTrigger>
                      <TooltipContent>
                        <p>Net position</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTab === currency
                  ? // Primary currency data
                    sortedData.map((row, index) => {
                      // Get previous row data for comparison (if available)
                      const prevRow = index < sortedData.length - 1 ? sortedData[index + 1] : null

                      return (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                          <TableCell style={getCellStyle(row.longs, "position", prevRow?.longs)}>
                            {formatNumber(row.longs)} {getTrendIcon(row.longs, prevRow?.longs)}
                          </TableCell>
                          <TableCell style={getCellStyle(row.shorts, "position", prevRow?.shorts)}>
                            {formatNumber(row.shorts)} {getTrendIcon(row.shorts, prevRow?.shorts)}
                          </TableCell>
                          <TableCell>
                            {row.changeLong > 0 ? "+" : ""}
                            {formatNumber(row.changeLong)}
                          </TableCell>
                          <TableCell>
                            {row.changeShort > 0 ? "+" : ""}
                            {formatNumber(row.changeShort)}
                          </TableCell>
                          <TableCell>{formatPercent(row.percentLong)}</TableCell>
                          <TableCell>{formatPercent(row.percentShort)}</TableCell>
                          <TableCell style={getCellStyle(row.netPosition, "net")}>
                            {formatNumber(row.netPosition)} {getTrendIcon(row.netPosition, prevRow?.netPosition)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  : // Comparison currency data
                    sortedComparisonData.map((row, index) => {
                      // Get previous row data for comparison (if available)
                      const prevRow = index < sortedComparisonData.length - 1 ? sortedComparisonData[index + 1] : null

                      return (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                          <TableCell style={getCellStyle(row.longs, "position", prevRow?.longs)}>
                            {formatNumber(row.longs)} {getTrendIcon(row.longs, prevRow?.longs)}
                          </TableCell>
                          <TableCell style={getCellStyle(row.shorts, "position", prevRow?.shorts)}>
                            {formatNumber(row.shorts)} {getTrendIcon(row.shorts, prevRow?.shorts)}
                          </TableCell>
                          <TableCell>
                            {row.changeLong > 0 ? "+" : ""}
                            {formatNumber(row.changeLong)}
                          </TableCell>
                          <TableCell>
                            {row.changeShort > 0 ? "+" : ""}
                            {formatNumber(row.changeShort)}
                          </TableCell>
                          <TableCell>{formatPercent(row.percentLong)}</TableCell>
                          <TableCell>{formatPercent(row.percentShort)}</TableCell>
                          <TableCell style={getCellStyle(row.netPosition, "net")}>
                            {formatNumber(row.netPosition)} {getTrendIcon(row.netPosition, prevRow?.netPosition)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </div>
    )
  }

  // If no comparison data, show regular table
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("date")}>
                Date {getSortIcon("date")}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("longs")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Longs {getSortIcon("longs")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Total long positions</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("shorts")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Shorts {getSortIcon("shorts")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Total short positions</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("changeLong")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Change Long {getSortIcon("changeLong")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Change in long positions from previous report</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("changeShort")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Change Short {getSortIcon("changeShort")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Change in short positions from previous report</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("percentLong")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">%Long {getSortIcon("percentLong")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Long / (Long + Short)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("percentShort")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">%Short {getSortIcon("percentShort")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Short / (Long + Short)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("netPosition")}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Net Position {getSortIcon("netPosition")}</TooltipTrigger>
                  <TooltipContent>
                    <p>Net position</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => {
              // Get previous row data for comparison (if available)
              const prevRow = index < sortedData.length - 1 ? sortedData[index + 1] : null

              return (
                <TableRow key={index}>
                  <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                  <TableCell style={getCellStyle(row.longs, "position", prevRow?.longs)}>
                    {formatNumber(row.longs)} {getTrendIcon(row.longs, prevRow?.longs)}
                  </TableCell>
                  <TableCell style={getCellStyle(row.shorts, "position", prevRow?.shorts)}>
                    {formatNumber(row.shorts)} {getTrendIcon(row.shorts, prevRow?.shorts)}
                  </TableCell>
                  <TableCell>
                    {row.changeLong > 0 ? "+" : ""}
                    {formatNumber(row.changeLong)}
                  </TableCell>
                  <TableCell>
                    {row.changeShort > 0 ? "+" : ""}
                    {formatNumber(row.changeShort)}
                  </TableCell>
                  <TableCell>{formatPercent(row.percentLong)}</TableCell>
                  <TableCell>{formatPercent(row.percentShort)}</TableCell>
                  <TableCell style={getCellStyle(row.netPosition, "net")}>
                    {formatNumber(row.netPosition)} {getTrendIcon(row.netPosition, prevRow?.netPosition)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
