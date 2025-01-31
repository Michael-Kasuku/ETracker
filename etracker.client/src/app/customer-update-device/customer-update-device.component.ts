import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-update-device',
  standalone: false,
  templateUrl: './customer-update-device.component.html',
  styleUrls: ['./customer-update-device.component.scss']
})
export class CustomerUpdateDeviceComponent {
  private id: number | null = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!, 10) : null;
  private name: string | null = localStorage.getItem('name');
  private imei: string | null = localStorage.getItem('imei');
  formData = {
    Name: this.name,
    IMEI: this.imei
  };
  loading = false;

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

    if (!this.id) {
      this.openSnackbar('Invalid device ID.', 'error');
      return;
    }

    const url = `https://localhost:40443/api/customer/updatedevice`;
    this.loading = true;

    this.http.put(url, {
      Id: this.id,
      Name: this.formData.Name,
      IMEI: this.formData.IMEI
    }).subscribe(
      () => {
        this.openSnackbar('Device updated successfully!', 'success');
        this.router.navigate(['/customer/dashboard']);
        localStorage.removeItem('id');
        localStorage.removeItem('name');
        localStorage.removeItem('imei');
        this.loading = false;
      },
      (error) => {
        const errorMessage = error.error?.message || 'Error updating device. Please try again.';
        this.openSnackbar(errorMessage, 'error');
        this.loading = false;
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

  onCancel(): void {
    const confirmCancel = window.confirm('Are you sure you want to cancel?');

    if (confirmCancel) {
      // Navigate to the dashboard
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
