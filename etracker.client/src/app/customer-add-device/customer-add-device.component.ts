import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-add-device',
  standalone: false,
  
  templateUrl: './customer-add-device.component.html',
  styleUrl: './customer-add-device.component.css'
})
export class CustomerAddDeviceComponent {
  private email: string | null = localStorage.getItem('email');
  formData = {
    Name: '',
    IMEI: ''
  };

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  handleSubmit(event: Event) {
    event.preventDefault();

    if (!this.formData.Name || !this.formData.IMEI) {
      this.openSnackbar('All fields are required.', 'error');
      return;
    }

    if (!/^\d{15}$/.test(this.formData.IMEI)) {
      this.openSnackbar('IMEI must be exactly 15 digits.', 'error');
      return;
    }

    const url = `https://localhost:40443/api/customer/adddevice`;
    this.http
      .post(url, {
        Name: this.formData.Name,
        IMEI: this.formData.IMEI,
        Owner: this.email
      })
      .subscribe(
        () => {
          this.openSnackbar('Device added successfully!', 'success');
          this.router.navigate(['/customer/dashboard']);
        },
        () => {
          this.openSnackbar('Error adding device. Please try again.', 'error');
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
