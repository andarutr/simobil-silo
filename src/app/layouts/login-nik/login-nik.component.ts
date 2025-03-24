import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Database, ref, get, child } from '@angular/fire/database';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-nik',
  templateUrl: './login-nik.component.html',
  styleUrls: ['./login-nik.component.css']
})
export class LoginNikComponent {
  nik: string = ''; 

  constructor(private router: Router, private database: Database) {}

  async login(nik: string) {
    const dbRef = ref(this.database);
    
    try {
      const snapshot = await get(child(dbRef, 'sms_driver'));
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userExists = Object.values(users).some((user: any) => user.nik === nik);
        
        if (userExists) {
          this.router.navigate(['/home']); 
        } else {
          Swal.fire("Gagal", "NIK tidak terdaftar di sistem!", "error"); 
        }
      } else {
        Swal.fire("Gagal", "NIK tidak terdaftar di sistem!", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan saat memeriksa NIK!", "error");
    }
  }
}