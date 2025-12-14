import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { IndexComponent } from './components/index/index.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserComplaintsComponent } from './components/user-complaints/user-complaints.component';
import { ViewComplaintsComponent } from './components/view-complaints/view-complaints.component';
import { StudentLoginComponent } from './components/student-login/student-login.component'; // ✅
import { AdminSelectionComponent } from './components/admin-selection/admin-selection.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { FeedbackPageComponent } from './components/feedback-page/feedback-page.component';
import { FeedbackAdminComponent } from './components/feedback-admin/feedback-admin.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ForumComponent } from './components/forum/forum.component';
import { EscalationComponent } from './components/escalation/escalation.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    AdminLoginComponent,
    RegisterComponent,
    UserComplaintsComponent,
    ViewComplaintsComponent,
    StudentLoginComponent,  // ✅ moved here, NOT in imports
    AdminSelectionComponent,
    FeedbackComponent,
    FeedbackPageComponent,
    FeedbackAdminComponent,
    ChatbotComponent,
    ForumComponent,
    EscalationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,          // ✅ needed for ngModel
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
