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
  private marker: L.Marker | null = null;
  private accuracyCircle: L.Circle | null = null;
  private polyline: L.Polyline = L.polyline([], { color: 'blue', weight: 4 });
  private watchId: number | null = null;
  private lastUpdate: number = 0;

  public isOnline: boolean = navigator.onLine;
  public currentDate: string = new Date().toLocaleDateString();
  public locationName: string = "Fetching location...";

  constructor(private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    setInterval(() => {
      this.currentDate = new Date().toLocaleDateString();
    }, 1000);
  }

  ngAfterViewInit() {
    this.map = L.map('map', {
      center: [0.2834, 34.7519],
      zoom: 16,
      maxZoom: 19,
      worldCopyJump: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.polyline);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    this.trackLocation();
  }

  trackLocation() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (Date.now() - this.lastUpdate < 3000) return;
          this.lastUpdate = Date.now();

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const speed = (position.coords.speed || 0).toFixed(2);
          const heading = position.coords.heading ? position.coords.heading.toFixed(2) : 'N/A';
          const time = new Date().toLocaleTimeString();

          // Fetch location name
          this.getLocationName(lat, lng, speed, heading, time);

          const popupContent = `<b>${this.name}</b><br>Speed: ${speed} m/s<br>Heading: ${heading}°<br>Time: ${time}
                                <br>Location: ${this.locationName}<br><b>Status: ${this.isOnline ? 'Online' : 'Offline'}</b><br><b>Date: ${this.currentDate}</b>`;

          if (!this.marker) {
            this.marker = L.marker([lat, lng], {
              draggable: false,
              title: this.name!,
            }).bindPopup(popupContent).addTo(this.map!);
          } else {
            this.marker.setLatLng([lat, lng]).bindPopup(popupContent);
          }

          if (this.accuracyCircle) this.map?.removeLayer(this.accuracyCircle);
          this.accuracyCircle = L.circle([lat, lng], {
            radius: position.coords.accuracy,
            color: 'blue',
            fillOpacity: 0.2,
          }).addTo(this.map!);

          this.polyline.addLatLng([lat, lng]);
          this.map?.setView([lat, lng], 16);

          localStorage.setItem('lastLocation', JSON.stringify({ lat, lng }));
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.snackBar.open('Location access denied. Enable GPS.', 'Close', { duration: 5000 });
              break;
            case error.POSITION_UNAVAILABLE:
              this.snackBar.open('Location unavailable. Try again later.', 'Close', { duration: 5000 });
              break;
            case error.TIMEOUT:
              this.snackBar.open('Location request timed out.', 'Close', { duration: 5000 });
              break;
            default:
              this.snackBar.open('An unknown error occurred.', 'Close', { duration: 5000 });
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      this.snackBar.open('Geolocation is not supported by your browser.', 'Close', {
        duration: 5000,
      });
    }
  }

  getLocationName(lat: number, lng: number, speed: string, heading: string, time: string) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(response => response.json())
      .then(data => {
        this.locationName = data.display_name || 'Unknown Location';

        if (this.marker) {
          const popupContent = `<b>${this.name}</b><br>Speed: ${speed} m/s<br>Heading: ${heading}°<br>Time: ${time}
                              <br>Location: ${this.locationName}<br><b>Status: ${this.isOnline ? 'Online' : 'Offline'}</b><br><b>Date: ${this.currentDate}</b>`;
          this.marker.bindPopup(popupContent).openPopup();
        }
      })
      .catch(() => {
        this.locationName = 'Location not found';
      });
  }

  updateOnlineStatus() {
    this.isOnline = navigator.onLine;
  }

  goBack(): void {
    const confirmBack = window.confirm('Are you sure you want to go back to dashboard?');
    if (confirmBack) {
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
