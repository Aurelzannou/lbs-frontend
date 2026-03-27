import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NiveauFormDialogComponent } from './niveau-form-dialog.component';

describe('NiveauFormDialogComponent', () => {
  let component: NiveauFormDialogComponent;
  let fixture: ComponentFixture<NiveauFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NiveauFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NiveauFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
