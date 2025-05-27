type ICandleStick = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  baseAssetVolume: number;
  numberOfTrades: number;
  takerBuyVolume: number;
  takerBuyBaseAssetVolume: number;
  ignore: number;
};

type BinanceKlinesParams = {
  symbol?: string;
  interval?: string;
  limit?: number;
}

type Candle = {
  time: string;   
  open: number;
  high: number;
  low: number;
  close: number;
};

type Volume = {
  time: string;
  value: number;
  color: string;
};


type CandlestickData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

type VolumeData = {
  time: UTCTimestamp;
  value: number;
  color: string;
}