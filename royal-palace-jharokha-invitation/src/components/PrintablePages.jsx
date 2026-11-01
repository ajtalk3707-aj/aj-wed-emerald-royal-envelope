import React from 'react'

export const PrintablePages = React.forwardRef(function PrintablePages(
  { data, groomPhoto, bridePhoto },
  ref
) {
  const groomName = data.couple?.groom?.fullName || 'ચિ. દર્શન'
  const brideName = data.couple?.bride?.fullName || 'ચિ. ઈશિતા'
  const activeGroomPhoto = groomPhoto || data.couple?.groom?.photo || '/grm.jpg'
  const activeBridePhoto = bridePhoto || data.couple?.bride?.photo || '/brd.jpg'
  const dateLine = data.weddingDate?.formatted || 'તા. ૧૩-૦૨-૨૦૨૫, ગુરુવાર'
  const venueName = data.venue?.name || 'નીલકંઠ ફાર્મ પાર્ટી પ્લોટ'
  const venueLines = data.venue?.lines || ['જૂનાગઢ બાયપાસ રોડ', 'કાંકરડા ચોકડી, જૂનાગઢ.']
  const contactNumber = data.contact?.phone || '9687336426'

  const p1 = data.pages?.cover || {}
  const p2 = data.pages?.sanskar || {}
  const p3 = data.pages?.haldi || {}
  const p4 = data.pages?.lagnotsav || {}
  const p5 = data.pages?.premRaas || {}
  const p6 = data.pages?.jaanPrasthan || {}
  const p7 = data.pages?.family || {}
  const p8 = data.pages?.invitation || {}

  const CrestSVG = (
    <div className="pdf-crest">
        <svg viewBox="0 0 100 100" width="68" height="68">
          <circle cx="50" cy="50" r="48" fill="#5a0f22" stroke="#e6bd5c" strokeWidth="3" />
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={`c1-${i}`}
              cx="50"
              cy="26"
              rx="8"
              ry="22"
              transform={`rotate(${i * 45} 50 50)`}
              fill="#e6bd5c"
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={`c2-${i}`}
              cx="50"
              cy="30"
              rx="5"
              ry="13"
              transform={`rotate(${i * 45 + 22.5} 50 50)`}
              fill="#fff0b8"
            />
          ))}
          <circle cx="50" cy="50" r="9" fill="#fff0b8" />
        </svg>
    </div>
  )

  const RangoliSVG = (
      <svg className="pdf-rangoli" viewBox="0 0 100 100" width="700" height="700" fill="none">
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={`r1-${i}`}
            cx="50"
            cy="22"
            rx="6"
            ry="30"
            transform={`rotate(${(i * 360) / 16} 50 50)`}
            stroke="#fff0b8"
            strokeWidth="0.4"
            fill="none"
          />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <ellipse
            key={`r2-${i}`}
            cx="50"
            cy="10"
            rx="3"
            ry="12"
            transform={`rotate(${(i * 360) / 24} 50 50)`}
            stroke="#fff0b8"
            strokeWidth="0.4"
            fill="none"
          />
        ))}
        <circle cx="50" cy="50" r="48" stroke="#fff0b8" strokeWidth="0.4" fill="none" />
        <circle cx="50" cy="50" r="30" stroke="#fff0b8" strokeWidth="0.4" fill="none" />
      </svg>
      )

      const DividerSVG = (
        <svg className="pdf-div-svg" viewBox="0 0 180 18" width="180" height="18" fill="none">
          <path d="M2 9H72" stroke="#e6bd5c" strokeWidth="1.5" fill="none" />
          <path d="M178 9H108" stroke="#e6bd5c" strokeWidth="1.5" fill="none" />
          <g>
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={`d-${i}`}
                cx="90"
                cy="3.5"
                rx="2"
                ry="4.5"
                transform={`rotate(${i * 45} 90 9)`}
                fill="#fff0b8"
              />
            ))}
          </g>
        </svg>
        )

        const LanternsAndDiyas = (
        <>
          <div className="pdf-lantern" style={{ left: '6%', '--h': '20px' }}><i></i></div>
          <div className="pdf-lantern" style={{ left: '18%', '--h': '52px' }}><i></i></div>
          <div className="pdf-lantern" style={{ left: '82%', '--h': '40px' }}><i></i></div>
          <div className="pdf-lantern" style={{ left: '94%', '--h': '16px' }}><i></i></div>
          <div className="pdf-diyas">
            <span className="pdf-diya" /><span className="pdf-diya" /><span className="pdf-diya" /><span className="pdf-diya" />
          </div>
        </>
        )

        return (
          <div ref={ref} className="pdf-isolated-root">
            <style>{`
        .pdf-isolated-root {
          font-family: 'Hind Vadodara', 'Noto Serif Gujarati', serif;
          color: #fff6e2;
          --gold: #e6bd5c;
          --g2: #fff0b8;
          --ivory: #fff6e2;
          background: #1c0509;
        }

        /* STRICT OVERRIDES: Never allow block backgrounds on text in PDF */
        .pdf-isolated-root h2,
        .pdf-isolated-root h3,
        .pdf-isolated-root .pdf-names,
        .pdf-isolated-root .pdf-hl,
        .pdf-isolated-root .pdf-pw b,
        .pdf-isolated-root p,
        .pdf-isolated-root span,
        .pdf-isolated-root li,
        .pdf-isolated-root div {
          background-image: none !important;
          background-color: transparent !important;
          -webkit-background-clip: initial !important;
          background-clip: initial !important;
        }

        .pdf-page-card {
          width: 640px;
          height: 905px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 24px;
        }
        .pdf-page-card.p1 { background: radial-gradient(circle at 50% 35%, #7a1a2c, #2a0710 70%) !important; }
        .pdf-page-card.p2 { background: radial-gradient(circle at 50% 35%, #0f6b52, #04251c 70%) !important; }
        .pdf-page-card.p3 { background: radial-gradient(circle at 50% 35%, #c4651a, #4a1f08 70%) !important; }
        .pdf-page-card.p4 { background: radial-gradient(circle at 50% 35%, #1f4fa0, #08183a 70%) !important; }
        .pdf-page-card.p5 { background: radial-gradient(circle at 50% 35%, #4b2a86, #140a2e 70%) !important; }
        .pdf-page-card.p6 { background: radial-gradient(circle at 50% 35%, #0f6b52, #04251c 70%) !important; }
        .pdf-page-card.p7 { background: radial-gradient(circle at 50% 35%, #7a1a2c, #2a0710 70%) !important; }
        .pdf-page-card.p8 { background: radial-gradient(circle at 50% 35%, #8c1f4a, #2e0a1c 70%) !important; }

        .pdf-rangoli {
          position: absolute; left: 50%; top: 50%; width: 700px; height: 700px;
          margin: -350px 0 0 -350px; opacity: .14; pointer-events: none;
        }
        .pdf-arch {
          position: relative; z-index: 2; width: 440px; padding: 56px 26px 40px; text-align: center;
          border-radius: 220px 220px 14px 14px / 150px 150px 14px 14px;
          background: linear-gradient(rgba(60,10,22,.85), rgba(25,5,12,.92)), radial-gradient(circle, rgba(230,189,92,.25) 1.5px, transparent 2px) 0 0/16px 16px !important;
          border: 3px solid #e6bd5c;
          box-shadow: 0 0 0 5px rgba(20,5,10,.7), 0 0 0 8px #e6bd5c, 0 0 40px rgba(230,189,92,.45);
        }
        .pdf-arch::before {
          content: ""; position: absolute; inset: 9px; border: 1px solid rgba(255,240,184,.6); border-radius: inherit; pointer-events: none;
        }
        .pdf-crest {
          position: absolute; top: -34px; left: 50%; margin-left: -34px; width: 68px; height: 68px; z-index: 3;
          filter: drop-shadow(0 0 10px rgba(255,220,120,.9));
        }

        /* Pristine Gold Typography for Headings without block background */
        .pdf-isolated-root h2,
        .pdf-isolated-root h3,
        .pdf-isolated-root .pdf-names,
        .pdf-isolated-root .pdf-hl,
        .pdf-isolated-root .pdf-pw b {
          color: #f7d070 !important;
          -webkit-text-fill-color: #f7d070 !important;
          text-shadow: 0 0 1px #8a6514, 0 1px 2px rgba(0,0,0,0.85);
          font-family: 'Noto Serif Gujarati', serif;
          margin-left: auto;
          margin-right: auto;
        }
        .pdf-isolated-root h2 { font-weight: 800; font-size: 1.85rem; letter-spacing: .05em; line-height: 1.4; margin: 4px 0 6px; }
        .pdf-isolated-root h3 { font-weight: 600; font-size: 1.15rem; margin: 12px 0 2px; }
        .pdf-isolated-root .pdf-names { font-weight: 800; font-size: 2rem; line-height: 1.3; margin: 10px 0; }
        .pdf-isolated-root .pdf-sang { display: block; font-size: 1.05rem; color: #fff6e2 !important; -webkit-text-fill-color: #fff6e2 !important; font-family: 'Noto Serif Gujarati', serif; }
        .pdf-isolated-root .pdf-hl { font-weight: 700; display: inline-block; }
        .pdf-isolated-root .pdf-shloka, .pdf-isolated-root .pdf-small, .pdf-isolated-root li { font-family: 'Noto Serif Gujarati', serif; }
        .pdf-isolated-root .pdf-shloka { font-size: .95rem; line-height: 1.8; color: #fff0b8 !important; -webkit-text-fill-color: #fff0b8 !important; }
        .pdf-isolated-root .pdf-small { font-size: .92rem; line-height: 1.7; color: #fff6e2 !important; -webkit-text-fill-color: #fff6e2 !important; margin: 4px 0; }
        .pdf-isolated-root li { font-size: .95rem; color: #fff6e2 !important; -webkit-text-fill-color: #fff6e2 !important; margin-bottom: 3px; }

        .pdf-div-svg { display: block; width: 180px; height: 18px; margin: 6px auto 10px; overflow: visible; }

        .pdf-ganesh { display: block; font-size: 2.3rem; color: #fff0b8 !important; -webkit-text-fill-color: #fff0b8 !important; text-shadow: 0 0 14px #e6bd5c; margin-bottom: 4px; }
        .pdf-couple { display: flex; align-items: flex-start; justify-content: center; gap: 12px; margin: 10px 0 6px; }
        .pdf-pw { flex: 1; max-width: 135px; }
        .pdf-pw b { display: block; font-weight: 800; font-size: 1.1rem; margin-top: 8px; }
        .pdf-amp { align-self: center; font-size: 1rem; padding-bottom: 24px; color: #fff6e2 !important; }
        .pdf-amp::before { content: "♥"; display: block; color: #ff6b86; font-size: 1.3rem; }

        .pdf-ph {
          position: relative; display: block; width: 135px; height: 180px;
          border-radius: 70px 70px 8px 8px; overflow: hidden; border: 3px solid #e6bd5c;
          background: linear-gradient(160deg, #4a1020, #1a0510) !important;
          box-shadow: 0 0 0 4px rgba(20,5,10,.7), 0 0 0 6px #e6bd5c, 0 0 20px rgba(230,189,92,.5);
        }
        .pdf-ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .pdf-ph-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2.2rem; color: #f7d070; }

        .pdf-lantern {
          position: absolute; top: 0; z-index: 3; transform-origin: top center; pointer-events: none;
        }
        .pdf-lantern::before { content: ""; display: block; width: 2px; margin: 0 auto; background: #e6bd5c; height: var(--h); }
        .pdf-lantern i {
          display: block; width: 34px; height: 46px; margin-left: -16px; border-radius: 12px 12px 18px 18px;
          background: radial-gradient(circle at 50% 55%, #fff3b0, #ffb21e 55%, #c4560f) !important;
          border: 2px solid #e6bd5c; box-shadow: 0 0 24px 6px rgba(255,170,40,.65);
        }

        .pdf-diyas {
          position: absolute; bottom: 18px; left: 0; right: 0; display: flex; justify-content: center;
          gap: 36px; z-index: 3; pointer-events: none;
        }
        .pdf-diya { position: relative; width: 34px; height: 15px; border-radius: 0 0 34px 34px; background: linear-gradient(#f3cf6d, #b07a1c) !important; }
        .pdf-diya::before {
          content: ""; position: absolute; left: 10px; top: -24px; width: 14px; height: 26px;
          border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
          background: radial-gradient(#fff6c8 20%, #ffb21e 60%, #e0521a) !important;
          box-shadow: 0 0 20px 8px rgba(255,170,40,.7);
        }
        .pdf-badge {
          display: inline-block; padding: 5px 18px; border-radius: 9999px; border: 1px solid #e6bd5c;
          background: rgba(42,7,16,0.92) !important; font-weight: 700; font-size: 0.85rem; color: #fff3c0 !important;
          -webkit-text-fill-color: #fff3c0 !important; margin-top: 10px;
        }
      `}</style>

            {/* Page 1 : કવર */}
            <div className="pdf-page-card p1" data-pdf-page="1">
              {RangoliSVG}
              {LanternsAndDiyas}
              <div className="pdf-arch">
                {CrestSVG}
                <span className="pdf-ganesh">{p1.ganeshSymbol || 'ॐ'}</span>
                <p className="pdf-shloka whitespace-pre-line">{p1.shloka}</p>
                <h2 className="mt-2">{p1.title || 'શુભ વિવાહ'}</h2>
                <div className="pdf-couple">
                  <div className="pdf-pw">
                    <div className="pdf-ph">
                      {activeGroomPhoto ? (
                        <img alt="Groom" src={activeGroomPhoto} crossOrigin="anonymous" />
                      ) : (
                        <div className="pdf-ph-empty">👑</div>
                      )}
                    </div>
                    <b>{groomName}</b>
                  </div>
                  <div className="pdf-amp">{data.couple?.connector || 'સંગ'}</div>
                  <div className="pdf-pw">
                    <div className="pdf-ph">
                      {activeBridePhoto ? (
                        <img alt="Bride" src={activeBridePhoto} crossOrigin="anonymous" />
                      ) : (
                        <div className="pdf-ph-empty">👸</div>
                      )}
                    </div>
                    <b>{brideName}</b>
                  </div>
                </div>
                <p className="pdf-hl mt-2">{dateLine}</p>
                <h3>{p1.inviter?.title || 'નિમંત્રક'}</h3>
                <p className="pdf-small">
                  {p1.inviter?.lines?.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                  મો. {contactNumber}
                </p>
              </div>
            </div>

            {/* Page 2 : વિવાહ સંસ્કાર */}
            <div className="pdf-page-card p2" data-pdf-page="2">
              {RangoliSVG}
              {LanternsAndDiyas}
              <div className="pdf-arch">
                {CrestSVG}
                <span className="text-sm font-bold text-[#fff0b8]">{p2.topInvocation || '॥ શ્રી ગણેશાય નમઃ ॥'}</span>
                <h2 className="mt-2">{p2.title || 'વિવાહ સંસ્કાર'}</h2>
                {DividerSVG}
                <p className="pdf-shloka my-1 whitespace-pre-line">{p2.shloka}</p>
                <p className="pdf-small mt-3">{p2.intro}</p>
                <div className="pdf-names my-3 text-[1.9rem]">
                  {groomName}<span className="pdf-sang">{data.couple?.connector || 'સંગ'}</span>{brideName}
                </div>
                <p className="pdf-small">{p2.blessing}</p>
              </div>
            </div>

            {/* Page 3 : હલ્દી રસમ */}
            <div className="pdf-page-card p3" data-pdf-page="3">
              {RangoliSVG}
              {LanternsAndDiyas}
              <div className="pdf-arch">
                {CrestSVG}
                <h2>{p3.title || 'હલ્દી રસમ'}</h2>
                {DividerSVG}
                <h3>{p3.ceremony?.title || 'પીઠી ચોળવાનો સમય'}</h3>
                <p className="pdf-small mt-1">
                  {p3.ceremony?.dayText || 'બુધવાર, તા. ૧૨-૦૨-૨૦૨૫ ના રોજ'}<br />
                  {p3.ceremony?.invitationText || 'આપની પધારવા વિનંતી.'}
                </p>
                <h3>{p3.meal?.title || 'સ્વરુચી ભોજન'}</h3>
                <p className="pdf-small mt-1"><span className="pdf-hl">{p3.meal?.timing || '(ભોજન : બપોરે ૧૨:૦૦ કલાકે)'}</span></p>
                <h3>{p3.venue?.title || 'શુભ સ્થળ'}</h3>
                <p className="pdf-small mt-1">{venueName},<br />{venueLines.join(', ')}</p>
              </div>
            </div>

            {/* Page 4 : લગ્નોત્સવ */}
            <div className="pdf-page-card p4" data-pdf-page="4">
              {RangoliSVG}
              {LanternsAndDiyas}
              <div className="pdf-arch">
                {CrestSVG}
                <h2>{p4.title || 'લગ્નોત્સવ'}</h2>
                {DividerSVG}
                <p className="pdf-small whitespace-pre-line">{p4.quote}</p>
                {p4.events?.map((ev, i) => (
                    <div key={i} className="my-1.5">
                      <h3>{ev.title}</h3>
                      <p className="pdf-small">
                        {ev.date}<br />
                        <span className="pdf-hl">{ev.timeHighlight}</span><br />
                        {ev.venue}
                      </p>
            </div>
          ))}
            </div>
          </div>

          {/* Page 5 : પ્રેમ રાસ */}
          <div className="pdf-page-card p5" data-pdf-page="5">
            {RangoliSVG}
            {LanternsAndDiyas}
            <div className="pdf-arch">
              {CrestSVG}
              <h2>{p5.title || 'પ્રેમ રાસ'}</h2>
              {DividerSVG}
              <h3>{p5.meal?.title || 'સ્વરુચી ભોજન'}</h3>
              <p className="pdf-small mt-1">
                {p5.meal?.date || 'બુધવાર, તા. ૧૨-૦૨-૨૦૨૫ ના રોજ'}<br />
                {p5.meal?.note || 'આપની પધારવા વિનંતી.'}<br />
                <span className="pdf-hl">{p5.meal?.timing || '(ભોજન : સાંજે ૭:૦૦ કલાકે)'}</span>
              </p>
              <h3>{p5.garba?.title || 'રાસ-ગરબા'}</h3>
              <p className="pdf-small mt-1">
                {p5.garba?.timePrefix || 'રાત્રે'} <span className="pdf-hl">{p5.garba?.timeHighlight || '૮:૩૦ કલાકે'}</span><br />
                {venueName}, {venueLines.join(', ')}
              </p>
            </div>
          </div>

          {/* Page 6 : જાન પ્રસ્થાન */}
          <div className="pdf-page-card p6" data-pdf-page="6">
            {RangoliSVG}
            {LanternsAndDiyas}
            <div className="pdf-arch">
              {CrestSVG}
              <h3 className="mt-0">{p6.departure?.title || 'જાન પ્રસ્થાન'}</h3>
              <p className="pdf-small">
                {p6.departure?.date || 'ગુરુવાર, તા. ૧૩-૦૨-૨૦૨૫'}<br />
                {p6.departure?.timePrefix || 'બપોરે'} <span className="pdf-hl">{p6.departure?.timeHighlight || '૨:૩૦ કલાકે'}</span><br />
                {p6.departure?.location || '(સ્થળ : સુરત)'}
              </p>
              <h3>{p6.hastMelap?.title || 'હસ્ત મેળાપ'}</h3>
              <p className="pdf-small">
                {p6.hastMelap?.date || 'ગુરુવાર, તા. ૧૩-૦૨-૨૦૨૫'}<br />
                {p6.hastMelap?.timePrefix || 'સાંજે'} <span className="pdf-hl">{p6.hastMelap?.timeHighlight || '૫:૧૫ કલાકે (શુભ ચોઘડિયે)'}</span>
              </p>
              <h3>{p6.note?.title || 'મધુર કલરવ'}</h3>
              <p className="pdf-small">{p6.note?.text}</p>
              <p className="pdf-small pdf-hl mt-2">{p6.note?.signoff || '– સાદર, સમસ્ત પરિવાર'}</p>
            </div>
          </div>

          {/* Page 7 : સ્નેહાધીન & દર્શનાભિલાષી */}
          <div className="pdf-page-card p7" data-pdf-page="7">
            {RangoliSVG}
            {LanternsAndDiyas}
            <div className="pdf-arch">
              {CrestSVG}
              <h2 className="text-[1.4rem]">{p7.snehadhin?.title || 'લિ. સ્નેહાધીન'}</h2>
              <ul className="list-none space-y-1 my-2">
                {p7.snehadhin?.members?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
              <h2 className="text-[1.4rem] mt-4">{p7.darshanabhilashi?.title || 'લિ. દર્શનાભિલાષી'}</h2>
              <ul className="list-none space-y-1 my-2">
                {p7.darshanabhilashi?.members?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Page 8 : મોસાળ / આમંત્રણ */}
          <div className="pdf-page-card p8" data-pdf-page="8">
            {RangoliSVG}
            {LanternsAndDiyas}
            <div className="pdf-arch">
              {CrestSVG}
              <h3 className="mt-0">{p8.mosal?.title || 'મોસાળ પક્ષ'}</h3>
              <p className="pdf-small">{p8.mosal?.text}</p>
              <h3>{p8.banej?.title || 'બાણેજ પક્ષ'}</h3>
              <p className="pdf-small">{p8.banej?.text}</p>
              <h3>{p8.firm?.title || 'ફર્મ'}</h3>
              <p className="pdf-small">{p8.firm?.text}</p>
              <h3>{p8.invitationMessage?.title || 'આમંત્રણ'}</h3>
              <p className="pdf-small">
                {(p8.invitationMessage?.template || '').replace(
                  '{groomName}',
                  groomName.replace('ચિ. ', '')
                )}
              </p>
              <p className="pdf-hl mt-2">સ્થળ : {venueName}, {venueLines.join(', ')}</p>
              <div className="pdf-badge">
                સંપર્ક: +91 {contactNumber}
              </div>
            </div>
          </div>
        </div>
        )
})
