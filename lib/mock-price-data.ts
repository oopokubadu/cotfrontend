// Function to generate mock price data that somewhat correlates with COT data
export const generateMockPriceData = (currency: string, startDate: Date, endDate: Date) => {
  // Base price values for different currencies
  const basePrices = {
    EUR: 1.08,
    GBP: 1.25,
    USD: 1.0,
    JPY: 0.0067,
    CHF: 1.12,
    AUD: 0.65,
    CAD: 0.73,
    NZD: 0.6,
  }

  // Get base price for the selected currency
  const basePrice = basePrices[currency] || 1.0

  // Generate daily price data
  const priceData = []
  const currentDate = new Date(startDate)
  let currentPrice = basePrice

  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Add some randomness to create price movement
      // Use sine wave to create some cyclical patterns
      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const cyclicalComponent = Math.sin(daysSinceStart / 20) * 0.02

      // Random component (daily volatility)
      const randomComponent = (Math.random() - 0.5) * 0.005

      // Trend component (slight upward or downward bias)
      const trendComponent = (Math.random() > 0.5 ? 1 : -1) * 0.0002

      // Calculate new price
      currentPrice = currentPrice * (1 + cyclicalComponent + randomComponent + trendComponent)

      // Add to data array
      priceData.push({
        date: new Date(currentDate).toISOString(),
        price: currentPrice,
      })
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return priceData
}
