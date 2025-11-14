import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDoctor } from './create-doctor';

describe('CreateDoctor', () => {
  let component: CreateDoctor;
  let fixture: ComponentFixture<CreateDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDoctor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDoctor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
