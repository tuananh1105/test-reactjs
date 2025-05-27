import { useState, useEffect } from "react";

export function useWebSocket(
  symbol: string = "btcusdt",
  interval: string = "1m"
) {
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);

  useEffect(() => {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected to:", wsUrl);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Check WebSocket:", message);
      const kline = message.k;

      if (kline && kline.x) {
        const newCandle: CandlestickData = {
          time: Math.floor(kline.t / 1000),
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        const newVolume: VolumeData = {
          time: Math.floor(kline.t / 1000),
          value: parseFloat(kline.v),
          color:
            parseFloat(kline.c) > parseFloat(kline.o) ? "#26a69a" : "#ef5350",
        };

        setCandleData((prev) => {
          const updatedData = [...prev];
          const existingIndex = updatedData.findIndex(
            (item) => item.time === newCandle.time
          );
          if (existingIndex !== -1) {
            updatedData[existingIndex] = newCandle;
          } else {
            updatedData.push(newCandle);
            updatedData.sort((a, b) => a.time - b.time);
            if (updatedData.length > 100) updatedData.shift();
          }
          return updatedData;
        });

        setVolumeData((prev) => {
          const updatedData = [...prev];
          const existingIndex = updatedData.findIndex(
            (item) => item.time === newVolume.time
          );
          if (existingIndex !== -1) {
            updatedData[existingIndex] = newVolume;
          } else {
            updatedData.push(newVolume);
            updatedData.sort((a, b) => a.time - b.time);
            if (updatedData.length > 100) updatedData.shift();
          }
          return updatedData;
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [symbol, interval]);

  return { candleData, volumeData };
}
