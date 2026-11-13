
/**
 * NOVVOT MARKET — 80 mm THERMAL RECEIPT
 * Mobil qurilmalarda logotip va chek o'lchamlarini
 * barqarorlashtirish uchun chop etish moduli.
 */

export function printReceipt() {
  const receipt = document.getElementById("pos-receipt");

  if (!receipt) {
    return Promise.reject(
      new Error("Chek topilmadi: #pos-receipt")
    );
  }

  const PAPER_MM = 80;
  const CONTENT_MM = 72;
  const LOGO_MM = 16;

  const frame = document.createElement("iframe");

  frame.title = "Novvot Market chek";
  frame.setAttribute("aria-hidden", "true");

  Object.assign(frame.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "80mm",
    height: "1px",
    opacity: "0",
    border: "0",
    pointerEvents: "none",
    zIndex: "-1",
  });

  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;

  if (!doc || !win) {
    frame.remove();
    return Promise.reject(
      new Error("Printer oynasini yaratib bo'lmadi")
    );
  }

  // Asl chekni o'zgartirmay nusxa olamiz.
  const clone = receipt.cloneNode(true);

  // Logotip o'lchamini HTML darajasida ham
  // majburiy belgilaymiz.
  const logos = clone.querySelectorAll(
    ".receipt-logo, .receipt-heading img"
  );

  logos.forEach((logo) => {
    logo.setAttribute("width", "60");
    logo.setAttribute("height", "60");

    Object.assign(logo.style, {
      display: "block",
      width: `${LOGO_MM}mm`,
      height: `${LOGO_MM}mm`,
      minWidth: `${LOGO_MM}mm`,
      maxWidth: `${LOGO_MM}mm`,
      minHeight: `${LOGO_MM}mm`,
      maxHeight: `${LOGO_MM}mm`,
      objectFit: "contain",
      margin: "0 auto 2mm",
      padding: "0",
      transform: "none",
      zoom: "1",
    });
  });

  // Rasmlarning manzilini to'liq URL qilamiz.
  clone.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");

    if (src) {
      img.src = new URL(src, window.location.href).href;
    }
  });

  const css = `
    @page {
      size: ${PAPER_MM}mm 200mm;
      margin: 0;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box !important;
    }

    html {
      width: ${PAPER_MM}mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }

    body {
      width: ${PAPER_MM}mm !important;
      min-width: ${PAPER_MM}mm !important;
      max-width: ${PAPER_MM}mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      color: black !important;
      font-family: Arial, sans-serif !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
      zoom: 1 !important;
      transform: none !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    #pos-receipt {
      display: block !important;
      position: static !important;
      width: ${CONTENT_MM}mm !important;
      min-width: ${CONTENT_MM}mm !important;
      max-width: ${CONTENT_MM}mm !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 auto !important;
      padding: 2mm 0 3mm !important;
      border: 0 !important;
      box-shadow: none !important;
      background: white !important;
      color: black !important;
      overflow: visible !important;
      visibility: visible !important;
      opacity: 1 !important;
      transform: none !important;
      zoom: 1 !important;
      font-family: Arial, sans-serif !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    /* LOGOTIP — QAT'IY 16 x 16 mm */

    #pos-receipt .receipt-logo,
    #pos-receipt .receipt-heading img {
      display: block !important;
      width: ${LOGO_MM}mm !important;
      height: ${LOGO_MM}mm !important;
      min-width: ${LOGO_MM}mm !important;
      max-width: ${LOGO_MM}mm !important;
      min-height: ${LOGO_MM}mm !important;
      max-height: ${LOGO_MM}mm !important;
      object-fit: contain !important;
      object-position: center !important;
      margin: 0 auto 2mm !important;
      padding: 0 !important;
      border: 0 !important;
      transform: none !important;
      zoom: 1 !important;
    }

    /* CHEK SARLAVHASI */

    #pos-receipt .receipt-heading {
      display: block !important;
      width: 100% !important;
      margin: 0 0 2mm !important;
      padding: 0 0 2mm !important;
      text-align: center !important;
      border-bottom: 1px dashed black !important;
    }

    #pos-receipt h1 {
      display: block !important;
      margin: 0 0 1.5mm !important;
      padding: 0 !important;
      font-family: Arial, sans-serif !important;
      font-size: 19px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      text-align: center !important;
      white-space: normal !important;
    }

    #pos-receipt p {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 12px !important;
      line-height: 1.3 !important;
      overflow-wrap: anywhere !important;
    }

    #pos-receipt .receipt-id {
      display: block !important;
      margin-top: 1mm !important;
      font-size: 12px !important;
    }

    /* MIJOZ VA SOTUVCHI */

    #pos-receipt .receipt-info {
      display: block !important;
      width: 100% !important;
      margin: 2mm 0 !important;
      padding: 0 !important;
      font-size: 12px !important;
    }

    #pos-receipt .receipt-info p {
      margin-bottom: 1mm !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
    }

    /* MAHSULOTLAR JADVALI */

    #pos-receipt .receipt-table {
      display: table !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      table-layout: fixed !important;
      font-family: Arial, sans-serif !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
    }

    #pos-receipt .receipt-name {
      width: 31% !important;
    }

    #pos-receipt .receipt-qty {
      width: 20% !important;
    }

    #pos-receipt .receipt-price {
      width: 27% !important;
    }

    #pos-receipt .receipt-total-column {
      width: 22% !important;
    }

    #pos-receipt .receipt-table th,
    #pos-receipt .receipt-table td {
      min-width: 0 !important;
      padding: 1mm 0.3mm !important;
      border: 1px solid black !important;
      color: black !important;
      background: white !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
      text-align: center !important;
      vertical-align: middle !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    #pos-receipt .receipt-table th {
      font-weight: 700 !important;
    }

    #pos-receipt .receipt-table td:first-child {
      text-align: left !important;
    }

    #pos-receipt .receipt-cell-line {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    #pos-receipt .receipt-unit-price {
      font-size: 10px !important;
      letter-spacing: -0.1px !important;
    }

    #pos-receipt .receipt-quantity,
    #pos-receipt .receipt-item-total {
      font-size: 11px !important;
    }

    #pos-receipt .receipt-table tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* JAMI SUMMA */

    #pos-receipt .receipt-total {
      display: flex !important;
      width: 100% !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 2mm !important;
      margin-top: 2mm !important;
      padding-top: 1mm !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      white-space: normal !important;
    }

    #pos-receipt .receipt-total b {
      overflow-wrap: anywhere !important;
    }

    #pos-receipt .receipt-thanks {
      display: block !important;
      width: 100% !important;
      margin-top: 3mm !important;
      text-align: center !important;
      font-size: 12px !important;
    }

    #pos-receipt .receipt-end {
      display: none !important;
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
      }

      #pos-receipt {
        margin: 0 auto !important;
      }
    }
  `;

  doc.open();

  doc.write(`
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      >
      <title>Novvot Market Chek</title>
      <style>${css}</style>
    </head>
    <body></body>
    </html>
  `);

  doc.close();
  doc.body.appendChild(doc.importNode(clone, true));

  return new Promise((resolve, reject) => {
    let settled = false;
    let fallbackTimer;

    const cleanup = () => {
      clearTimeout(fallbackTimer);
      win.removeEventListener("afterprint", finish);
      window.removeEventListener("afterprint", finish);
      frame.remove();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const waitForImages = () =>
      Promise.all(
        Array.from(doc.images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((done) => {
            const timer = setTimeout(done, 3000);

            img.onload = img.onerror = () => {
              clearTimeout(timer);
              done();
            };
          });
        })
      );

    const startPrint = async () => {
      try {
        await waitForImages();

        if (doc.fonts?.ready) {
          await doc.fonts.ready;
        }

        // Brauzerga yakuniy layoutni hisoblash imkonini beramiz.
        await new Promise((done) =>
          win.requestAnimationFrame(() =>
            win.requestAnimationFrame(done)
          )
        );

        const printed = doc.getElementById("pos-receipt");

        if (!printed) {
          throw new Error("Chek nusxasi topilmadi");
        }

        const heightPx = Math.max(
          printed.scrollHeight,
          printed.getBoundingClientRect().height
        );

        const heightMm = Math.max(
          40,
          Math.ceil((heightPx * 25.4) / 96) + 8
        );

        const pageStyle = doc.createElement("style");

        pageStyle.textContent = `
          @page {
            size: ${PAPER_MM}mm ${heightMm}mm;
            margin: 0;
          }
        `;

        doc.head.appendChild(pageStyle);

        win.addEventListener("afterprint", finish, {
          once: true,
        });

        window.addEventListener("afterprint", finish, {
          once: true,
        });

        // Ba'zi mobil brauzerlar afterprint
        // hodisasini yubormaydi.
        fallbackTimer = setTimeout(finish, 120000);

        win.focus();
        win.print();
      } catch (error) {
        fail(error);
      }
    };

    startPrint();
  });
}
