// import React, { useState, useEffect } from "react";
// import * as pdfjs from "pdfjs-dist";

// import { GlobalWorkerOptions } from 'pdfjs-dist';
// import * as  pdfjsWorker from 'pdfjs-dist/build/pdf.worker';

// GlobalWorkerOptions.workerSrc = pdfjsWorker;

// const Pdf = () => {
//   const [pdfText, setPdfText] = useState("");
//   const pdfUrl = "http://localhost:5173/LeavePolicy.pdf";

//   useEffect(() => {
//     const fetchPdfText = async () => {
//       try {
//         const response = await fetch(pdfUrl);
//         const pdfBlob = await response.blob();
//         const pdfText = await readPdf(pdfBlob);
//         setPdfText(pdfText);
//       } catch (error) {
//         console.error("Error fetching PDF:", error);
//       }
//     };

//     const readPdf = async (pdfBlob) => {
//       try {
//         const typedarray = new Uint8Array(await pdfBlob.arrayBuffer());
//         const pdf = await pdfjs.getDocument(typedarray).promise;
//         const maxPages = pdf.numPages;
//         let pdfText = "";
//         for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
//           const page = await pdf.getPage(pageNum);
//           const textContent = await page.getTextContent();
//           const pageText = textContent.items.map((item) => item.str).join("");
//           pdfText += pageText + " ";
//         }
//         return pdfText;
//       } catch (error) {
//         console.error("Error reading PDF:", error);
//         return "";
//       }
//     };

//     fetchPdfText();
//   }, [pdfUrl]);

//   const highlightedText = pdfText.replace(
//     /Leave/gi,
//     '<span style="color: red;">Leave</span>'
//   );

//   return (
//     <>
//       <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
//     </>
//   );
// };

// export default Pdf;

// import React from "react";

// const Pdf = () => {
//   const pdfUrl = "http://localhost:5173/LeavePolicy.pdf";

//   return (
//     <>
//       <object data={pdfUrl} type="application/pdf" width="100%" height="600px">
//         <p>PDF cannot be displayed.</p>
//       </object>
//       <style>
//         {`
//           object::after {
//             content: "Leave";
//             color: red;
//           }
//         `}
//       </style>
//     </>
//   );
// };

// export default Pdf;


import React, { useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.js';

const Pdf = () => {
  const pdfUrl = "http://localhost:5174/LeavePolicy.pdf";
  const targetWord = "Leave";
  const canvasContainerRef = useRef();

  useEffect(() => {
    const renderPdfWithHighlights = async () => {
      try {
        if (!pdfUrl.toLowerCase().endsWith('.pdf')) {
          throw new Error('Invalid file format. Only PDF files are supported.');
        }

        // Clear the canvas container before rendering
        canvasContainerRef.current.innerHTML = '';

        const response = await fetch(pdfUrl);
        const pdfBlob = await response.blob();
        const typedarray = new Uint8Array(await pdfBlob.arrayBuffer());
        const pdf = await pdfjs.getDocument(typedarray).promise;
        const maxPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          // Create a new canvas for each page
          const canvas = document.createElement('canvas');
          canvas.className = "pdf-canvas";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvasContainerRef.current.appendChild(canvas);

          const context = canvas.getContext("2d");
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;

          const textContent = await page.getTextContent();
          const wordBounds = getWordBounds(textContent.items, targetWord);

          if (wordBounds) {
            context.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red color with opacity
            context.fillRect(
              wordBounds.left,
              wordBounds.top,
              wordBounds.width,
              wordBounds.height
            );
          }
        }
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    if (pdfUrl) {
      renderPdfWithHighlights();
    }
  }, [pdfUrl]);

  const getWordBounds = (items, targetWord) => {
    let bounds = null;
    let combinedStr = '';
    for (let i = 0; i < items.length; i++) {
      combinedStr += items[i].str;
      if (combinedStr.includes(targetWord)) {
        if (!bounds) {
          bounds = {...items[i].transform};
        } else {
          bounds[2] = Math.max(bounds[2], items[i].transform[2]);
          bounds[3] = Math.max(bounds[3], items[i].transform[3]);
        }
        combinedStr = '';
      }
    }
    if (bounds) {
      const left = bounds[4];
      const top = bounds[5] - bounds[3];
      const width = bounds[2];
      const height = bounds[3];
      return { left, top, width, height };
    }
    return null;
  };

  return (
    <div ref={canvasContainerRef} />
  );
};

export default Pdf;
















