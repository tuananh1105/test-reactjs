import instance from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";

export const fetchBinanceKlines = async (
  symbol?: string,
  interval: string = "1d",
  limit: number = 100
): Promise<ICandleStick[]> => {
  if (!symbol) throw new Error("Symbol is required");

  const response = await instance.get(`/klines`, {
    params: {
      symbol,
      interval,
      limit,
    },
  });

  return response.data.map((d: BinanceKlineRaw) => ({
    openTime: d[0],
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
    closeTime: d[6],
    baseAssetVolume: parseFloat(d[7]),
    numberOfTrades: d[8],
    takerBuyVolume: parseFloat(d[9]),
    takerBuyBaseAssetVolume: parseFloat(d[10]),
    ignore: d[11],
  }));
};

export const useFetchBinanceKlines = (
  symbol?: string,
  interval: string = "1d",
  limit: number = 100
) => {
  return useQuery({
    queryKey: ["binanceKlines", symbol, interval, limit],
    queryFn: () => fetchBinanceKlines(symbol, interval, limit),
    enabled: !!symbol,
    staleTime: 6 * 60 * 1000,
  });
};

export const fetchBitcoinPrice = async (): Promise<{
  currentPrice: number;
  priceOneMinuteAgo: number;
}> => {
  try {
    const currentResponse = await instance.get("/ticker/price", {
      params: { symbol: "BTCUSDT" },
    });
    const currentPrice = parseFloat(currentResponse.data.price);

    const pastResponse = await instance.get("/klines", {
      params: { symbol: "BTCUSDT", interval: "1m", limit: 2 },
    });
    const pastData = pastResponse.data as [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
      string,
      string,
      string
    ][];
    const priceOneMinuteAgo = parseFloat(pastData[0][4]);

    return { currentPrice, priceOneMinuteAgo };
  } catch (error) {
    console.error("Error while fetching Bitcoin:", error);
    throw error;
  }
};

export const useBitcoinPrice = () => {
  return useQuery({
    queryKey: ["bitcoinPrice"],
    queryFn: fetchBitcoinPrice,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};
