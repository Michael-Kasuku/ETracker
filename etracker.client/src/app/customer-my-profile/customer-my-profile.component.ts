import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-my-profile',
  standalone: false,
  templateUrl: './customer-my-profile.component.html',
  styleUrl: './customer-my-profile.component.scss'
})
export class CustomerMyProfileComponent {
  profileForm: FormGroup;
  profilePicturePreview: string | ArrayBuffer | null = null;
  isUpdating = false; // Track update status

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
    this.profileForm = this.fb.group({
      profilePicture: [null, Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Ensure fileExtension is a string and not undefined
      const fileExtension = file.name.split('.').pop();

      // If fileExtension is undefined, show an error message
      if (!fileExtension) {
        this.openSnackbar('Invalid file type. The file does not have an extension.', 'error');
        return;
      }

      // Convert to lowercase for case-insensitive comparison
      const fileExtensionLower = fileExtension.toLowerCase();

      // Check if the file extension is one of the allowed types
      if (!['png', 'jpg', 'jpeg', 'jfif'].includes(fileExtensionLower)) {
        this.openSnackbar('Invalid file type. Only .png, .jpg, .jpeg, .jfif images are allowed.', 'error');
        return;
      }

      // Check for file size limit
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.openSnackbar('File size exceeds 10MB limit.', 'error');
        return;
      }

      this.profileForm.patchValue({ profilePicture: file });
      this.profileForm.get('profilePicture')?.updateValueAndValidity();

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => (this.profilePicturePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdating = true; // Show progress bar

      const url = `https://laptoptracker-001-site1.qtempurl.com/api/account/updateprofile`;
      const formData = new FormData();

      formData.append('Email', localStorage.getItem('email') || '');
      const fileInput = this.profileForm.get('profilePicture')?.value;
      if (fileInput instanceof File) {
        formData.append('ProfilePicture', fileInput);
      }

      this.http.put(url, formData).subscribe(
        () => {
          this.openSnackbar('Profile Picture Updated Successfully!', 'success');
          setTimeout(() => {
            this.isUpdating = false; // Hide progress bar
            this.router.navigate(['/customer/dashboard']);
          }, 1000);
        },
        (error) => {
          this.isUpdating = false; // Hide progress bar on error
          const errorMessage = error?.error?.message || 'Error in Updating Profile. Please try again.';
          this.openSnackbar(errorMessage, 'error');
        }
      );
    }
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
