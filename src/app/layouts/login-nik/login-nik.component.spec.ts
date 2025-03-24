import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginNikComponent } from './login-nik.component';

describe('LoginNikComponent', () => {
  let component: LoginNikComponent;
  let fixture: ComponentFixture<LoginNikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginNikComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginNikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
