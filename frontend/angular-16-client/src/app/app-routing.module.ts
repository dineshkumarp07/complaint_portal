import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { UserComplaintsComponent } from './components/user-complaints/user-complaints.component';
import { ViewComplaintsComponent } from './components/view-complaints/view-complaints.component';
import { StudentLoginComponent } from './components/student-login/student-login.component';
import { AuthGuard } from './auth.guard';
import { AdminSelectionComponent } from './components/admin-selection/admin-selection.component';
import { FeedbackPageComponent } from './components/feedback-page/feedback-page.component';
import { FeedbackAdminComponent } from './components/feedback-admin/feedback-admin.component';
import { ForumComponent } from './components/forum/forum.component';
import { EscalationComponent } from './components/escalation/escalation.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'student-login', component: StudentLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminSelectionComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'user-complaints', component: UserComplaintsComponent },
  { path: 'view-complaints', component: ViewComplaintsComponent },
  { path: 'feedback', component: FeedbackPageComponent },
  { path: 'feedback-admin', component: FeedbackAdminComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'escalation', component: EscalationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }