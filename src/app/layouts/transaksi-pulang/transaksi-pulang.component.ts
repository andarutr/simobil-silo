import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Database, ref, get, update } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-transaksi-pulang',
  imports: [CommonModule],
  templateUrl: './transaksi-pulang.component.html',
  styleUrl: './transaksi-pulang.component.css'
})

export class TransaksiPulangComponent {
  id: string | null = null;
  nik: string | null = null;
  nama: string | null = null;
  smsTransactionKey: string | null = null;
  smsHistoryKey: string | null = null;
  sudahJalan: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private database: Database) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.nik = params['nik'];
      this.nama = params['nama'];

      this.checkTransaction();
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

  async checkTransaction() {
      const dbRef = ref(this.database, `sms_transaction/${this.id}`);
  
      try {
        const snapshot = await get(dbRef);
  
        if (snapshot.exists()) {
          const transaction = snapshot.val();
          this.sudahJalan = false; 
  
          if (transaction.mulai_psg_to_pas !== '-' && transaction.tiba_pas_to_psg !== '-') {
            this.sudahJalan = true; 
          }
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
        Swal.fire({
          title: 'Error',
          text: 'Terjadi kesalahan saat memeriksa transaksi.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }

  async updateStartTransaction() {
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
              this.sudahJalan = false;
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

  async updateEndTransaction() {
    const dbRef = ref(this.database, 'sms_transaction');
        
    try {
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
          const transactions = snapshot.val();
          let transactionToUpdate = null;
          let transactionKey = null;

          for (const key in transactions) {
              if (key === this.id) {
                  transactionToUpdate = transactions[key];
                  transactionKey = key;
                  break;
              }
          }

          if (transactionToUpdate) {
              const startTime = moment(transactionToUpdate.mulai_psg_to_pas, "HH:mm");
              const endTime = moment();
              const duration = endTime.diff(startTime, 'minutes');

              const transactionData = {
                  tiba_psg_to_pas: endTime.format("HH:mm"), 
                  durasi_psg_to_pas: `${duration} menit` 
              };

              const transactionRef = ref(this.database, `sms_transaction/${transactionKey}`);
              await update(transactionRef, transactionData);
              
              Swal.fire({
                  title: "Sukses",
                  text: "Data berhasil diperbarui!",
                  icon: "success",
                  confirmButtonText: "OK",
                  allowOutsideClick: false
              }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigate(['/thanks']);
                  }
              });
          } else {
              Swal.fire("Error", "Transaksi tidak ditemukan!", "error");
          }
      } else {
          Swal.fire("Error", "Tidak ada transaksi ditemukan!", "error");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      Swal.fire("Error", "Terjadi kesalahan: " + (error instanceof Error ? error.message : "Unknown error"), "error");
    }
  }
}
