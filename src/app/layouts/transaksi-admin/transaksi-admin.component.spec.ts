import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaksiAdminComponent } from './transaksi-admin.component';

describe('TransaksiAdminComponent', () => {
  let component: TransaksiAdminComponent;
  let fixture: ComponentFixture<TransaksiAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaksiAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransaksiAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
