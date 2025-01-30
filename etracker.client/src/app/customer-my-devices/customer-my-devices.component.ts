import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface Device {
  id: number;
  name: string;
  imei: string;
  dateAdded: string;
}

@Component({
  selector: 'app-customer-my-devices',
  standalone: false,
  
  templateUrl: './customer-my-devices.component.html',
  styleUrl: './customer-my-devices.component.scss'
})
export class CustomerMyDevicesComponent {
  private email: string | null = localStorage.getItem('email');
  displayedColumns: string[] = ['id', 'name', 'imei', 'dateAdded', 'actions'];
  dataSource = new MatTableDataSource<Device>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.fetchDevices();
  }

  fetchDevices(): void {
    const url = `https://localhost:40443/api/customer/getdevices?Email=${this.email}`;
    this.http.get<Device[]>(url).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        this.openSnackbar('Failed to Fetch Devices!', 'error');
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Utility method to show snackbar notifications
  openSnackbar(message: string, severity: 'success' | 'error') {
    const snackBarClass = severity === 'success' ? 'snackbar-success' : 'snackbar-error';
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: snackBarClass,
    });
  }

  addDevice(): void {
    // Navigate to the add device page
    this.router.navigate(['/customer/add/device']);
  }

  trackDevice(device: Device): void {
    this.openSnackbar(`Tracking device: ${device.imei}`, 'success');
  }

  updateDevice(device: Device): void {
    localStorage.setItem('id', device.id.toString());
    this.router.navigate([`/customer/update/device`]);
  }

  deleteDevice(device: Device): void {
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      const url = `https://localhost:40443/api/customer/deletedevice/${device.id}`; // Append ID to the URL
      this.http
        .delete(url)
        .subscribe(
          () => {
            this.openSnackbar('Device deleted successfully!', 'success');
            this.router.navigate(['/customer/dashboard']);
          },
          () => {
            this.openSnackbar('Error deleting device. Please try again.', 'error');
          }
        );
    }
  }

  closeSnackbar() {
    this.snackBar.dismiss();
  }
}
