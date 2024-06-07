import React, { useState, useEffect } from "react";
import * as pdfjs from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Pdf = () => {
  const pdfUrl = "http://localhost:5173/LeavePolicy.pdf";
  const targetParagraph =
    "The objective of this policy is to define the types and entitlement of leaves and provide the guidelines for its administration";

  useEffect(() => {
    const renderPdfWithHighlights = async () => {
      try {
        const response = await fetch(pdfUrl);
        const pdfBlob = await response.blob();
        const typedarray = new Uint8Array(await pdfBlob.arrayBuffer());
        const pdf = await pdfjs.getDocument(typedarray).promise;
        const maxPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.className = "pdf-canvas";
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext("2d");
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;

          const textContent = await page.getTextContent();
          let paragraphFound = false;

          textContent.items.forEach((item) => {
            const text = item.str;
            if (text.includes(targetParagraph)) {
              paragraphFound = true;
              context.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red color with opacity
              context.fillRect(
                item.transform[4], // x coordinate
                item.transform[5] - item.height, // y coordinate
                item.width, // width
                item.height // height
              );
            }
          });

          if (paragraphFound) {
            const container = document.getElementById("pdf-container");
            container.appendChild(canvas);
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

  return <div id="pdf-container"></div>;
};

export default Pdf;
