import dotenv from "dotenv";
import NodeCache from "node-cache";
import fetch from "node-fetch";

dotenv.config();

const ttl = (Number(process.env.FX_CACHE_TTL_MIN) || 15) * 60; // seconds
const cache = new NodeCache({ stdTTL: ttl });

const BASE = process.env.FX_BASE_URL; // e.g. https://v6.exchangerate-api.com/v6
const KEY = process.env.EXCHANGE_API_KEY;

export async function getPairRate(from, to) {
  const key = `pair:${from}:${to}`;
  const found = cache.get(key);
  if (found) return found; // { rate }

  const url = `${BASE}/${KEY}/pair/${from}/${to}`; // base pair endpoint
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FX API error: ${res.status}`);
  const data = await res.json();
  if (!data || !data.conversion_rate) throw new Error("Bad FX payload");
  const rate = data.conversion_rate;
  cache.set(key, { rate });
  return { rate };
}

export async function convertAmount(from, to, amount) {
  // For precision, call pair with amount variant
  const url = `${BASE}/${KEY}/pair/${from}/${to}/${amount}`;
  console.log("url", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FX API error: ${res.status}`);
  const data = await res.json();
  if (
    !data ||
    typeof data.conversion_result !== "number" ||
    !data.conversion_rate
  ) {
    throw new Error("Bad FX payload");
  }
  // Also warm the rate cache
  cache.set(`pair:${from}:${to}`, { rate: data.conversion_rate });
  return { rate: data.conversion_rate, result: data.conversion_result };
}
