// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { initializeApp } from 'firebase/app'; 
import { provideFirebaseApp } from '@angular/fire/app'; 
import { getAuth, provideAuth } from '@angular/fire/auth'; 
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { firebaseConfig } from './app/firebase'; 
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';

const appConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()), 
    provideDatabase(() => getDatabase()),
    provideRouter(routes)
  ],
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));