import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-forgot-password',
  standalone: false,
  templateUrl: './customer-forgot-password.component.html',
  styleUrls: ['./customer-forgot-password.component.scss'],
})
export class CustomerForgotPasswordComponent {
  formData = {
    Email: ''
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  handlePasswordReset(event: Event) {
    event.preventDefault();

    // Basic Validation
    if (!this.formData.Email) {
      this.openSnackbar('Email address is required.', 'error');
      return;
    }

    // HTTP Request for Password Reset
    this.http.post('https://localhost:40443/api/vet/forgotpassword', {
      Email: this.formData.Email
    })
      .subscribe(
        (response: any) => {
          this.openSnackbar('Password Reset Link has been sent to your email!', 'success');
        },
        (error) => {
          // Handle error response
          if (error.error && error.error.message) {
            this.openSnackbar(error.error.message, 'error');
          } else {
            this.openSnackbar('Password Reset Link couldn\'t be sent to your email!', 'error');
          }
        }
      );
  }

  openSnackbar(message: string, severity: 'success' | 'error') {
    const snackBarClass = severity === 'success' ? 'snackbar-success' : 'snackbar-error';
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: snackBarClass,
    });
  }

  closeSnackbar() {
    this.snackBar.dismiss();
  }
}
