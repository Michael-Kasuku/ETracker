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

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
    this.profileForm = this.fb.group({
      profilePicture: [null, Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'png') {
        this.openSnackbar('Invalid file type. Only .png images are allowed.', 'error');
        return;
      }

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
      const url = `https://localhost:40443/api/account/updateprofile`;
      const formData = new FormData();

      // Add the email and profile picture to the FormData object
      formData.append('Email', localStorage.getItem('email') || '');
      const fileInput = this.profileForm.get('profilePicture')?.value;
      if (fileInput instanceof File) {
        formData.append('ProfilePicture', fileInput);
      }

      this.http.put(url, formData).subscribe(
        () => {
          this.openSnackbar('Profile Picture Updated Successfully!', 'success');
          // Redirect to the dashboard
          this.router.navigate(['/customer/dashboard']);
        },
        (error) => {
          const errorMessage = error?.error?.message || 'Error in Updating Profile. Please try again.';
          this.openSnackbar(errorMessage, 'error');
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
