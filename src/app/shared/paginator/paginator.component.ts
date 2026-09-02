import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent {
  @Input() page: number = 0;
  @Input() hasPrev: boolean = false;
  @Input() hasNext: boolean = false;
  @Input() message: string = '';

  @Output() prevClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();

  onPrev() {
    if (this.hasPrev) {
      this.prevClick.emit();
    }
  }

  onNext() {
    if (this.hasNext) {
      this.nextClick.emit();
    }
  }
}