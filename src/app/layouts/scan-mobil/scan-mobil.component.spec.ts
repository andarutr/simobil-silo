import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanMobilComponent } from './scan-mobil.component';

describe('ScanMobilComponent', () => {
  let component: ScanMobilComponent;
  let fixture: ComponentFixture<ScanMobilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanMobilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanMobilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
