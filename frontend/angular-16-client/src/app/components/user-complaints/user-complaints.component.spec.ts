import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserComplaintsComponent } from './user-complaints.component';

describe('UserComplaintsComponent', () => {
  let component: UserComplaintsComponent;
  let fixture: ComponentFixture<UserComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComplaintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
