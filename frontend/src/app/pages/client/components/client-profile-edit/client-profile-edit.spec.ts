import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientProfileEdit } from './client-profile-edit';

describe('ClientProfileEdit', () => {
  let component: ClientProfileEdit;
  let fixture: ComponentFixture<ClientProfileEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfileEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProfileEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

