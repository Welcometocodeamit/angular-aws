import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http:HttpClient) { }

  getRepoIssues(sort: string, pageSize: Number, page: number, body) {
    console.log(body)
    const requestUrl = `https://5071hn4hed.execute-api.ap-south-1.amazonaws.com/test/employees/paginate?pageNo=${page+1}&pageSize=${pageSize}`;

    return this.http.post(requestUrl, body);
  }

  uploadFile(file){
    const requestUrl =`https://5071hn4hed.execute-api.ap-south-1.amazonaws.com/test/employees/upload`
    return this.http.post(requestUrl, file);
  }

  downloadFile(){
    let requestUrl =`https://5071hn4hed.execute-api.ap-south-1.amazonaws.com/test/employees/download`
    return this.http.get(requestUrl, {responseType:'text' as 'json'});
  }

}
