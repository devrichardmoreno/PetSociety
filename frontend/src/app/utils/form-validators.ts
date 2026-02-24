import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

/**
 * Validador asíncrono para verificar si el username ya existe
 */
export function usernameExistsValidator(checkUsernameFn: (username: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const username = control.value.trim();
    
    // Esperar 500ms antes de hacer la validación (debounce)
    return timer(500).pipe(
      switchMap(() => 
        checkUsernameFn(username).pipe(
          map(exists => exists ? { usernameExists: true } : null),
          catchError(() => of(null)) // En caso de error, no bloquear el formulario
        )
      )
    );
  };
}

/**
 * Validador asíncrono para verificar si el DNI ya existe
 */
export function dniExistsValidator(checkDniFn: (dni: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.toString().trim() === '') {
      return of(null);
    }

    const dni = control.value.toString().trim();
    
    // Esperar 500ms antes de hacer la validación (debounce)
    return timer(500).pipe(
      switchMap(() => 
        checkDniFn(dni).pipe(
          map(exists => exists ? { dniExists: true } : null),
          catchError(() => of(null)) // En caso de error, no bloquear el formulario
        )
      )
    );
  };
}

/**
 * Validador asíncrono para verificar si el email ya existe
 */
export function emailExistsValidator(checkEmailFn: (email: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const email = control.value.trim();
    
    // Esperar 500ms antes de hacer la validación (debounce)
    return timer(500).pipe(
      switchMap(() => 
        checkEmailFn(email).pipe(
          map(exists => exists ? { emailExists: true } : null),
          catchError(() => of(null)) // En caso de error, no bloquear el formulario
        )
      )
    );
  };
}

/**
 * Validador asíncrono para verificar si el teléfono ya existe
 */
export function phoneExistsValidator(checkPhoneFn: (phone: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.toString().trim() === '') {
      return of(null);
    }

    const phone = control.value.toString().trim();
    
    // Esperar 500ms antes de hacer la validación (debounce)
    return timer(500).pipe(
      switchMap(() => 
        checkPhoneFn(phone).pipe(
          map(exists => exists ? { phoneExists: true } : null),
          catchError(() => of(null)) // En caso de error, no bloquear el formulario
        )
      )
    );
  };
}

/**
 * Validador asíncrono: DNI ya existe en otro usuario (excluye un valor, ej. el DNI actual del usuario al editar)
 */
export function dniExistsExceptValidator(
  checkDniFn: (dni: string) => Observable<boolean>,
  getExcludeDni: () => string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.toString().trim() === '') {
      return of(null);
    }
    const dni = control.value.toString().trim();
    const exclude = (getExcludeDni() || '').trim();
    if (exclude && dni === exclude) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() =>
        checkDniFn(dni).pipe(
          map(exists => exists ? { dniExists: true } : null),
          catchError(() => of(null))
        )
      )
    );
  };
}

/**
 * Validador asíncrono: teléfono ya existe en otro usuario (excluye un valor)
 */
export function phoneExistsExceptValidator(
  checkPhoneFn: (phone: string) => Observable<boolean>,
  getExcludePhone: () => string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.toString().trim() === '') {
      return of(null);
    }
    const phone = control.value.toString().trim();
    const exclude = (getExcludePhone() || '').trim();
    if (exclude && phone === exclude) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() =>
        checkPhoneFn(phone).pipe(
          map(exists => exists ? { phoneExists: true } : null),
          catchError(() => of(null))
        )
      )
    );
  };
}

/**
 * Validador asíncrono: email ya existe en otro usuario (excluye un valor)
 */
export function emailExistsExceptValidator(
  checkEmailFn: (email: string) => Observable<boolean>,
  getExcludeEmail: () => string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }
    const email = control.value.trim();
    const exclude = (getExcludeEmail() || '').trim();
    if (exclude && email === exclude) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() =>
        checkEmailFn(email).pipe(
          map(exists => exists ? { emailExists: true } : null),
          catchError(() => of(null))
        )
      )
    );
  };
}

/**
 * Validador para nombres y apellidos: solo letras, espacios, ñ y tildes
 */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Dejamos que Validators.required maneje el caso vacío
    }

    const value = control.value.trim();
    // Permite letras (incluyendo ñ y caracteres con tilde), espacios y guiones
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
    
    if (!namePattern.test(value)) {
      return { invalidName: true };
    }

    return null;
  };
}

/**
 * Validador para teléfono: solo números, entre 9 y 20 caracteres
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Dejamos que Validators.required maneje el caso vacío
    }

    const value = control.value.toString().trim();
    // Solo números
    const phonePattern = /^\d+$/;
    
    if (!phonePattern.test(value)) {
      return { invalidPhone: true };
    }

    if (value.length < 9 || value.length > 20) {
      return { invalidPhoneLength: true };
    }

    return null;
  };
}

/**
 * Validador para DNI: solo números, 7 u 8 caracteres
 */
export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Dejamos que Validators.required maneje el caso vacío
    }

    const value = control.value.toString().trim();
    // Solo números
    const dniPattern = /^\d+$/;
    
    if (!dniPattern.test(value)) {
      return { invalidDni: true };
    }

    if (value.length !== 7 && value.length !== 8) {
      return { invalidDniLength: true };
    }

    return null;
  };
}

