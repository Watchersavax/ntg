import { TemplateRecreationPrefillService } from "./template-recreation-prefill.service";
import { TemplateHtmlSanitizerService } from "src/app/shared/security/template-html-sanitizer.service";

describe("TemplateRecreationPrefillService", () => {
  let service: TemplateRecreationPrefillService;

  beforeEach(() => {
    service = new TemplateRecreationPrefillService(new TemplateHtmlSanitizerService());
  });

  it("parses legacy single-quoted attribute values", () => {
    const values = service.parseAttributeValues("{'firstName':'Ada','age':37}");

    expect(values.firstName).toBe("Ada");
    expect(values.age).toBe(37);
  });

  it("keeps apostrophes typed inside legacy single-quoted answers", () => {
    const values = service.parseAttributeValues(
      "{'company':'O'Brien & Sons','note':'ends with an apostrophe'','city':'Lagos'}"
    );

    expect(values.company).toBe("O'Brien & Sons");
    expect(values.note).toBe("ends with an apostrophe'");
    expect(values.city).toBe("Lagos");
  });

  it("parses double-encoded attribute values", () => {
    const values = service.parseAttributeValues(JSON.stringify("{\"firstName\":\"Ada\"}"));

    expect(values.firstName).toBe("Ada");
  });

  it("keeps only values matching current template attributes", () => {
    const values = {
      firstName: "Ada",
      obsoleteField: "old",
      conditionalField: "shown"
    };
    const questionlist: any[] = [
      { attributeDto: { attributeName: "firstName" } },
      {
        questionOptionDto: [
          {
            questionOptionActionDto: [
              { attribute: { attributeName: "conditionalField" } }
            ]
          }
        ]
      }
    ];

    const filtered = service.filterKnownValues(values, questionlist);

    expect(filtered.firstName).toBe("Ada");
    expect(filtered.conditionalField).toBe("shown");
    expect(filtered.obsoleteField).toBeUndefined();
  });

  it("does not prefill text hints that were never rendered into the source document", () => {
    const values = {
      firstName: "Enter first name",
      lastName: "Lovelace"
    };
    const questionlist: any[] = [
      {
        inputType: "textfield",
        defaultValue: "Enter first name",
        attributeDto: { attributeName: "firstName" }
      },
      {
        inputType: "textfield",
        defaultValue: "Enter last name",
        attributeDto: { attributeName: "lastName" }
      }
    ];
    const html =
      "<span cust_tag=\"firstName\">___________</span>" +
      "<span cust_tag=\"lastName\">Lovelace </span>";

    const filtered = service.filterKnownValues(values, questionlist, html);

    expect(filtered.firstName).toBeUndefined();
    expect(filtered.lastName).toBe("Lovelace");
  });

  it("keeps a text answer that matches the hint when it was rendered into the source document", () => {
    const values = {
      firstName: "Enter first name"
    };
    const questionlist: any[] = [
      {
        inputType: "textfield",
        defaultValue: "Enter first name",
        attributeDto: { attributeName: "firstName" }
      }
    ];
    const html = "<span cust_tag=\"firstName\">Enter first name </span>";

    const filtered = service.filterKnownValues(values, questionlist, html);

    expect(filtered.firstName).toBe("Enter first name");
  });

  it("extracts uploaded photo sources from saved html", () => {
    const html = JSON.stringify(
      "<div class=\"upload-container photo-uploaded\">" +
      "<img class=\"uploaded-user-photo-image\" src=\"data:image/png;base64,abc\" />" +
      "</div>"
    );

    const photos = service.extractUploadedPhotos(html);

    expect(photos.length).toBe(1);
    expect(photos[0].source).toBe("data:image/png;base64,abc");
  });

  it("tags each uploaded photo with the slot it was uploaded into", () => {
    const html =
      "<div id=\"upload-container-2\" class=\"upload-container photo-uploaded\">" +
      "<img id=\"uploaded-image-2\" class=\"uploaded-user-photo-image\" src=\"data:image/png;base64,second\" />" +
      "</div>";

    const photos = service.extractUploadedPhotos(html);

    expect(photos.length).toBe(1);
    expect(photos[0].slotId).toBe("2");
  });

  it("does not treat static template images as uploaded photos", () => {
    const html = "<img id=\"static-image\" src=\"data:image/png;base64,static\" />";

    const photos = service.extractUploadedPhotos(html);

    expect(photos.length).toBe(0);
  });

  it("sanitizes saved html before extracting uploaded photos", () => {
    const html =
      '<img class="uploaded-user-photo-image" src="data:image/png;base64,abc" onerror="alert(1)" />' +
      '<script>alert(2)</script>';

    const photos = service.extractUploadedPhotos(html);

    expect(photos.length).toBe(1);
    expect(photos[0].source).toBe("data:image/png;base64,abc");
  });
});
