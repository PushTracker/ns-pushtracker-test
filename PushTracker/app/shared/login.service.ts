import { Injectable } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";

import { User } from "./user";
import { Config } from "./config";

@Injectable()
export class LoginService {

    constructor(private http: Http) { }

    public register(user: User) {
	let headers = new Headers();
	headers.append('Accept', 'application/json');
	headers.append('Content-Type', 'application/json');

	return this.http.post(
	    Config.apiUrl + "auth/",
	    JSON.stringify({
		email: user.email,
		password: user.password,
		password_confirmation: user.password
	    }),
	    { headers: headers }
	)
	    .map(res => {
		console.log(res);
		return res.json();
	    })
	    .do(data => {
		console.log(data);
	    })
		.catch(this.handleErrors);
	
    }

    public login(user: User) {
	let headers = new Headers();
	headers.append('Accept', 'application/json');
	headers.append('Content-Type', 'application/json');

	return this.http.post(
	    Config.apiUrl + "auth/sign_in",
	    JSON.stringify({
		email: user.email,
		password: user.password
	    }),
	    { headers: headers }
	)
	    .map(res => {
		console.log(res);
		return res.json();
	    })
	    .do(data => {
		console.log(data);
	    })
		.catch(this.handleErrors);
    }

    public handleErrors(error: Response) {
        console.log(JSON.stringify(error.json()));
        return Observable.throw(error);
    }

}
