import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-login',
  templateUrl: './student-login.component.html',
  styleUrls: ['./student-login.component.css']
})
export class StudentLoginComponent {
  studentID: string = '';
  password: string = '';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.error = '';

    if (!this.studentID || !this.password) {
      this.error = 'Please enter Student ID and Password';
      return;
    }

    this.http.post<any>('http://localhost:3005/api/student/login', {
      studentID: this.studentID,
      password: this.password
    }).subscribe({
      next: (res) => {
        alert(res.message);
        localStorage.setItem('studentID', res.studentID); // store login session
        this.router.navigate(['/register-complaint']);
      },
      error: (err) => {
        this.error = err.error.message || 'Login failed';
      }
    });
  }
}
