import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface PriceResponse {
  symbol: string;
  price: string;
}

async function getPrice(pair: string): Promise<PriceResponse | null> {
  let res: PriceResponse | null = null;
  try {
    const result = await axios.get<PriceResponse>(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    res = result.data;
  } catch (err) {
    console.error("binance api:" + err);
  }
  return res;
}

export {
  getPrice
}