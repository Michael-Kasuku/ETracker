import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { CustomerAuthService } from './customer-auth.service';

export const CustomerAuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService: CustomerAuthService = inject(CustomerAuthService);
  const router: Router = inject(Router);

  // Check if the user is authenticated
  if (authService.isAuthenticated()) {
    return true; // Allow access
  }

  // Redirect to the login page with a query parameter for the original URL
  router.navigate(['/customer/login'], {
    queryParams: { redirectTo: state.url },
  });

  return false; // Deny access
};
