import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { catchError, flatMap, map, merge, of, startWith, switchMap, takeWhile } from 'rxjs';
import { HttpService } from 'src/app/Services/http.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'email', 'ip_address'];
  // exampleDatabase: ExampleHttpDatabase | null;
  data: any[] = [];
  store: any[] = []
  p: number
  pages:any

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private httpservice: HttpService) { }
  ppindex: number = 0
  pageSizeTrack:number=5
  pagination_token:any
  pg:boolean=true

  ngAfterViewInit() {
    // this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap((event: any) => {
          this.isLoadingResults = true;

          if(this.paginator.pageSize != this.pageSizeTrack){
            this.pg=true
            console.log(event.pageIndex)
            
            if( event.pageIndex==0){
              this.pagination_token=""
            }else{
              this.pagination_token={
                "id":this.store[this.data.length-1].id
              }
            }

            console.log(this.pagination_token)
          }else if(this.paginator.pageIndex==0){
            this.pg=true
          }else{
            this.pg=false
          }


          if (event.previousPageIndex > event.pageIndex) {
            let startIndex = this.paginator.pageIndex*this.paginator.pageSize
            let endIndex = startIndex + this.paginator.pageSize
            let backPagination = this.store.slice(startIndex, endIndex)
            this.data = backPagination
            this.pagination_token={
              "id":this.data[this.data.length-1].id
            }
            this.isLoadingResults = false; 
            return of(null);
          }


          let body = {
            "pagination_required":true,
            "pagination_token":this.pagination_token?this.pagination_token:""
          }

          

          return this.httpservice!.getRepoIssues(
            this.sort.active,
            this.paginator.pageSize,
            this.paginator.pageIndex,
            body
          )
        }),
        map((data: any) => {

          this.pageSizeTrack=this.paginator.pageSize
          console.log(this.pageSizeTrack)
          if(data){
            this.pagination_token=data.pagination_token
            console.log(this.pagination_token)
          }

          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }

            this.pages=data.pages
        
          
          this.resultsLength = data.count;
          return data.items;
        }),
      ).subscribe(data => {
        console.log(data)
        if (data.length > 0) {
          this.data=data
          const newData = data.filter(newItem => !this.store.some(item => item.id === newItem.id));
          if (newData.length > 0) {
            // this.data = newData;
            this.store.push(...newData);
          }
        }
      }
      );
  }

  selectedFile

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
  }

  upload() {

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.httpservice.uploadFile(this.selectedFile).subscribe((data) => {
        console.log(data)
      })
    }
  }

  download() {
    this.httpservice.downloadFile().subscribe(csvData => {
      this.downloadFile(csvData, 'download.csv');
    });
  }

  private downloadFile(data: any, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  jumpToPage(page, pageIndex){
    this.paginator.pageIndex=pageIndex
    let body = {
      "pagination_required":true,
      "pagination_token":page
    }

    this.httpservice!.getRepoIssues(
      this.sort.active,
      this.paginator.pageSize,
      this.paginator.pageIndex,
      body
    ).subscribe((data:any) => {

      this.data = data.items;
      this.pagination_token=data.pagination_token
      this.pages=data.pages
    });
  }
}



export interface Data {
  count: number;
  items: any[]; // Adjust the type of items based on your actual data structure
}


