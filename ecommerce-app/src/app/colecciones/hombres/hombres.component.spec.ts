import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HombresComponent } from './hombres.component';

describe('HombresComponent', () => {
  let component: HombresComponent;
  let fixture: ComponentFixture<HombresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HombresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HombresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
