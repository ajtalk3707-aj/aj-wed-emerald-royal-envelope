import defaultWeddingData from '../data/weddingData.json'

export const STORAGE_KEY = 'wed_royal_invitation_data'

/**
 * Deep merge utility to ensure that any custom data always has fallback defaults
 */
function deepMerge(target, source) {
  const output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
          Object.assign(output, { [key]: source[key] })
        }
      }
    })
  }
  return output
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Load wedding data from localStorage, falling back to default JSON data
 */
export function loadWeddingData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return deepMerge(defaultWeddingData, parsed)
    }
  } catch (err) {
    console.error('Error loading custom wedding data:', err)
  }
  return defaultWeddingData
}

/**
 * Save customized wedding data to localStorage
 */
export function saveWeddingData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error('Error saving wedding data:', err)
    return false
  }
}

/**
 * Reset data back to default JSON data
 */
export function resetWeddingData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Error clearing wedding data:', err)
  }
  return defaultWeddingData
}

/**
 * Export wedding data as a downloadable JSON file
 */
export function exportDataAsJSON(data, filename = 'wedding_invitation_data.json') {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', jsonString)
  downloadAnchor.setAttribute('download', filename)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

/**
 * Parse and validate imported JSON data
 */
export function parseImportedJSON(text) {
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON root')
    }
    // Deep merge with defaults so that incomplete JSON structures don't crash the UI
    return { success: true, data: deepMerge(defaultWeddingData, parsed) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

