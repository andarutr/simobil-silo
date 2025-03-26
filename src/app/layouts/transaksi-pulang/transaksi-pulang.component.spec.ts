import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaksiPulangComponent } from './transaksi-pulang.component';

describe('TransaksiPulangComponent', () => {
  let component: TransaksiPulangComponent;
  let fixture: ComponentFixture<TransaksiPulangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaksiPulangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransaksiPulangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
