import { format } from "date-fns"

export const generateData = async ( currency: string, startDate: Date, endDate: Date,) => {
  console.log(startDate, "Start Date");
  const productMap: { [key: string]: string } = {
    EUR: "EURO%20FX%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    GBP: "BRITISH%20POUND%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    USD: "USD%20INDEX%20-%20ICE%20FUTURES%20U.S.",
    JPY: "JAPANESE%20YEN%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    CHF: "SWISS%20FRANC%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    CAD: "CANADIAN%20DOLLAR%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    AUD: "AUSTRALIAN%20DOLLAR%20-%20CHICAGO%20MERCANTILE%20EXCHANGE",
    NZD: "NZ%20DOLLAR%20-%20CHICAGO%20MERCANTILE%20EXCHANGE"
  };

  const product = productMap[currency];
  const apiUrl = `https://cot-qnjy.onrender.com/cot_data?start_date=${format(startDate, "yyyy-MM-dd")}&end_date=${format(endDate, "yyyy-MM-dd")}&begin_year=2025&end_year=2025&product=${product}`;

  try {
    // Fetch data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const apiData = await response.json();

    // Limit the number of records for performance
    const slicedData = apiData.slice(0, 10);

    // Map the API data to match the required fields
    return slicedData.map((item: any) => ({
      changeLong: item.change_long,
      changeShort: item.change_short,
      date: item.date,
      longs: Number(item.long),
      netPosition: item.net_position,
      percentLong: item["pct-long"],
      percentShort: item["pct-short"],
      shorts: Number(item.short),
    }));
  } catch (error) {
    console.error("Error fetching COT data:", error);
    return [];
  }
};