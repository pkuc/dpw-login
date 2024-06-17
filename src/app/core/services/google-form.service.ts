import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as Papa from 'papaparse';
import { UserDataRow } from '../interfaces/user-data.interface';

@Injectable({
  providedIn: 'root',
})
export class GoogleFormService {
  private formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfwQQ6MYTjYrqo_kKFlA2lTa8eZ54NIMR1vmYgnhrno4IrtMw/formResponse';
  private exportUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZCeNK6M6uNsJin5lrvAOSp62FRm75zvO-mMDGpRTIP-SbzsAHQJbMLgGZt1KKx0THEE2giWiBtAcF/pub?output=csv';

  constructor(private http: HttpClient) {}

  submitForm(data: any) {
    const params = new HttpParams()
      .set('entry.189028093', data.firstName)  // Replace with your actual entry IDs and data fields
      .set('entry.1227897388', data.lastName)
      .set('entry.1967561806', data.email);

    return this.http.post(this.formUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // responseType: 'text',  // Google forms returns a textual response
    });
  }

  getData(): Observable<UserDataRow[]> {
    return this.http.get(this.exportUrl, { responseType: 'text' }).pipe(
      map(data => {
        const parsedData = Papa.parse<UserDataRow>(data, { header: true });
        return parsedData.data;
      })
    );
  }
}