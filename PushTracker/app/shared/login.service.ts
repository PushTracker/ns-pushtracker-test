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
	Config.user.loggedIn = false;

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
		console.log(`res: ${res}`);
		const headers = res.headers;
		console.log(`headers:\n ${JSON.stringify(headers, null, 2)}`);
		return res.json();
	    })
	    .do(data => {
		console.log(`data: ${data}`);
		console.log(JSON.stringify(data, null, 2));
	    })
		.catch(this.handleErrors);
	
    }

    public login(user: User) {
	Config.user.loggedIn = false;

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
		console.log(`res: ${res}`);
		const headers = res.headers;
		Config.token = headers['access-token'];
		Config.client = headers['client'];
		Config.uid = headers['uid'];
		Config.user = user;
		Config.user.loggedIn = true;
		return res.json();
	    })
	    .do(data => {
		console.log(`data: ${data}`);
		Config.user.name = data.data.first_name;
		console.log(JSON.stringify(data, null, 2));
	    })
		.catch(this.handleErrors);
    }

    public handleErrors(error: Response) {
	Config.user.loggedIn = false;

        console.log(JSON.stringify(error.json()));
        return Observable.throw(error);
    }

}
