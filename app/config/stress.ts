// Memory Stress Test Configuration
// Change these values to adjust stress test behavior across the entire app

export const STRESS_CONFIG = {
  // Size of each memory chunk in MB
  CHUNK_SIZE_MB: 50,
  
  // Maximum total memory to allocate in MB
  CAP_LIMIT_MB: 500,
  
  // Interval between allocations in milliseconds
  ALLOCATION_INTERVAL_MS: 1000,
} as const

// Derived values (don't modify these)
export const STRESS_DERIVED = {
  CHUNK_SIZE_BYTES: STRESS_CONFIG.CHUNK_SIZE_MB * 1024 * 1024,
  MAX_CHUNKS: Math.floor(STRESS_CONFIG.CAP_LIMIT_MB / STRESS_CONFIG.CHUNK_SIZE_MB),
} as const
