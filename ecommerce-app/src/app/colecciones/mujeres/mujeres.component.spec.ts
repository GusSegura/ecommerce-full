import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MujeresComponent } from './mujeres.component';

describe('MujeresComponent', () => {
  let component: MujeresComponent;
  let fixture: ComponentFixture<MujeresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MujeresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MujeresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
