"use client";

import { ModeToggle } from "@/components/theme-toggle";
import "./globals.css";
import {
  useFetchBinanceKlines,
  useBitcoinPrice,
} from "@/data/useFetchBinanceKlines";
import CandlestickChart from "@/components/chart/candlestick-chart";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function HomePage() {
  const [timeframe, setTimeframe] = useState("1h");
  const { data, isLoading } = useFetchBinanceKlines("BTCUSDT", timeframe, 100);

  const [initialCandleData, setInitialCandleData] = useState<CandlestickData[]>(
    []
  );
  const [initialVolumeData, setInitialVolumeData] = useState<VolumeData[]>([]);

  const { candleData: wsCandleData, volumeData: wsVolumeData } = useWebSocket(
    "btcusdt",
    "1m"
  );

  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showSMA, setShowSMA] = useState(false);

  const { data: bitcoinPriceData, refetch: refetchBitcoinPrice } =
    useBitcoinPrice();

  useEffect(() => {
    if (!isLoading && data && Array.isArray(data)) {
      const newCandleData = data
        .filter(
          (item: ICandleStick) =>
            typeof item.openTime === "number" && !isNaN(item.openTime)
        )
        .map((item: ICandleStick) => ({
          time: Math.floor(item.openTime / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }))
        .sort((a, b) => a.time - b.time);

      const newVolumeData = data
        .filter(
          (item: ICandleStick) =>
            typeof item.openTime === "number" && !isNaN(item.openTime)
        )
        .map((item: ICandleStick) => ({
          time: Math.floor(item.openTime / 1000),
          value: item.volume,
          color: item.close > item.open ? "#26a69a" : "#ef5350",
        }))
        .sort((a, b) => a.time - b.time);

      const newCandle: CandlestickData = {
        time: Math.floor(1747987199999 / 1000),
        open: 110526.01,
        high: 110857.15,
        low: 110523.8,
        close: 110715.42,
      };

      const newVolume: VolumeData = {
        time: Math.floor(1747987199999 / 1000),
        value: 1083.90073,
        color: "#26a69a",
      };

      if (newCandle.time && !isNaN(newCandle.time)) {
        newCandleData.push(newCandle);
        newCandleData.sort((a, b) => a.time - b.time);
      }

      if (newVolume.time && !isNaN(newVolume.time)) {
        newVolumeData.push(newVolume);
        newVolumeData.sort((a, b) => a.time - b.time);
      }

      setInitialCandleData(newCandleData);
      setInitialVolumeData(newVolumeData);
    }
  }, [data, isLoading]);

  const combinedCandleData = [...initialCandleData, ...wsCandleData].sort(
    (a, b) => a.time - b.time
  );
  const combinedVolumeData = [...initialVolumeData, ...wsVolumeData].sort(
    (a, b) => a.time - b.time
  );

  const closePrices = combinedCandleData.map((item) => item.close);

  const calculateRSI = (
    prices: number[],
    period: number = 14
  ): IndicatorData[] => {
    const rsiData: IndicatorData[] = [];
    if (prices.length < period + 1 || combinedCandleData.length < period + 1) {
      console.warn(
        "Not enough data to calculate RSI. Required:",
        period + 1,
        "Got:",
        prices.length
      );
      return [];
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += -change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgGain / (avgLoss || 1);
    let rsi = 100 - 100 / (1 + rs);
    rsiData.push({ time: combinedCandleData[period].time, value: rsi });

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      rs = avgGain / (avgLoss || 1);
      rsi = 100 - 100 / (1 + rs);
      rsiData.push({ time: combinedCandleData[i].time, value: rsi });
    }

    return rsiData;
  };

  const calculateMACD = (prices: number[]): MACDData[] => {
    const macdData: MACDData[] = [];
    if (prices.length < 26 || combinedCandleData.length < 26) {
      console.warn(
        "Not enough data to calculate MACD. Required: 26, Got:",
        prices.length
      );
      return [];
    }

    const calculateEMA = (data: number[], period: number): number[] => {
      const k = 2 / (period + 1);
      const ema: number[] = [];
      ema[0] =
        data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

      for (let i = period; i < data.length; i++) {
        ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
      }
      return ema;
    };

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine: number[] = [];
    for (let i = 0; i < ema12.length; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }

    const signalLine = calculateEMA(macdLine, 9);
    for (let i = 0; i < signalLine.length; i++) {
      const index = 25 + i;
      if (index >= combinedCandleData.length) {
        console.warn("Index out of bounds for MACD:", index);
        break;
      }
      macdData.push({
        time: combinedCandleData[index].time,
        macd: macdLine[i + 9],
        signal: signalLine[i],
        histogram: macdLine[i + 9] - signalLine[i],
      });
    }

    return macdData;
  };

  const calculateEMA = (
    prices: number[],
    period: number = 20
  ): IndicatorData[] => {
    const emaData: IndicatorData[] = [];
    if (prices.length < period || combinedCandleData.length < period) {
      console.warn(
        "Not enough data to calculate EMA. Required:",
        period,
        "Got:",
        prices.length
      );
      return [];
    }

    const k = 2 / (period + 1);
    let ema =
      prices.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    emaData.push({ time: combinedCandleData[period - 1].time, value: ema });

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
      emaData.push({ time: combinedCandleData[i].time, value: ema });
    }

    return emaData;
  };

  const calculateSMA = (
    prices: number[],
    period: number = 20
  ): IndicatorData[] => {
    const smaData: IndicatorData[] = [];
    if (prices.length < period || combinedCandleData.length < period) {
      console.warn(
        "Not enough data to calculate SMA. Required:",
        period,
        "Got:",
        prices.length
      );
      return [];
    }

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, val) => sum + val, 0) / period;
      smaData.push({ time: combinedCandleData[i].time, value: sma });
    }

    return smaData;
  };

  const rsiData = showRSI ? calculateRSI(closePrices) : [];
  const macdData = showMACD ? calculateMACD(closePrices) : [];
  const emaData = showEMA ? calculateEMA(closePrices) : [];
  const smaData = showSMA ? calculateSMA(closePrices) : [];

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"];

  return (
    <main className="min-h-screen max-w-full m-auto bg-white dark:bg-[#1e1e2f] text-black dark:text-white">
      <div className="max-w-full w-full h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between ml-6 mr-6">
          <h1 className="text-xl font-semibold">
            Biểu đồ nến (Candlestick Chart)
          </h1>
          <div className="flex items-center space-x-4 mt-5">
            <div>
              <label htmlFor="timeframe" className="mr-2">
                Khung thời gian:
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="p-2 border cursor-pointer rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                {timeframes.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => refetchBitcoinPrice()}
              className="p-2 cursor-pointer"
            >
              Lấy giá Bitcoin
            </Button>
          </div>
        </div>

        <div className="ml-6 mt-2">
          {bitcoinPriceData && (
            <>
              <p>
                Giá Bitcoin hiện tại: $
                {bitcoinPriceData.currentPrice.toLocaleString()}
              </p>
              <p>
                Giá Bitcoin cách đây 1 phút: $
                {bitcoinPriceData.priceOneMinuteAgo.toLocaleString()}
              </p>
            </>
          )}
        </div>

        <div className="ml-6 mt-2 flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showRSI}
              onChange={(e) => setShowRSI(e.target.checked)}
              className="mr-2"
            />
            RSI
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showMACD}
              onChange={(e) => setShowMACD(e.target.checked)}
              className="mr-2"
            />
            MACD
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showEMA}
              onChange={(e) => setShowEMA(e.target.checked)}
              className="mr-2"
            />
            EMA
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showSMA}
              onChange={(e) => setShowSMA(e.target.checked)}
              className="mr-2"
            />
            SMA
          </label>
        </div>

        <div className="p-4">
          <div className="w-full border rounded-lg p-8 mt-4">
            <CandlestickChart
              candlestickData={combinedCandleData}
              volumeData={combinedVolumeData}
              rsiData={rsiData}
              macdData={macdData}
              emaData={emaData}
              smaData={smaData}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-2 space-y-4 z-auto ">
        <ModeToggle />
      </div>
    </main>
  );
}
