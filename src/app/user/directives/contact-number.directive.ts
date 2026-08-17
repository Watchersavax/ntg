import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[contactnumbervalidator]'
})
export class ContactNumberValidator {
  
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^234[0-9]{11}/);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event) {
      
    // Allow Backspace, tab, end, and home keys
    if(event.code==='Minus'){
      event.preventDefault();
      return false;
    }

    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    
    if(current === ''){
        return true;
    }
    if ( !String(current).match(this.regex)) {
        
      event.preventDefault();
    }
  }
}