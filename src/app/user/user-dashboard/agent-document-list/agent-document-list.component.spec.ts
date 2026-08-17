import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDocumentListComponent } from './agent-document-list.component';

describe('AgentDocumentListComponent', () => {
  let component: AgentDocumentListComponent;
  let fixture: ComponentFixture<AgentDocumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentDocumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
