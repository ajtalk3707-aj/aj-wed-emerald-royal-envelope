/**
 * Capture an array of DOM elements and compile them into a high-resolution multi-page PDF.
 * Uses dynamic import for jsPDF and html2canvas to keep the initial page load bundle lightweight.
 * 
 * @param {Object} options
 * @param {HTMLElement[]} options.pageElements - array of DOM elements representing each page
 * @param {string} options.fileName - name of the downloaded PDF file
 * @param {function} options.onProgress - progress callback (current, total, statusText)
 */
export async function generateWeddingPDF({
  pageElements,
  fileName = 'Lagna_Kankotri.pdf',
  onProgress = () => {},
}) {
  if (!pageElements || pageElements.length === 0) {
    throw new Error('પેજ એલિમેન્ટ્સ ઉપલબ્ધ નથી')
  }

  onProgress(0, pageElements.length, 'પીડીએફ મોડ્યુલ લોડ થઈ રહ્યું છે...')

  // Dynamically load jsPDF and html2canvas on demand
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  // Ensure Gujarati & calligraphy fonts are fully rendered
  if (document.fonts && document.fonts.ready) {
    onProgress(0, pageElements.length, 'રાજવી ફોન્ટ અને ગ્રાફિક્સ તૈયાર થઈ રહ્યા છે...')
    try {
      await document.fonts.ready
    } catch (e) {
      console.warn('Font ready check warning:', e)
    }
  }

  // Ensure all images (couple photos, icons) are fully loaded before capturing
  const imgPromises = []
  pageElements.forEach((el) => {
    const imgs = el.querySelectorAll('img')
    imgs.forEach((img) => {
      if (!img.complete || img.naturalWidth === 0) {
        imgPromises.push(
          new Promise((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        )
      }
    })
  })
  if (imgPromises.length > 0) {
    onProgress(0, pageElements.length, 'વર-કન્યાના ફોટો અને ગ્રાફિક્સ લોડ થઈ રહ્યા છે...')
    try {
      await Promise.all(imgPromises)
    } catch (e) {
      console.warn('Image load wait warning:', e)
    }
  }

  // Standard A4 dimensions in mm: 210 x 297 mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const total = pageElements.length

  for (let i = 0; i < total; i++) {
    const pageEl = pageElements[i]
    const pageNum = i + 1

    onProgress(pageNum, total, `પેજ ${pageNum} / ${total} પ્રોસેસ થઈ રહ્યું છે...`)

    // Brief yield to ensure layout update and smooth UI progression
    await new Promise((r) => setTimeout(r, 60))

    try {
      const canvas = await html2canvas(pageEl, {
        scale: 2, // High resolution (retina/300dpi feel)
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        windowWidth: 640,
        windowHeight: 905,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      if (i > 0) {
        pdf.addPage('a4', 'portrait')
      }

      // Fit full page A4 (210mm x 297mm) edge-to-edge
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    } catch (err) {
      console.error(`Error rendering page ${pageNum} to canvas:`, err)
      throw new Error(`પેજ ${pageNum} તૈયાર કરવામાં ક્ષતિ આવી: ${err.message}`)
    }
  }

  onProgress(total, total, 'પીડીએફ ફાઇલ ડાઉનલોડ થઈ રહી છે...')
  await new Promise((r) => setTimeout(r, 120))

  pdf.save(fileName)

  return true
}
