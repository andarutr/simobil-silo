// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment'; // Pastikan Anda memiliki file environment
import { initializeApp } from 'firebase/app';
import { getAuth, provideAuth } from 'firebase/auth';
import { getDatabase, provideDatabase } from 'firebase/database';
import { provideFirebaseApp } from '@angular/fire'; // Pastikan ini diimpor dari @angular/fire

// Inisialisasi Firebase
const firebaseApp = initializeApp(environment.firebase);

const appConfig = {
  providers: [
    provideFirebaseApp(() => firebaseApp), // Inisialisasi Firebase
    provideAuth(() => getAuth(firebaseApp)), // Inisialisasi Auth
    provideDatabase(() => getDatabase(firebaseApp)), // Inisialisasi Database
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));