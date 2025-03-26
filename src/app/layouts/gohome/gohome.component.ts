import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-gohome',
  imports: [],
  templateUrl: './gohome.component.html',
  styleUrl: './gohome.component.css'
})
export class GohomeComponent {
  id: string | null = null;
  nik: string | null = null;
  nama: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private database: Database) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.nik = params['nik'];
      this.nama = params['nama'];
    });
  }

  gotoSudah(){
    window.location.href = "http://172.21.5.95/sms/driver/transaksi-pulang/"+this.id;
  }
}
