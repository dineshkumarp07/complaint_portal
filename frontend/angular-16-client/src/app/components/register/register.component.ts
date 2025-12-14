import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Login Properties
  showLoginForm = true;
  loginStudentID = '';
  loginPassword = '';
  loginError = '';

  // Personal Information
  name = '';
  studentID = '';
  department = '';
  contactNumber = '';
  email = '';
  
  // Complaint Details
  complaint = '';
  title = '';
  category = '';
  priorityLevel = '';
  location = '';
  
  // Additional Information
  witnesses = '';
  previousComplaints = '';
  expectedResolution = '';
  
  // Form Settings
  isAnonymous = false;
  errorMessage = false;
  fileToUpload: File | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // Check if already logged in
    const studentId = localStorage.getItem('studentID');
    if (studentId) {
      this.studentID = studentId;
      this.showLoginForm = false; // Skip login if already logged in
    }
  }

  // Login method
  login() {
    this.loginError = '';

    if (!this.loginStudentID || !this.loginPassword) {
      this.loginError = 'Please enter Student ID and Password';
      return;
    }

    // Allow any username and password - bypass backend authentication
    localStorage.setItem('studentID', this.loginStudentID);
    this.studentID = this.loginStudentID;
    this.showLoginForm = false; // Show complaint form after login
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
    }
  }

  submitComplaint() {
    // Validation for required fields
    const requiredFields = [
      this.complaint,
      this.title,
      this.category,
      this.priorityLevel,
      this.location
    ];

    if (!this.isAnonymous) {
      requiredFields.push(
        this.name,
        this.studentID,
        this.department,
        this.contactNumber,
        this.email
      );
    }

    if (requiredFields.some(field => !field || field.trim() === '')) {
      this.errorMessage = true;
      return;
    }

    this.errorMessage = false;

    // Generate tracking code for anonymous complaints
    const trackingCode = this.isAnonymous ? this.generateTrackingCode() : null;

    const complaintData: any = {
      name: this.isAnonymous ? 'Anonymous' : this.name,
      studentID: this.isAnonymous ? trackingCode : this.studentID, // Use tracking code for anonymous
      department: this.isAnonymous ? 'N/A' : this.department,
      contactNumber: this.isAnonymous ? 'N/A' : this.contactNumber,
      email: this.isAnonymous ? 'N/A' : this.email,
      complaint: this.complaint,
      title: this.title,
      category: this.category,
      priority: this.priorityLevel,
      location: this.location,
      witnesses: this.witnesses || 'None',
      previousComplaints: this.previousComplaints || 'None',
      expectedResolution: this.expectedResolution || 'Not specified',
      submissionDate: new Date().toISOString(),
      status: 'Pending',
      isAnonymous: this.isAnonymous,
      trackingCode: trackingCode
    };

    this.http.post('http://localhost:3005/api/complaints', complaintData)
      .subscribe({
        next: (response: any) => {
          if (this.isAnonymous && trackingCode) {
            // Store tracking code for anonymous complaints
            this.storeAnonymousTrackingCode(trackingCode);
            
            const successMessage = `Complaint Registered Successfully!\n\nYour tracking code is: ${trackingCode}\n\nPlease save this code to view your complaint status later.`;
            alert(successMessage);
          } else {
            alert('Complaint Registered Successfully!');
          }
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to register complaint');
        }
      });
  }

  // Generate unique tracking code for anonymous complaints
  generateTrackingCode(): string {
    const adjectives = [
      'HAPPY', 'BRIGHT', 'SMART', 'QUICK', 'BRAVE', 'CALM', 'WISE', 'FAST',
      'BOLD', 'CLEAN', 'FRESH', 'GREEN', 'BLUE', 'RED', 'GOLD', 'SILVER',
      'SWIFT', 'SHARP', 'SMOOTH', 'WARM', 'COOL', 'LIGHT', 'DARK', 'TALL'
    ];
    
    const nouns = [
      'TIGER', 'EAGLE', 'LION', 'BEAR', 'WOLF', 'FOX', 'DEER', 'HAWK',
      'STAR', 'MOON', 'SUN', 'ROCK', 'TREE', 'RIVER', 'OCEAN', 'MOUNTAIN',
      'FLOWER', 'BIRD', 'FISH', 'SNAKE', 'HORSE', 'CAT', 'DOG', 'RABBIT'
    ];
    
    const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}-${randomNoun}-${numbers}`;
  }

  // Store anonymous tracking code in localStorage
  storeAnonymousTrackingCode(trackingCode: string) {
    const existingCodes = localStorage.getItem('anonymousTrackingCodes');
    let codes = existingCodes ? JSON.parse(existingCodes) : [];
    codes.push(trackingCode);
    localStorage.setItem('anonymousTrackingCodes', JSON.stringify(codes));
  }
}
