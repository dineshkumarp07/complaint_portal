import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-16-crud-example';
  isNavOpen = false;
  currentRoute = '';
  loggedInLabel: string | null = null;

  constructor(private router: Router) {
    // Listen to route changes to detect current page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      this.refreshLoggedInLabel();
    });
  }

  ngOnInit() {
    // Ensure navigation starts completely closed on mobile
    this.isNavOpen = false;
    console.log('Component initialized - Navigation closed');
    console.log('isNavOpen value:', this.isNavOpen);
    
    // Set initial page state
    this.currentRoute = this.router.url;
    this.refreshLoggedInLabel();
  }

  toggleNav() {
    console.log('=== TOGGLE NAV CLICKED ===');
    console.log('Before toggle - isNavOpen:', this.isNavOpen);
    this.isNavOpen = !this.isNavOpen;
    console.log('After toggle - isNavOpen:', this.isNavOpen);
    console.log('Navigation should now be:', this.isNavOpen ? 'OPEN' : 'CLOSED');
  }

  closeNav() {
    console.log('=== CLOSE NAV CLICKED ===');
    console.log('Before close - isNavOpen:', this.isNavOpen);
    this.isNavOpen = false;
    console.log('After close - isNavOpen:', this.isNavOpen);
  }

  // Close navigation when clicking outside
  onOutsideClick() {
    if (this.isNavOpen) {
      console.log('Outside click detected - closing navigation');
      this.closeNav();
    }
  }

  // Go back to home page
  goHome() {
    console.log('Back button clicked - navigating to home');
    this.router.navigate(['/']);
    this.closeNav(); // Close the side navigation if open
  }

  // Get current page title for display
  getCurrentPageTitle(): string {
    switch (this.currentRoute) {
      case '/register':
        return 'Register Complaint';
      case '/user-complaints':
        return 'My Complaints';
      case '/admin-login':
        return 'Admin Login';
      case '/view-complaints':
        return 'Admin Dashboard';
      default:
        return 'Complaint System';
    }
  }

  get isHomePage(): boolean {
    return this.router.url === '/'; // adjust if your home route is different
  }

  private refreshLoggedInLabel(): void {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    const isStudent = localStorage.getItem('studentLoggedIn') === 'true';
    if (isAdmin) {
      const adminUsername = localStorage.getItem('adminUsername') || 'admin';
      this.loggedInLabel = `Admin: ${adminUsername}`;
    } else if (isStudent) {
      const studentId = localStorage.getItem('studentID') || '';
      this.loggedInLabel = studentId ? `Student ID: ${studentId}` : 'Student';
    } else {
      this.loggedInLabel = null;
    }
  }

  logout(): void {
    localStorage.removeItem('studentLoggedIn');
    localStorage.removeItem('studentID');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    this.loggedInLabel = null;
    this.router.navigate(['/']);
  }
}