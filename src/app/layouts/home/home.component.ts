import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, child, query, orderByKey } from '@angular/fire/database';
import { formatDate, registerLocaleData } from '@angular/common'; 
import localeId from '@angular/common/locales/id'; // Import Indonesian locale
import { LOCALE_ID } from '@angular/core'; // Import LOCALE_ID from @angular/core
import Swal from 'sweetalert2';

interface User {
  nik: string;
  created_at: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'id-ID' }] // Provide the locale ID
})
export class HomeComponent implements OnInit {
  nik: string | null = null;
  nama: string | null = null; 

  constructor(private route: ActivatedRoute, private router: Router, private database: Database) {
    registerLocaleData(localeId);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.nik = params['nik'];
      this.nama = params['nama'];
    });
  }

  // Jangan hapus dulu!
  // private fetchTransactionsAndNavigate(action: string): void {
  //   if (this.nik) {
  //     const today = formatDate(new Date(), 'yyyy-MM-dd', 'id-ID');
  //     const dbRef = ref(this.database);
  //     const smsTransactionRef = query(
  //         child(dbRef, 'sms_transaction'),
  //         orderByKey() 
  //     );

  //     get(smsTransactionRef).then(snapshot => {
  //         if (snapshot.exists()) {
  //             const transactions = snapshot.val() as Record<string, User>;
  //             const filteredTransactions = Object.values(transactions).filter(transaction => {
  //                 return transaction.nik === this.nik && 
  //                       transaction.created_at.startsWith(today); 
  //             });

  //             if (filteredTransactions.length > 0) {
  //                 // console.log('Filtered Transactions:', filteredTransactions);
  //                 const transactionId = Object.keys(transactions).find(key => transactions[key].nik === this.nik && transactions[key].created_at.startsWith(today));
  //                 if(action == "pasToPsg"){
  //                   this.router.navigate(['/transaksi'], { queryParams: { id: transactionId, nik: this.nik, nama: this.nama } }); 
  //                 }else{
  //                   this.router.navigate(['/transaksi-pulang'], { queryParams: { id: transactionId, nik: this.nik, nama: this.nama } }); 
  //                 }
  //             } else {
  //                 Swal.fire("Error", "Tidak ada transaksi untuk NIK ini pada hari ini.", "error");
  //             }
  //         } else {
  //             Swal.fire("Error", "Tidak ada transaksi.", "error");
  //         }
  //     }).catch(error => {
  //         console.error('Error fetching transactions:', error);
  //     });
  //   }
  // }

  gotoPasToPsg(): void {
    this.router.navigate(['/transaksi'], {
      queryParams: {
        nik: this.nik,
        nama: this.nama
      }
    });
  }

  gotoPsgToPas(): void {
    this.router.navigate(['/transaksi-pulang'], {
      queryParams: {
        nik: this.nik,
        nama: this.nama
      }
    });
  }
}