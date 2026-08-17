import { Injectable } from "@angular/core";
import { TemplateHtmlSanitizerService } from "src/app/shared/security/template-html-sanitizer.service";

export interface UploadedPhoto {
  slotId: string | null;
  source: string;
}

@Injectable({
  providedIn: "root"
})
export class TemplateRecreationPrefillService {
  constructor(private templateHtmlSanitizer: TemplateHtmlSanitizerService) {}

  parseAttributeValues(attributeValueList: string): any {
    if (!attributeValueList) {
      return {};
    }
    const parsed = this.parseJsonOrLegacy(attributeValueList);
    if (typeof parsed === "string") {
      return this.parseAttributeValues(parsed);
    }
    return parsed || {};
  }

  private parseJsonOrLegacy(value: string): any {
    try {
      return JSON.parse(value);
    } catch (jsonError) {
      try {
        return JSON.parse(this.legacyToJson(value));
      } catch (legacyJsonError) {
        return {};
      }
    }
  }

  /**
   * Answers are stored in the legacy format produced by replacing every double quote
   * of a JSON payload with a single quote, so apostrophes typed by the user are
   * indistinguishable from delimiters by a blanket replace. A quote is treated as a
   * delimiter only where JSON allows one, which keeps apostrophes inside answers.
   */
  private legacyToJson(value: string): string {
    let result = "";
    let insideString = false;
    for (let i = 0; i < value.length; i++) {
      const character = value.charAt(i);
      if (character !== "'") {
        result += character;
        continue;
      }
      if (!insideString) {
        insideString = true;
        result += "\"";
      } else if (this.isStringEnd(value, i + 1)) {
        insideString = false;
        result += "\"";
      } else {
        result += "'";
      }
    }
    return result;
  }

  private isStringEnd(value: string, from: number): boolean {
    for (let i = from; i < value.length; i++) {
      const character = value.charAt(i);
      if (character === " " || character === "\t" || character === "\n" || character === "\r") {
        continue;
      }
      return character === "," || character === ":" || character === "}" || character === "]";
    }
    return true;
  }

  filterKnownValues(values: any, questionlist: any[], sourceHtmlValue?: string): any {
    const filtered = {};
    if (!values || !questionlist) {
      return filtered;
    }
    const knownAttributes = new Set<string>();
    const hintDefaults = {};
    questionlist.forEach(question => {
      if (question && question.attributeDto && question.attributeDto.attributeName) {
        knownAttributes.add(question.attributeDto.attributeName);
        if (this.isHintLikeQuestion(question)) {
          hintDefaults[question.attributeDto.attributeName] = question.defaultValue;
        }
      }
      if (question && question.questionOptionDto) {
        question.questionOptionDto.forEach(option => {
          if (!option || !option.questionOptionActionDto) {
            return;
          }
          option.questionOptionActionDto.forEach(action => {
            if (action && action.attribute && action.attribute.attributeName) {
              knownAttributes.add(action.attribute.attributeName);
            }
          });
        });
      }
    });
    const renderedSourceValues = sourceHtmlValue ? this.extractRenderedAttributeValues(sourceHtmlValue) : null;
    Object.keys(values).forEach(key => {
      if (knownAttributes.has(key)
        && !this.isUnfilledHintValue(key, values[key], hintDefaults, renderedSourceValues)) {
        filtered[key] = values[key];
      }
    });
    return filtered;
  }

  private isHintLikeQuestion(question: any): boolean {
    return question.inputType === "textfield" || question.inputType === "datefield";
  }

  private isUnfilledHintValue(attributeName: string, value: any, hintDefaults: any, renderedSourceValues: any): boolean {
    if (!renderedSourceValues) {
      return false;
    }
    if (!hintDefaults.hasOwnProperty(attributeName)) {
      return false;
    }
    if (this.normalizeValue(value) !== this.normalizeValue(hintDefaults[attributeName])) {
      return false;
    }
    const renderedValues = renderedSourceValues[attributeName] || [];
    return renderedValues.indexOf(this.normalizeValue(value)) === -1;
  }

  private extractRenderedAttributeValues(sourceHtmlValue: string): any {
    const renderedValues = {};
    const html = this.parseHtmlValue(sourceHtmlValue);
    const templateElement = document.createElement("div");
    templateElement.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(html));
    const renderedFields = templateElement.querySelectorAll("span[cust_tag]") as NodeListOf<HTMLElement>;
    for (let i = 0; i < renderedFields.length; i++) {
      const attributeName = renderedFields[i].getAttribute("cust_tag");
      const renderedValue = this.normalizeValue(renderedFields[i].textContent);
      if (!attributeName || this.isBlankRenderedField(renderedValue)) {
        continue;
      }
      if (!renderedValues[attributeName]) {
        renderedValues[attributeName] = [];
      }
      renderedValues[attributeName].push(renderedValue);
    }
    return renderedValues;
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }
    return ("" + value).replace(/\s+/g, " ").trim();
  }

  private isBlankRenderedField(value: string): boolean {
    return value === "" || value.replace(/\s/g, "").match(/^_+$/) !== null;
  }

  /**
   * Uploaded photos of the source affidavit, each tagged with the template slot it
   * belongs to so prefill restores a photo into the same slot even when the slots
   * appear in a different order or some of them were left empty.
   */
  extractUploadedPhotos(sourceHtmlValue: string): UploadedPhoto[] {
    if (!sourceHtmlValue) {
      return [];
    }
    const html = this.parseHtmlValue(sourceHtmlValue);
    const templateElement = document.createElement("div");
    templateElement.appendChild(this.templateHtmlSanitizer.sanitizeToFragment(html));
    const uploadedImages = templateElement.querySelectorAll(
      "img.uploaded-user-photo-image, img[id^='uploaded-image-'], .upload-container.photo-uploaded img"
    );
    const photos: UploadedPhoto[] = [];
    for (let i = 0; i < uploadedImages.length; i++) {
      const image = uploadedImages[i] as HTMLImageElement;
      const source = image.getAttribute("src") || image.src;
      if (this.isUserUploadedPhotoSource(source)) {
        photos.push({ slotId: this.resolveSlotId(image), source: source });
      }
    }
    return photos;
  }

  private resolveSlotId(image: HTMLImageElement): string | null {
    const imageId = image.getAttribute("id");
    if (imageId && imageId.indexOf("uploaded-image-") === 0) {
      return imageId.replace("uploaded-image-", "");
    }
    const container = image.closest ? (image.closest("[id^='upload-container-']") as HTMLElement) : null;
    const containerId = container ? container.getAttribute("id") : null;
    return containerId ? containerId.replace("upload-container-", "") : null;
  }

  private parseHtmlValue(sourceHtmlValue: string): string {
    try {
      const parsed = JSON.parse(sourceHtmlValue);
      if (typeof parsed === "string") {
        return parsed;
      }
    } catch (jsonError) {
    }
    return sourceHtmlValue;
  }

  private isUserUploadedPhotoSource(source: string): boolean {
    return !!source && source.indexOf("data:image/") === 0;
  }
}
