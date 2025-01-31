import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-add-device',
  standalone: false,
  templateUrl: './customer-add-device.component.html',
  styleUrls: ['./customer-add-device.component.scss']
})
export class CustomerAddDeviceComponent {
  private email: string | null = localStorage.getItem('email');
  formData = {
    Name: '',
    IMEI: ''
  };

  loading = false;  // Add loading property for progress bar

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  handleSubmit(event: Event) {
    event.preventDefault();

    // Validate form fields
    if (!this.formData.Name || !this.formData.IMEI) {
      this.openSnackbar('All fields are required.', 'error');
      return;
    }

    if (!/^\d{15}$/.test(this.formData.IMEI)) {
      this.openSnackbar('IMEI must be exactly 15 digits.', 'error');
      return;
    }

    // Show progress bar
    this.loading = true;

    const url = `https://localhost:40443/api/customer/adddevice`;
    this.http
      .post(url, {
        Name: this.formData.Name,
        IMEI: this.formData.IMEI,
        Owner: this.email
      })
      .subscribe(
        () => {
          // Hide progress bar
          this.loading = false;
          this.openSnackbar('Device added successfully!', 'success');
          this.router.navigate(['/customer/dashboard']);
        },
        () => {
          // Hide progress bar and show error
          this.loading = false;
          this.openSnackbar('Error adding device. Please try again.', 'error');
        }
      );
  }

  onCancel(): void {
    const confirmCancel = window.confirm('Are you sure you want to cancel?');

    if (confirmCancel) {
      // Navigate to the dashboard
      this.router.navigate(['/customer/dashboard']);
    }
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
