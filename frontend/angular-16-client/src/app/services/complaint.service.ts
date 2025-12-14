import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = 'http://localhost:3005/api/complaints';

  constructor(private http: HttpClient) {}

  getComplaints(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getComplaintsByStudentID(studentID: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${studentID}`);
  }

  updateComplaint(id: string, updatedData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedData);
  }

  deleteComplaint(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  createComplaint(complaint: any): Observable<any> {
  return this.http.post<any>(this.apiUrl, complaint);
}
}
