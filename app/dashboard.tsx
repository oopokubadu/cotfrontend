"use client"

import { useState, useEffect, useMemo } from "react"
import { format, subMonths } from "date-fns"
import { RefreshCw, BookmarkIcon, ArrowUpDown, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import { DataTable } from "@/components/data-table"
import { NetPositionChart } from "@/components/net-position-chart"
import { PositionPercentageChart } from "@/components/position-percentage-chart"
import { PositionChangeChart } from "@/components/position-change-chart"
import { CorrelationHeatmap } from "@/components/correlation-heatmap"
import { PriceOverlayChart } from "@/components/price-overlay-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { generateData } from "@/lib/mock-data"
import { generateMockPriceData } from "@/lib/mock-price-data"
import { calculateSentimentScore } from "@/lib/sentiment-analysis"

// Predefined time ranges
const TIME_RANGES = {
  "1M": { from: subMonths(new Date(), 1), to: new Date() },
  "3M": { from: subMonths(new Date(), 3), to: new Date() },
  "6M": { from: subMonths(new Date(), 6), to: new Date() },
  "1Y": { from: subMonths(new Date(), 12), to: new Date() },
  YTD: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() },
}

export default function Dashboard() {
  // State
  const [currency, setCurrency] = useState("EUR")
  const [comparisonCurrency, setComparisonCurrency] = useState("")
  const [date, setDate] = useState(TIME_RANGES["3M"])
  const [timeRangeTab, setTimeRangeTab] = useState("3M")
  const [data, setData] = useState([])
  const [comparisonData, setComparisonData] = useState([])
  const [priceData, setPriceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [showPriceOverlay, setShowPriceOverlay] = useState(false)
  const [viewMode, setViewMode] = useState("standard")
  const [comparisonViewMode, setComparisonViewMode] = useState("tabbed")
  const [favorites, setFavorites] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })

  // Calculate sentiment score
  const sentimentScore = useMemo(() => {
    if (!data.length) return { score: 0, trend: "neutral" }
    return calculateSentimentScore(data)
  }, [data])

  // Handle time range tab change
  const handleTimeRangeChange = (value) => {
    setTimeRangeTab(value)
    setDate(TIME_RANGES[value])
  }

  // Handle comparison currency change
  const handleComparisonChange = (value) => {
    if (value === "NONE") {
      setComparisonCurrency("")
      setComparisonData([])
    } else {
      setComparisonCurrency(value)
    }
  }

  // Load data on initial render and when filters change
  useEffect(() => {
    fetchData()

    // Set up auto-refresh every 15 minutes
    const intervalId = setInterval(
      () => {
        fetchData()
      },
      15 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [currency, comparisonCurrency, date])

  const fetchData = async () => {
    setLoading(true)

    // Simulate API call with timeout
    const mockData = await generateData(currency, date.from, date.to)
    console.log("Fetched COT data:", mockData)
    setData(mockData)

    // Fetch comparison data if selected
    if (comparisonCurrency) {
      const compData = await generateData(comparisonCurrency, date.from, date.to)
      console.log("Fetched comparison COT data:", compData)
      setComparisonData(compData)
    } else {
      setComparisonData([])
    }

    // Fetch price data
    const priceData = generateMockPriceData(currency, date.from, date.to)
    setPriceData(priceData)

    setLastUpdated(new Date())
    setLoading(false)
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleExportCSV = () => {
    if (!data.length) return

    // Create CSV content
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) => Object.values(row).join(","))
    const csvContent = [headers, ...rows].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cot-report-${currency}-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleFavorite = () => {
    const newFavorites = [...favorites]
    const favoriteIndex = favorites.findIndex((fav) => fav.currency === currency && fav.timeRange === timeRangeTab)

    if (favoriteIndex >= 0) {
      newFavorites.splice(favoriteIndex, 1)
    } else {
      newFavorites.push({ currency, timeRange: timeRangeTab })
    }

    setFavorites(newFavorites)
  }

  const isFavorite = favorites.some((fav) => fav.currency === currency && fav.timeRange === timeRangeTab)

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 min-h-screen bg-background">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">COT Dashboard</h1>
              <p className="text-muted-foreground">Commitment of Traders Analysis for Forex</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Last updated: {format(lastUpdated, "MMM d, yyyy HH:mm")}</span>
              </div>
              <ThemeToggle />
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={isFavorite ? "text-yellow-500" : ""}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium block">Currency</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                        <SelectItem value="CHF">CHF (Swiss Franc)</SelectItem>
                        <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                        <SelectItem value="CAD">CAD (Canadian Dollar)</SelectItem>
                        <SelectItem value="NZD">NZD (New Zealand Dollar)</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="pt-2">
                      <label className="text-sm font-medium block mb-1">Compare With (Optional)</label>
                      <Select value={comparisonCurrency || "NONE"} onValueChange={handleComparisonChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency for comparison" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="EUR" disabled={currency === "EUR"}>
                            EUR (Euro)
                          </SelectItem>
                          <SelectItem value="GBP" disabled={currency === "GBP"}>
                            GBP (British Pound)
                          </SelectItem>
                          <SelectItem value="USD" disabled={currency === "USD"}>
                            USD (US Dollar)
                          </SelectItem>
                          <SelectItem value="JPY" disabled={currency === "JPY"}>
                            JPY (Japanese Yen)
                          </SelectItem>
                          <SelectItem value="CHF" disabled={currency === "CHF"}>
                            CHF (Swiss Franc)
                          </SelectItem>
                          <SelectItem value="AUD" disabled={currency === "AUD"}>
                            AUD (Australian Dollar)
                          </SelectItem>
                          <SelectItem value="CAD" disabled={currency === "CAD"}>
                            CAD (Canadian Dollar)
                          </SelectItem>
                          <SelectItem value="NZD" disabled={currency === "NZD"}>
                            NZD (New Zealand Dollar)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium block">Time Range</label>
                    <Tabs value={timeRangeTab} onValueChange={handleTimeRangeChange} className="w-full">
                      <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="1M">1M</TabsTrigger>
                        <TabsTrigger value="3M">3M</TabsTrigger>
                        <TabsTrigger value="6M">6M</TabsTrigger>
                        <TabsTrigger value="1Y">1Y</TabsTrigger>
                        <TabsTrigger value="YTD">YTD</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="pt-2">
                      <label className="text-sm font-medium block mb-1">Custom Range</label>
                      <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Market Sentiment</CardTitle>
                <CardDescription>Based on COT data analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-4xl font-bold mb-2">{sentimentScore.score.toFixed(1)}</div>
                  <Badge
                    className={
                      sentimentScore.trend === "bullish"
                        ? "bg-green-500"
                        : sentimentScore.trend === "bearish"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }
                  >
                    {sentimentScore.trend.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-4 text-center">
                    {sentimentScore.trend === "bullish"
                      ? "Institutional traders are net long and increasing positions"
                      : sentimentScore.trend === "bearish"
                        ? "Institutional traders are net short and increasing positions"
                        : "Mixed signals or consolidating market"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>COT Data</CardTitle>
                  <CardDescription>
                    {currency} {comparisonCurrency ? `vs ${comparisonCurrency}` : ""} •
                    {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortConfig({
                        key: sortConfig.key,
                        direction: sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortConfig.direction === "asc" ? "Oldest First" : "Newest First"}
                  </Button>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        Color shading indicates changes: green for increases, red for decreases. Intensity reflects
                        magnitude of change.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={data}
                comparisonData={comparisonData}
                loading={loading}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                currency={currency}
                comparisonCurrency={comparisonCurrency}
              />
            </CardContent>
          </Card>

          {viewMode !== "compact" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Net Position Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <NetPositionChart
                      data={data}
                      comparisonData={comparisonData}
                      priceData={showPriceOverlay ? priceData : []}
                      loading={loading}
                      currency={currency}
                      comparisonCurrency={comparisonCurrency}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Long vs Short Percentage</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <PositionPercentageChart
                      data={data}
                      comparisonData={comparisonData}
                      loading={loading}
                      currency={currency}
                      comparisonCurrency={comparisonCurrency}
                    />
                  </CardContent>
                </Card>
              </div>

              {viewMode === "advanced" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Currency Correlation Heatmap</CardTitle>
                      <CardDescription>Net position correlation across major currencies</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <CorrelationHeatmap loading={loading} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Price vs COT Data</CardTitle>
                      <CardDescription>Price action overlaid with COT positioning</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <PriceOverlayChart data={data} priceData={priceData} loading={loading} currency={currency} />
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Position Changes Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <PositionChangeChart
                    data={data}
                    comparisonData={comparisonData}
                    loading={loading}
                    currency={currency}
                    comparisonCurrency={comparisonCurrency}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
