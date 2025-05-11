"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import { DataTable } from "@/components/data-table"
import { NetPositionChart } from "@/components/net-position-chart"
import { PositionPercentageChart } from "@/components/position-percentage-chart"
import { PositionChangeChart } from "@/components/position-change-chart"
import { generateMockData } from "@/lib/mock-data"
import { DateRange } from "react-day-picker"

export default function Dashboard() {
  const [currency, setCurrency] = useState("EUR")
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  } as DateRange)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Load data on initial render and when filters change
  useEffect(() => {
    fetchData()
  }, [currency, date])
  

  const fetchData = async () => {
    setLoading(true)
    const getProductName = (currency: string): string => {
      const productMap: { [key: string]: string } = {
        EUR: "EURO%20FX%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
        GBP: "BRITISH%20POUND%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
        USD: "US%20DOLLAR%20INDEX%20-%20ICE%20FUTURES%20US",
        JPY: "JAPANESE%20YEN%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
        CHF: "SWISS%20FRANC%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
        CAD: "CANADIAN%20DOLLAR%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
      }
    
      return productMap[currency] || "UNKNOWN%20PRODUCT"
    }
  
    try {
      // Extract and format dates
    const startDate = format(date.from ?? new Date(), "yyyy-MM-dd")
    const endDate = format(date.to ?? new Date(), "yyyy-MM-dd")

    // Extract years from the date range
    const beginYear = (date.from ?? new Date()).getFullYear()
    const endYear = (date.to ?? new Date()).getFullYear()

    // Construct the API URL
    const product = getProductName(currency)
    const apiUrl = `https://cot-qnjy.onrender.com/cot_data?start_date=${startDate}&end_date=${endDate}&begin_year=${beginYear}&end_year=${endYear}&product=${product}`

  
      // Fetch data from the API
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
  
      const apiData = await response.json()
      
      const slicedData = apiData.slice(0, 10) // Limit to 100 records for performance
      // Map the API data to match the required fields
      const mappedData = slicedData.map((item: any) => ({
        changeLong: item.change_long,
        changeShort: item.change_short,
        date: item.date,
        longs: Number(item.long),
        netPosition: item.net_position,
        percentLong: item["pct-long"],
        percentShort: item["pct-short"],
        shorts: Number(item.short),
      }))

    
    setData(mappedData)
    setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Commitment of Traders Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {format(lastUpdated, "MMM d, yyyy HH:mm")}</span>
            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Currency</label>
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
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <DatePickerWithRange date={date} setDate={setDate} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>COT Data</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading || !data.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <DataTable data={data} loading={loading} />
            </TooltipProvider>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Net Position Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <NetPositionChart data={data} loading={loading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Long vs Short Percentage</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PositionPercentageChart data={data} loading={loading} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Position Changes Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PositionChangeChart data={data} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
