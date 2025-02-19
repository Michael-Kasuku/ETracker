import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CustomerAuthService } from '../customer-auth/customer-auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export interface Device {
  id: number;
  name: string;
  imei: string;
  dateAdded: string;
}
@Component({
  selector: 'app-customer-dashboard',
  standalone: false,
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private email: string | null = localStorage.getItem('email');
  displayedColumns: string[] = ['id', 'name', 'imei', 'dateAdded', 'actions'];
  dataSource = new MatTableDataSource<Device>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroySubject = new Subject();
  isLoggedIn: boolean = false;
  activeTab: number = 0;  // Default to the first tab
  profileImage: string = '/img/etracker.png';  // Default profile image

  constructor(private authService: CustomerAuthService,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.email) {
      this.loadProfileImage(this.email);
    }
    this.fetchDevices();
  }

  fetchDevices(): void {
    const url = `https://laptoptracker-001-site1.qtempurl.com/api/customer/getdevices?Email=${this.email}`;
    this.http.get<Device[]>(url).subscribe({
      next: (data) => {
        this.dataSource.data = data.map(device => ({
          ...device,
          dateAdded: this.formatToEAT(device.dateAdded)
        }));
      },
      error: () => {
        this.openSnackbar('Failed to Fetch Devices!', 'error');
      }
    });
  }

  private formatToEAT(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Nairobi'
    }).format(date);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(["/customer/login"]);
  }

  goToProfile(): void {
    this.router.navigate(['/customer/my/profile']);
  }

  private loadProfileImage(email: string): void {
    const url = `https://laptoptracker-001-site1.qtempurl.com/api/account/getprofileimage?Email=${email}`;
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (response) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.profileImage = reader.result as string;
        };
        reader.readAsDataURL(response);
        this.openSnackbar('Profile Picture Loaded Successfully!', 'success');
      },
      (error) => {
        let errorMessage = 'Error loading profile image.';
        if (error.error instanceof Blob && error.error.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = () => {
            const errorData = JSON.parse(reader.result as string);
            errorMessage = errorData.message || errorMessage; // Ensure errorData.message exists
            this.openSnackbar(errorMessage, 'error');
          };
          reader.readAsText(error.error);
        } else {
          this.openSnackbar(errorMessage, 'error');
        }
        this.profileImage = '/img/etracker.png'; // Fallback to default image
      }
    );
  }

  addDevice(): void {
    // Navigate to the add device page
    this.router.navigate(['/customer/add/device']);
  }

  trackDevice(device: Device): void {
    localStorage.setItem('id', device.id.toString());
    localStorage.setItem('name', device.name);
    this.router.navigate([`/customer/track/device`]);
  }

  updateDevice(device: Device): void {
    localStorage.setItem('id', device.id.toString());
    localStorage.setItem('name', device.name);
    localStorage.setItem('imei', device.imei);
    this.router.navigate([`/customer/update/device`]);
  }

  deleteDevice(device: Device): void {
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      const url = `https://laptoptracker-001-site1.qtempurl.com/api/customer/deletedevice/${device.id}`; // Append ID to the URL
      this.http
        .delete(url)
        .subscribe(
          () => {
            this.openSnackbar('Device deleted successfully!', 'success');
            // Reload the current page to reflect changes
            window.location.reload();
          },
          () => {
            this.openSnackbar('Error deleting device. Please try again.', 'error');
          }
        );
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
