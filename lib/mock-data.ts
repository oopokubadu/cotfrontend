import { eachDayOfInterval } from "date-fns"

// Function to generate random number within a range
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Function to generate mock COT data
export const generateMockData = (currency: string, startDate: Date, endDate: Date) => {
  // Generate base values based on currency
  let baseLongs = 0
  let baseShorts = 0

  switch (currency) {
    case "EUR":
      baseLongs = 200000
      baseShorts = 180000
      break
    case "GBP":
      baseLongs = 150000
      baseShorts = 160000
      break
    case "USD":
      baseLongs = 250000
      baseShorts = 220000
      break
    case "JPY":
      baseLongs = 120000
      baseShorts = 140000
      break
    case "CHF":
      baseLongs = 100000
      baseShorts = 90000
      break
    default:
      baseLongs = 180000
      baseShorts = 170000
  }

  // Get all dates in the range (weekly reports)
  const allDates = eachDayOfInterval({ start: startDate, end: endDate })
  const reportDates = allDates.filter((date) => date.getDay() === 2) // Tuesday reports

  if (reportDates.length === 0) {
    // If no Tuesdays in range, use the start date
    reportDates.push(startDate)
  }

  // First pass: Generate basic data without references to previous entries
  const initialData = reportDates.map((date, index) => {
    // Add some randomness to the base values
    const trend = Math.sin(index / 2) // Create a sine wave trend
    const trendFactor = 1 + trend * 0.2

    const longs = Math.round(baseLongs * trendFactor * (1 + (Math.random() * 0.1 - 0.05)))
    const shorts = Math.round(baseShorts * (2 - trendFactor) * (1 + (Math.random() * 0.1 - 0.05)))

    // Calculate percentages
    const total = longs + shorts
    const percentLong = (longs / total) * 100
    const percentShort = (shorts / total) * 100

    // Calculate net position
    const netPosition = longs - shorts

    return {
      date: date.toISOString(),
      longs,
      shorts,
      percentLong,
      percentShort,
      netPosition,
    }
  })

  // Second pass: Calculate changes based on the now-created array
  const data = initialData.map((item, index) => {
    // Calculate changes from previous report (or random for first report)
    const changeLong = index === 0 ? randomNumber(-5000, 5000) : item.longs - initialData[index - 1].longs

    const changeShort = index === 0 ? randomNumber(-5000, 5000) : item.shorts - initialData[index - 1].shorts

    return {
      ...item,
      changeLong,
      changeShort,
    }
  })

  // Sort by date descending (newest first)
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
