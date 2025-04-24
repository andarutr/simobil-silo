import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

interface Transaction {
  id: string;
  mulai_psg_to_pas: string;
}

@Component({
  selector: 'app-transaksi-pulang',
  imports: [],
  templateUrl: './transaksi-pulang.component.html',
  styleUrl: './transaksi-pulang.component.css'
})


export class TransaksiPulangComponent {
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
  goBack(){
    if (this.id && this.nik && this.nama) {
      this.router.navigate(['/home'], { 
        queryParams: { 
          id: this.id,    
          nik: this.nik,   
          nama: this.nama  
        } 
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Tidak dapat kembali: id, nik, atau nama tidak tersedia.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  async gotoTransaction() {
    const dbRef = ref(this.database, `sms_transaction/${this.id}`);

    try {
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const transactionData = {
                mulai_psg_to_pas: moment().format("HH:mm")
            };

            await update(dbRef, transactionData);
            
            Swal.fire({
                title: "Sukses",
                text: "Data berhasil diperbarui!",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigate(['/gohome'], { queryParams: { id: this.id, nik: this.nik, nama: this.nama } });
                }
            });
        } else {
            Swal.fire("Error", "Tidak ada transaksi ditemukan!", "error");
        }
    } catch (error) {
        console.error("Error updating transaction:", error);
        Swal.fire("Error", "Terjadi kesalahan: " + (error instanceof Error ? error.message : "Unknown error"), "error");
    }
  }
}
