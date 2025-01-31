import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-track-device',
  standalone: false,
  templateUrl: './customer-track-device.component.html',
  styleUrl: './customer-track-device.component.scss'
})
export class CustomerTrackDeviceComponent implements OnInit, AfterViewInit {
  private id: number | null = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!, 10) : null;
  private name: string | null = localStorage.getItem('name') || 'Device';
  private map: L.Map | null = null;

  constructor(private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.map = L.map('map', {
      center: [0, 0], // Centered on the world
      zoom: 2, // Default zoom level
      maxZoom: 19, // Allows zooming out up to level 19
      worldCopyJump: true // Enables seamless world panning
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize(); // Fixes centering issues
    }, 100);
  }

  goBack(): void {
    const confirmBack = window.confirm('Are you sure you want to go back to dashboard?');

    if (confirmBack) {
      // Navigate to the dashboard
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
