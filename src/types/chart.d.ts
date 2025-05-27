type IndicatorData = {
  time: Time;
  value: number;
}

type MACDData = {
  time: Time;
  macd: number;
  signal: number;
  histogram: number;
}

type ChartProps = {
  candlestickData: CandlestickData<Time>[];
  volumeData?: HistogramData<Time>[];
  rsiData?: IndicatorData[];
  macdData?: MACDData[];
  emaData?: IndicatorData[];
  smaData?: IndicatorData[];
}