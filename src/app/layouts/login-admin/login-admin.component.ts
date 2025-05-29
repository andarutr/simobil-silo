import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent {
  adminId: string = '';
  passwordAdmin: string = '';

  constructor(private router: Router) {}

  loginAdmin() {
    if (this.adminId === 'admin' && this.passwordAdmin === 'qwerty') {
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang, Admin!',
        timer: 1500,
        showConfirmButton: false
      });
      this.router.navigate(['/transaksi-admin']);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Admin ID atau Password salah.',
      });
      this.passwordAdmin = '';
    }
  }
}