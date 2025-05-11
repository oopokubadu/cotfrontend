"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { format } from "date-fns"

interface DataTableProps {
  data: any[]
  loading: boolean
}

export function DataTable({ data, loading }: DataTableProps) {
  // Function to determine cell background color based on value and type
  const getCellStyle = (value: number, type: "position" | "net", prevValue?: number) => {
    // For position columns (Longs, Shorts), we need to compare with previous value
    if (type === "position" && prevValue !== undefined) {
      const change = value - prevValue
      // No change
      if (change === 0) return {}

      // Calculate intensity based on percentage change
      const percentChange = Math.abs(change) / prevValue
      const intensity = Math.min(percentChange * 10, 0.5) // Cap at 0.5 for subtle effect

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
      const intensity = Math.min(Math.abs(value) / 20000, 1) * 0.5

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

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Longs</TooltipTrigger>
                  <TooltipContent>
                    <p>Total long positions</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Shorts</TooltipTrigger>
                  <TooltipContent>
                    <p>Total short positions</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Change Long</TooltipTrigger>
                  <TooltipContent>
                    <p>Change in long positions from previous report</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Change Short</TooltipTrigger>
                  <TooltipContent>
                    <p>Change in short positions from previous report</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">%Long</TooltipTrigger>
                  <TooltipContent>
                    <p>Long / (Long + Short)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">%Short</TooltipTrigger>
                  <TooltipContent>
                    <p>Short / (Long + Short)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="flex w-full">Net Position</TooltipTrigger>
                  <TooltipContent>
                    <p>Long - Short</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              // Get previous row data for comparison (if available)
              const prevRow = index < data.length - 1 ? data[index + 1] : null

              return (
                <TableRow key={index}>
                  <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                  <TableCell style={getCellStyle(row.longs, "position", prevRow?.longs)}>
                    {formatNumber(row.longs)}
                  </TableCell>
                  <TableCell style={getCellStyle(row.shorts, "position", prevRow?.shorts)}>
                    {formatNumber(row.shorts)}
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
                  <TableCell style={getCellStyle(row.netPosition, "net")}>{formatNumber(row.netPosition)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
