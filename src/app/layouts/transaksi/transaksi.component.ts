import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

interface Transaction {
  id: string;
  mulai_pas_to_psg: string;
}

@Component({
  selector: 'app-transaksi',
  templateUrl: './transaksi.component.html',
  styleUrls: ['./transaksi.component.css']
})
export class TransaksiComponent {
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

  goBack() {
    this.router.navigate(['/home'], { queryParams: { nik: this.nik, nama: this.nama } });
  }

  async updateTransaction() {
    const dbRef = ref(this.database, 'sms_transaction');
    
    try {
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const transactions = snapshot.val();
            let transactionToUpdate = null;
            let transactionKey = null;

            for (const key in transactions) {
                if (transactions[key].sms_truck_history_id === this.id) {
                    transactionToUpdate = transactions[key];
                    transactionKey = key;
                    break;
                }
            }

            if (transactionToUpdate) {
                const startTime = moment(transactionToUpdate.mulai_pas_to_psg, "HH:mm");
                const endTime = moment();
                const duration = endTime.diff(startTime, 'minutes');

                const transactionData = {
                    tiba_pas_to_psg: endTime.format("HH:mm"), 
                    durasi_pas_to_psg: `${duration} menit` 
                };

                const transactionRef = ref(this.database, `sms_transaction/${transactionKey}`);
                await update(transactionRef, transactionData);
                Swal.fire("Sukses", "Data berhasil diperbarui!", "success");
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