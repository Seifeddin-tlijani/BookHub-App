import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowDetailsComponent } from './borrow-details.component';

describe('BorrowDetailsComponent', () => {
  let component: BorrowDetailsComponent;
  let fixture: ComponentFixture<BorrowDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
