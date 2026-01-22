import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteTemporadaComponent } from './reporte-temporada.component';

describe('ReporteTemporadaComponent', () => {
  let component: ReporteTemporadaComponent;
  let fixture: ComponentFixture<ReporteTemporadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteTemporadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteTemporadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
