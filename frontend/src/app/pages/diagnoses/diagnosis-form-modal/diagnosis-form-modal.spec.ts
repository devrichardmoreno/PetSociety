import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagnosisFormModal } from './diagnosis-form-modal';


describe('DiagnosisFormModal', () => {
  let component: DiagnosisFormModal;
  let fixture: ComponentFixture<DiagnosisFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosisFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
