import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  adminLogin() {
    const adminUser = 'admin';       // Hardcoded admin username
    const adminPass = 'admin123';    // Hardcoded admin password

    if (this.username === adminUser && this.password === adminPass) {
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigate(['/user-complaints']); // Redirect to user-complaints page to see all complaints
    } else {
      this.errorMessage = 'Invalid admin credentials';
    }
  }
}
