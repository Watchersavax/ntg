import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-documenso-signing-embed",
  templateUrl: "./documenso-signing-embed.component.html",
  styleUrls: ["./documenso-signing-embed.component.css"],
})
export class DocumensoSigningEmbedComponent implements OnInit, OnChanges, OnDestroy {
  @Input() signingUrl: string;
  @Input() name: string;
  @Input() email: string;
  @Input() lockName = true;
  @Input() lockEmail = true;
  @Input() language: string;
  @Input() allowDocumentRejection = false;

  @Output() documentReady = new EventEmitter<void>();
  @Output() documentCompleted = new EventEmitter<any>();
  @Output() documentError = new EventEmitter<any>();
  @Output() documentRejected = new EventEmitter<any>();

  @ViewChild("signingIframe", { static: false }) signingIframe: ElementRef;

  embedSrc: SafeResourceUrl;
  private rawEmbedSrc: string;
  private expectedOrigin: string;
  private messageEventListener: (event: MessageEvent) => void;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.messageEventListener = (event: MessageEvent) => this.handleMessage(event);
    window.addEventListener("message", this.messageEventListener);
    this.updateEmbedSrc();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.signingUrl || changes.name || changes.email || changes.language
      || changes.lockName || changes.lockEmail || changes.allowDocumentRejection) {
      this.updateEmbedSrc();
    }
  }

  ngOnDestroy() {
    if (this.messageEventListener) {
      window.removeEventListener("message", this.messageEventListener);
    }
  }

  private updateEmbedSrc() {
    if (!this.signingUrl) {
      this.rawEmbedSrc = null;
      this.embedSrc = null;
      this.expectedOrigin = null;
      return;
    }
    try {
      this.rawEmbedSrc = this.buildEmbedUrl(this.signingUrl);
    } catch (error) {
      console.error("Invalid Documenso signing URL:", error);
      this.rawEmbedSrc = null;
      this.embedSrc = null;
      this.expectedOrigin = null;
      return;
    }
    this.embedSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawEmbedSrc);
  }

  private buildEmbedUrl(value: string): string {
    const parsed = this.parseSigningUrl(value);
    this.validateEmbedOrigin(parsed.host);
    this.expectedOrigin = parsed.host;
    const options = {
      name: this.name,
      lockName: this.lockName,
      email: this.email,
      lockEmail: this.lockEmail,
      language: this.language,
      allowDocumentRejection: this.allowDocumentRejection,
    };
    const encodedOptions = btoa(encodeURIComponent(JSON.stringify(options)));
    return parsed.host + "/embed/sign/" + parsed.token + "#" + encodedOptions;
  }

  private parseSigningUrl(value: string): { host: string; token: string } {
    if (value.indexOf("http://") !== 0 && value.indexOf("https://") !== 0) {
      return { host: "https://app.documenso.com", token: value };
    }
    const anchor = document.createElement("a");
    anchor.href = value;
    const host = anchor.protocol && anchor.host ? anchor.protocol + "//" + anchor.host : "https://app.documenso.com";
    const pathname = anchor.pathname || value;
    const parts = pathname.split("/").filter((part) => !!part);
    const token = parts.length ? parts[parts.length - 1] : value;
    return { host: host, token: token };
  }

  private validateEmbedOrigin(origin: string) {
    const anchor = document.createElement("a");
    anchor.href = origin;
    const isHttps = anchor.protocol === "https:";
    const isLocalHttp = anchor.protocol === "http:"
      && (anchor.hostname === "localhost" || anchor.hostname === "127.0.0.1");
    const isDocumensoHost = anchor.hostname === "documenso.com"
      || anchor.hostname === "app.documenso.com"
      || anchor.hostname.endsWith(".documenso.com");
    if ((!isHttps || !isDocumensoHost) && !isLocalHttp) {
      throw new Error("Unsupported signing origin");
    }
  }

  private handleMessage(event: MessageEvent) {
    if (!this.signingIframe || !this.signingIframe.nativeElement) {
      return;
    }
    if (this.signingIframe.nativeElement.contentWindow !== event.source) {
      return;
    }
    if (!this.expectedOrigin || event.origin !== this.expectedOrigin) {
      return;
    }
    if (!event.data || !event.data.action) {
      return;
    }
    if (event.data.action === "document-ready") {
      this.documentReady.emit();
    } else if (event.data.action === "document-completed") {
      this.documentCompleted.emit(event.data.data);
    } else if (event.data.action === "document-error") {
      this.documentError.emit(event.data.data);
    } else if (event.data.action === "document-rejected") {
      this.documentRejected.emit(event.data.data);
    }
  }
}
