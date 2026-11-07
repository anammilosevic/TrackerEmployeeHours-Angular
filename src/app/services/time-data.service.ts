import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeData } from '../models/time-data.model';
import { EmployeeHours } from '../models/employee-hours.model';

@Injectable({
  providedIn: 'root'
})
export class TimeDataService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries';

  getTimeEntries(apiKey: string): Observable<TimeData[]> {
    const params = new HttpParams().set('code', apiKey);

    return this.http.get<TimeData[]>(this.apiUrl, { params });
  }

    
calculateEmployeeHours(entries: TimeData[]): EmployeeHours[] {
  const employeeHours = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.EmployeeName ||
      !entry.StarTimeUtc ||
      !entry.EndTimeUtc ||
      entry.DeletedOn !== null) {
    continue;
  }

    const start = new Date(entry.StarTimeUtc).getTime();
    const end = new Date(entry.EndTimeUtc).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      continue;
    }

    const hours = (end - start) / (1000 * 60 * 60);
    const name = entry.EmployeeName;

    employeeHours.set(
      name,
      (employeeHours.get(name) ?? 0) + hours
    );
  }

  return Array.from(employeeHours, ([employeeName, totalHours]) => ({
    employeeName,
    totalHours
  })).sort((a, b) => b.totalHours - a.totalHours);
}


  
}
