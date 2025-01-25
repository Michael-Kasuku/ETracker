import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';

@Injectable({
  providedIn: 'root',
})
export class CustomerAuthService {
  private tokenKey: string = "token";
  private _authStatus = new BehaviorSubject<boolean>(false);
  public authStatus = this._authStatus.asObservable();

  constructor(protected http: HttpClient) { }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  }

  init(): void {
    if (this.isAuthenticated()) {
      this.setAuthStatus(true);
    }
  }

  login(item: LoginRequest): Observable<LoginResult> {
    const url = `https://localhost:40443/api/customer/login`;
    return this.http.post<LoginResult>(url, item).pipe(
      tap((loginResult) => {
        if (loginResult.success && loginResult.token) {
          localStorage.setItem(this.tokenKey, loginResult.token);
          localStorage.setItem('email', item.email); // Store the email in localStorage
          this.setAuthStatus(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey); // Remove the token
    localStorage.removeItem('email');      // Remove the email
    this.setAuthStatus(false);             // Update authentication status
  }

  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }
}
