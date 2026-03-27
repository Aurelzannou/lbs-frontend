import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapeListComponent } from './etape-list.component';

describe('EtapeListComponent', () => {
  let component: EtapeListComponent;
  let fixture: ComponentFixture<EtapeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtapeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
