import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-nik',
  imports: [],
  templateUrl: './login-nik.component.html',
  styleUrl: './login-nik.component.css'
})
export class LoginNikComponent {
  nik: string = ''; 

  constructor(private router: Router) {}

  login(nik: string) {
    if (nik == '105000464') {
      this.router.navigate(['/home']); 
    } else {
      Swal.fire("Gagal","NIK tidak valid!","error"); 
    }
  }
}
