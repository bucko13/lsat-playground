export const BOLTWALL_CONFIGS = {
  BOLTWALL_HOST:
    process.env.NEXT_PUBLIC_BOLTWALL_HOST || 'https://safron-city.vercel.app/',
  BOLTWALL_RATE: +(process.env.NEXT_PUBLIC_BOLTWALL_RATE || 10), // sats per second
  BOLTWALL_MIN_TIME: +(process.env.NEXT_PUBLIC_MIN_TIME || 15),
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
}
