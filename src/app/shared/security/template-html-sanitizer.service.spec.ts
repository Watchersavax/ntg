import { TemplateHtmlSanitizerService } from "./template-html-sanitizer.service";

describe("TemplateHtmlSanitizerService", () => {
  let service: TemplateHtmlSanitizerService;

  beforeEach(() => {
    service = new TemplateHtmlSanitizerService();
  });

  it("removes executable markup and event handlers", () => {
    const clean = service.sanitize(
      '<div><script>alert(1)</script><img src="x" onerror="alert(2)"></div>'
    );

    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("<img");
  });

  it("removes active URL schemes", () => {
    const clean = service.sanitize('<a href="javascript:alert(1)">Open</a>');

    expect(clean).not.toContain("javascript:");
    expect(clean).toContain("Open");
  });

  it("preserves affidavit structure, styles, and custom field markers", () => {
    const clean = service.sanitize(
      '<style>.row { min-height: 10px; }</style>' +
      '<span cust_tag="firstName" class="row" style="font-size: 12px">Name</span>'
    );

    expect(clean).toContain("<style>");
    expect(clean).toContain('cust_tag="firstName"');
    expect(clean).toContain('class="row"');
    expect(clean).toContain("font-size: 12px");
  });

  it("returns a safe fragment for direct DOM insertion", () => {
    const fragment = service.sanitizeToFragment(
      '<p>Safe</p><img src="x" onerror="alert(1)">'
    );
    const host = document.createElement("div");
    host.appendChild(fragment);

    expect(host.textContent).toContain("Safe");
    expect(host.innerHTML).not.toContain("onerror");
  });

  it("safely replaces existing element content", () => {
    const host = document.createElement("div");
    host.textContent = "Old";

    service.replaceContent(
      host,
      '<form><select name="attribute"><option value="1">Name</option></select></form>' +
      '<img src="x" onerror="alert(1)">'
    );

    expect(host.textContent).toContain("Name");
    expect(host.querySelector("select").getAttribute("name")).toBe("attribute");
    expect(host.innerHTML).not.toContain("onerror");
  });
});
