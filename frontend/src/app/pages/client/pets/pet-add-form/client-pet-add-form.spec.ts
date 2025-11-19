import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientPetAddForm } from './client-pet-add-form';

describe('ClientPetAddForm', () => {
  let component: ClientPetAddForm;
  let fixture: ComponentFixture<ClientPetAddForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPetAddForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPetAddForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

