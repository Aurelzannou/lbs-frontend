import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapeFormDialogComponent } from './etape-form-dialog.component';

describe('EtapeFormDialogComponent', () => {
  let component: EtapeFormDialogComponent;
  let fixture: ComponentFixture<EtapeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapeFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtapeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
