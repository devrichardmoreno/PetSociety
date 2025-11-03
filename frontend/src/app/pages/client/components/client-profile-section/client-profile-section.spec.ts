import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientProfileSection } from './client-profile-section';

describe('ClientProfileSection', () => {
  let component: ClientProfileSection;
  let fixture: ComponentFixture<ClientProfileSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfileSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProfileSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

