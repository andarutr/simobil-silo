import { Component, OnInit } from '@angular/core';
import { Database, ref, get, child } from '@angular/fire/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  smsDrivers: any[] = [];

  constructor(private db: Database) {
    initializeApp(firebaseConfig);
  }

  ngOnInit(): void {
    this.getSmsDrivers();
  }

  getSmsDrivers() {
    const dbRef = ref(this.db);
    get(child(dbRef, 'sms_driver')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.smsDrivers = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }
}