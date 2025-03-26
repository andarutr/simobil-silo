import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GohomeComponent } from './gohome.component';

describe('GohomeComponent', () => {
  let component: GohomeComponent;
  let fixture: ComponentFixture<GohomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GohomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GohomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
