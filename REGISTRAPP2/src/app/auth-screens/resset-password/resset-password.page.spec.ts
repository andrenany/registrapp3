import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RessetPasswordPage } from './resset-password.page';

describe('RessetPasswordPage', () => {
  let component: RessetPasswordPage;
  let fixture: ComponentFixture<RessetPasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RessetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
