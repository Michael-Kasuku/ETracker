import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CustomerSignupComponent } from './customer-signup/customer-signup.component';
import { CustomerForgotPasswordComponent } from './customer-forgot-password/customer-forgot-password.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { CustomerMyProfileComponent } from './customer-my-profile/customer-my-profile.component';

import { CustomerAuthGuard } from './customer-auth/customer-auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'privacy/policy', component: PrivacyPolicyComponent },
  { path: 'terms/of/service', component: TermsOfServiceComponent },
  { path: 'customer/login', component: CustomerLoginComponent },
  { path: 'customer/signup', component: CustomerSignupComponent },
  { path: 'customer/forgot/password', component: CustomerForgotPasswordComponent },
  { path: 'customer/dashboard', component: CustomerDashboardComponent, canActivate: [CustomerAuthGuard] },
  { path: 'customer/myprofile', component: CustomerMyProfileComponent, canActivate: [CustomerAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
