import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngFireAuth: AngularFireAuth
  ) {}

 // Método para proteger rutas
  // Observable para verificar si el usuario está autenticado
  isAuthenticated$(): Observable<boolean> {
    return this.ngFireAuth.authState.pipe(map((user) => !!user));
  }
 // Método para proteger rutas
 async canActivate(): Promise<boolean> {
  try {
    const isAuthenticated = await this.authService.isAuthenticated(); // Verifica si el usuario está autenticado

    if (isAuthenticated) {
      return true; // Si está autenticado, permite el acceso
    } else {
      // Si no está autenticado, intenta iniciar sesión con Google
      try {
        await this.authService.loginWithGoogle(); // Intenta el inicio de sesión con Google
        return true; // Si el inicio de sesión es exitoso, permite el acceso
      } catch (error) {
        console.error('Usuario no autenticado, redirigiendo a /login');
        this.router.navigate(['/login']); // Redirige al login si no se logra la autenticación
        return false; // Bloquea el acceso
      }
    }
  } catch (error) {
    console.error('Error en la protección de la ruta:', error);
    this.router.navigate(['/login']); // Redirige al login en caso de error
    return false; // Bloquea el acceso
  }
}

  
}
