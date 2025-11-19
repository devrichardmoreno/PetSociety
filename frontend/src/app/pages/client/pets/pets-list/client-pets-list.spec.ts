import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientPetsList } from './client-pets-list';

describe('ClientPetsList', () => {
  let component: ClientPetsList;
  let fixture: ComponentFixture<ClientPetsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPetsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPetsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

