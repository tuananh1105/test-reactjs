"use client";

import {
  createChart,
  type ChartOptions,
  type DeepPartial,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export default function CandlestickChart({
  candlestickData,
  volumeData,
  rsiData = [],
  macdData = [],
  emaData = [],
  smaData = [],
}: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { theme } = useTheme();

  const getChartOptions = (mode: string): DeepPartial<ChartOptions> => {
    if (mode === "dark") {
      return {
        layout: {
          background: { color: "#1e1e2f" },
          textColor: "#ffffff",
        },
        grid: {
          vertLines: { color: "#44475a" },
          horzLines: { color: "#44475a" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#44475a",
        },
        rightPriceScale: {
          borderColor: "#44475a",
          scaleMargins: {
            top: 0.2,
            bottom: 0.3,
          },
        },
        watermark: {
          color: "rgba(255, 255, 255, 0.1)",
          visible: false,
          text: "",
          fontSize: 24,
          horzAlign: "center",
          vertAlign: "center",
        },
      };
    }
    return {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#eee",
      },
      rightPriceScale: {
        borderColor: "#eee",
        scaleMargins: {
          top: 0.2,
          bottom: 0.3,
        },
      },
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = getChartOptions(theme || "light");

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: 600,
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: theme === "dark" ? "#26a69a" : "#4caf50",
      downColor: theme === "dark" ? "#ef5350" : "#f44336",
      borderVisible: false,
      wickUpColor: theme === "dark" ? "#26a69a" : "#4caf50",
      wickDownColor: theme === "dark" ? "#ef5350" : "#f44336",
    });
    candleSeries.setData(candlestickData);

    if (volumeData) {
      const volumeSeries = chart.addHistogramSeries({
        color: theme === "dark" ? "#26a69a" : "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeries.setData(volumeData);
    }

    if (rsiData.length > 0) {
      const rsiSeries = chart.addLineSeries({
        color: theme === "dark" ? "#bd93f9" : "#9c27b0",
        priceScaleId: "rsi",
        lineWidth: 2,
      });
      rsiSeries.setData(rsiData);
      chart.priceScale("rsi").applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0.2,
        },
      });
    }

    if (macdData.length > 0) {
      const macdSeries = chart.addLineSeries({
        color: theme === "dark" ? "#50fa7b" : "#4caf50",
        priceScaleId: "macd",
        lineWidth: 2,
      });
      const signalSeries = chart.addLineSeries({
        color: theme === "dark" ? "#ffb86c" : "#ff9800",
        priceScaleId: "macd",
        lineWidth: 2,
      });
      const histogramSeries = chart.addHistogramSeries({
        priceScaleId: "macd",
      });

      macdSeries.setData(
        macdData.map((d) => ({ time: d.time, value: d.macd }))
      );
      signalSeries.setData(
        macdData.map((d) => ({ time: d.time, value: d.signal }))
      );
      histogramSeries.setData(
        macdData.map((d) => ({
          time: d.time as Time,
          value: d.histogram,
          color:
            d.histogram >= 0
              ? theme === "dark"
                ? "rgba(80, 250, 123, 0.5)"
                : "rgba(76, 175, 80, 0.5)"
              : theme === "dark"
              ? "rgba(255, 184, 108, 0.5)"
              : "rgba(255, 152, 0, 0.5)",
        }))
      );

      chart.priceScale("macd").applyOptions({
        scaleMargins: {
          top: 0.5,
          bottom: 0.3,
        },
      });
    }

    if (emaData.length > 0) {
      const emaSeries = chart.addLineSeries({
        color: theme === "dark" ? "#8be9fd" : "#2196f3",
        lineWidth: 2,
      });
      emaSeries.setData(emaData);
    }

    if (smaData.length > 0) {
      const smaSeries = chart.addLineSeries({
        color: theme === "dark" ? "#ff79c6" : "#f06292",
        lineWidth: 2,
      });
      smaSeries.setData(smaData);
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candlestickData, volumeData, rsiData, macdData, emaData, smaData, theme]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "600px" }}
      className="dark:bg-[#1e1e2f]"
    />
  );
}
