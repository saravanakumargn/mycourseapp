import { Injectable }    from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
 
import 'rxjs/add/operator/toPromise';
 
import * as path from './constants/paths';

@Injectable()
export class AppService {
 
  constructor(private http: Http) { }
 
callPost (url: string, params:any): Promise<any> {
  return this.http.post(url, params)
             .toPromise()
             .then(this.extractData)
             .catch(this.handleError);
}

// cname:1436
// btncname:Find
// ccode:0
// bname:0

getDetailedPage(searchValue:any, searchItem:string): Promise<any> {

  let body = new URLSearchParams();
// body.set('cname', '1436');


if(searchItem === 'ccode') {
  body.set('cname', searchValue);
  body.set('btncname', 'Find');
}
else if(searchItem === 'bname') {
  body.set('bname', searchValue);
  body.set('btnbname', 'Find');
}
else {
    body.set('cname', '0');
}

// body.set('bname', '0');

      return this.http.post(path.loginPage, body)
          .toPromise()
          .then(this.extractData)
          .catch(this.handleError);
  }

    getLocalDataService(path:string): Promise<any> {
      return this.http.get(path)
          .toPromise()
          .then(this.extractLocalData)
          .catch(this.handleError);
  }

  getWebpage(): Promise<any> {
      return this.http.get(path.loginPage)
          .toPromise()
          .then(this.extractData)
          .catch(this.handleError);
  }

  private extractData(res: Response) {
      let body = res.text();
      // console.log(typeof body)
      return body || {};
  }
  private extractLocalData(res: Response) {
      let body = res.json();
      // console.log(typeof body)
      return body || {};
  }

  private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
  }
}