import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-update-device',
  standalone: false,
  
  templateUrl: './customer-update-device.component.html',
  styleUrl: './customer-update-device.component.css'
})
export class CustomerUpdateDeviceComponent {
  private id: number | null = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!, 10) : null;
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

    const url = `https://localhost:40443/api/customer/updatedevice`;
    this.http
      .put(url, {
        Id: this.id, // Ensure ID is included in the request body
        Name: this.formData.Name,
        IMEI: this.formData.IMEI
      })
      .subscribe(
        () => {
          this.openSnackbar('Device updated successfully!', 'success');
          this.router.navigate(['/customer/dashboard']);
          localStorage.removeItem('id'); // Remove ID after updating
        },
        () => {
          this.openSnackbar('Error updating device. Please try again.', 'error');
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
