export const formatMemory = (kb: number) => {
  if (kb > 1024 * 1024) {
    return `${(kb / (1024 * 1024)).toFixed(2)} GB`
  }
  if (kb > 1024) {
    return `${(kb / 1024).toFixed(2)} MB`
  }
  return `${kb.toFixed(2)} KB`
} 