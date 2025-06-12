// Function to calculate sentiment score based on COT data
export const calculateSentimentScore = (data: any[]) => {
  if (!data.length) return { score: 0, trend: "neutral" }

  // Get the most recent data points
  const latestData = data.slice(0, Math.min(4, data.length))

  // Calculate base sentiment from net position
  const latestNetPosition = latestData[0].netPosition
  const baseScore = Math.min(Math.max(latestNetPosition / 20000, -5), 5)

  // Calculate trend from recent changes
  let trendScore = 0
  let trendDirection = 0

  for (let i = 0; i < latestData.length - 1; i++) {
    const current = latestData[i]
    const previous = latestData[i + 1]

    // Net position trend
    const netPositionChange = current.netPosition - previous.netPosition
    trendDirection += netPositionChange > 0 ? 1 : netPositionChange < 0 ? -1 : 0

    // Long percentage trend
    const longPercentChange = current.percentLong - previous.percentLong
    trendScore += longPercentChange * 10

    // Recent change weight
    const weight = 1 / (i + 1)
    trendScore *= weight
  }

  // Combine base score and trend
  const finalScore = baseScore + trendScore

  // Determine trend category
  let trend = "neutral"
  if (finalScore > 2 && trendDirection > 0) {
    trend = "bullish"
  } else if (finalScore < -2 && trendDirection < 0) {
    trend = "bearish"
  }

  return {
    score: finalScore,
    trend,
  }
}
