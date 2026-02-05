// Memory Stress Test Configuration
// Fetches config from external API, falls back to defaults if unavailable

const CONFIG_API_URL = 'https://670b-2406-7400-50-100a-da0-4847-31f9-49ee.ngrok-free.app/'

// Default configuration (used if API fetch fails)
const DEFAULT_CONFIG = {
  CHUNK_SIZE_MB: 150,
  CAP_LIMIT_MB: 2550,
  ALLOCATION_INTERVAL_MS: 800,
} as const

export async function getStressConfig() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

    const response = await fetch(CONFIG_API_URL, {
      signal: controller.signal,
      cache: 'no-store', // Disable caching
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      
      // Validate the response has required fields
      if (
        typeof data.CHUNK_SIZE_MB === 'number' &&
        typeof data.CAP_LIMIT_MB === 'number' &&
        typeof data.ALLOCATION_INTERVAL_MS === 'number'
      ) {
        console.log('Loaded stress config from API:', data)
        return {
          CHUNK_SIZE_MB: data.CHUNK_SIZE_MB,
          CAP_LIMIT_MB: data.CAP_LIMIT_MB,
          ALLOCATION_INTERVAL_MS: data.ALLOCATION_INTERVAL_MS,
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch stress config from API, using defaults:', error)
  }

  // Fallback to default config
  return DEFAULT_CONFIG
}

// For backwards compatibility
export const STRESS_CONFIG = DEFAULT_CONFIG

// Derived values helper
export function getDerivedConfig(config: typeof DEFAULT_CONFIG) {
  return {
    CHUNK_SIZE_BYTES: config.CHUNK_SIZE_MB * 1024 * 1024,
    MAX_CHUNKS: Math.floor(config.CAP_LIMIT_MB / config.CHUNK_SIZE_MB),
  }
}

