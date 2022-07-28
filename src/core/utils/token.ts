import axios from "axios";

export async function getTokenPrice(tokenId = "usd-balance") {
  const resp = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
  );
  return resp.data;
}