# Royal Palace Jharokha Theme - AJ Invitation (રોયલ લગ્ન કંકોતરી)

A standalone luxury animated Gujarati wedding invitation built with React + Vite + Tailwind CSS.

## Features
- 👑 **Royal Palace Jharokha Theme** with vertical parallax scrolling
- 🪔 **Swinging royal lanterns**, glowing flickering diyas & rotating Rangoli mandalas
- ✨ **Rising golden stardust** & shimmering gold foil typography
- 📄 **One-Click Multi-Page PDF Export**:
  - High-DPI, 300-DPI equivalent printable multi-page PDF generation (`html2canvas` + `jsPDF`)
  - Full-bleed rich royal gradients, authentic Gujarati typography, arch frames, and couple photos
  - Zero CORS or layout clipping issues; lazy-loaded for optimal web performance
  - Native print ready (`@media print` support)
- 🗂️ **Centralized JSON Data Management**:
  - All invitation details structured in `src/data/weddingData.json`
  - Integrated in-app Data Manager modal (`⚙️ ડેટા મેનેજ`)
  - **Quick Form Mode** for rapid name, date, venue, and phone updates
  - **Full JSON Schema Mode** with real-time validation, copy, import, and export backup
  - LocalStorage persistence with 1-click restore to defaults
- 📜 **8 Imperial Pages**:
  1. કવર (Ganesh Shloka, Couple Photos, Wedding Date, Inviter details)
  2. વિવાહ સંસ્કાર (Wedding Announcement, Mangalya Shloka)
  3. હલ્દી રસમ (Haldi Ceremony & Lunch Timing)
  4. લગ્નોત્સવ (Mandap Muhurat & Dinner)
  5. પ્રેમ રાસ (Raas-Garba & Sangeet Sandhya)
  6. જાન પ્રસ્થાન & હસ્ત મેળાપ (Wedding Day & Hast Melap)
  7. લિ. સ્નેહાધીન & દર્શનાભિલાષી (Family Members)
  8. મોસાળ પક્ષ, ફર્મ & શુભ સ્થળ (Venue with 1-Click Google Maps & WhatsApp RSVP + PDF Export)
- 📷 Couple photo upload capability (with localStorage persistence)
- 🎵 Built-in auspicious Shehnai wedding melody player
- 📱 100% Mobile responsive with smooth vertical snapping and jump navigation HUD

## How to Run

1. Open terminal in this folder:
```bash
npm install
npm run dev
```

2. Open the local link in your browser:
```
http://localhost:5175
```

3. To build for production:
```bash
npm run build
```
The production bundle will be created in the `dist` folder.
