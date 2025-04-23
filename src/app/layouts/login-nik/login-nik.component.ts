import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Database, ref, get, child } from '@angular/fire/database';
import Swal from 'sweetalert2';

interface User {
  nik: string;
  nama: string;
}

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
        const users = snapshot.val() as Record<string, User>;
        const userExists = Object.values(users).find((user: any) => user.nik === nik);

        if (userExists) {
          const nama = userExists.nama;
          this.router.navigate(['/scan-mobil'], { queryParams: { nik: nik, nama: nama } }); 
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