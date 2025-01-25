import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { CustomerAuthService } from './customer-auth/customer-auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private authService: CustomerAuthService) { } // Inject Router and Auth service
  ngOnInit(): void {
    this.authService.init();
  }

  // Use the Router service to navigate between routes
  navigateTo(route: string): void {
    this.router.navigate([route]); // Navigate using the router
  }
}
