import { Injectable } from "@angular/core";

declare const require: any;
const DOMPurify = require("dompurify");

const TEMPLATE_SANITIZER_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ["cust_tag"],
  FORBID_TAGS: ["base", "embed", "iframe", "link", "meta", "object", "script"],
  FORBID_ATTR: ["srcdoc"]
};

@Injectable({ providedIn: "root" })
export class TemplateHtmlSanitizerService {
  replaceContent(element: Element, html: string): void {
    element.textContent = "";
    element.appendChild(this.sanitizeToFragment(html));
  }

  sanitize(html: string): string {
    const host = document.createElement("div");
    host.appendChild(this.sanitizeToFragment(html));
    return host.innerHTML;
  }

  sanitizeToFragment(html: string): DocumentFragment {
    const inertDocument = new DOMParser().parseFromString(html || "", "text/html");
    const styleContents: string[] = [];
    const styles = inertDocument.querySelectorAll("style");
    for (let i = 0; i < styles.length; i++) {
      styleContents.push(styles[i].textContent || "");
      styles[i].parentNode.removeChild(styles[i]);
    }

    const fragment = DOMPurify.sanitize(inertDocument.body.innerHTML, {
      ...TEMPLATE_SANITIZER_CONFIG,
      RETURN_DOM_FRAGMENT: true
    }) as DocumentFragment;

    styleContents.forEach(css => {
      const style = document.createElement("style");
      style.textContent = css;
      fragment.appendChild(style);
    });

    return fragment;
  }
}
