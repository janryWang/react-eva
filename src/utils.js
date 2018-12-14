export const toArr = arr => (Array.isArray(arr) ? arr : arr ? [arr] : [])

export const isFn = val => typeof val === "function"
