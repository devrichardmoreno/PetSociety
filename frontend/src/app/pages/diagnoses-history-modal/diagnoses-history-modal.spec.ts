import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosesHistoryModal } from './diagnoses-history-modal';

describe('DiagnosesHistoryModal', () => {
  let component: DiagnosesHistoryModal;
  let fixture: ComponentFixture<DiagnosesHistoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosesHistoryModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosesHistoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
