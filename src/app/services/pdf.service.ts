import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { unwrapResponse } from 'src/app/shared/utils/unwrap-response.util';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private http: HttpClient) {}

  previewPdf(htmlValue: string, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const element = document.createElement("div");
      element.innerHTML = htmlValue;

      const images = element.querySelectorAll("img");
      const promises = Array.from(images).map(async (img: HTMLImageElement) => {
        const imgSrc = img.getAttribute("src") || "";
        if (!imgSrc.startsWith("data:image")) {
          try {
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            img.src = await this.convertBlobToBase64(blob);
            // Skip unfetchable images (CORS, 404, etc.) — don't fail the whole preview
          } catch (error) {
            console.warn("Could not convert image to base64, skipping:", imgSrc);
          }
        }
      });

      Promise.all(promises).then(() => {
        let styleContent = '';
        element.querySelectorAll('style').forEach(style => {
          let css = style.textContent || '';
          css = css.replace(/\/\*<!\[CDATA\[/g, '').replace(/\]\]>\*\//g, '');
          styleContent += css + '\n';
          style.remove();
        });
        styleContent += `
          .row { padding: 0px !important; min-height: unset !important; }
          div { page-break-inside: avoid; break-inside: avoid; }
          img { page-break-inside: avoid; break-inside: avoid; }
        `;

        const content = `<html><head><style>${styleContent}</style></head><body>${element.innerHTML}</body></html>`;

        this.http.post(`${environment.url}user/template/generate-pdf`, { content, fileName }).subscribe(
          (response: any) => {
            const payload = unwrapResponse(response);
            const base64Pdf = payload && payload.fileBase64;
            if (base64Pdf) {
              try {
                const pdfBlob = this.base64ToBlob(base64Pdf, "application/pdf");
                resolve(window.URL.createObjectURL(pdfBlob));
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error("No PDF received from server"));
            }
          },
          (error) => reject(error)
        );
      }).catch(reject);
    });
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const base64String = base64.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }
}
