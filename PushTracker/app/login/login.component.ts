import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

import { Router } from "@angular/router";
import { Page } from "ui/page";
import { Color } from "color";
import { View } from "ui/core/view";
import { Animation, AnimationDefinition } from "ui/animation";

//import { setHintColor } from "../../utils/hint-util";
import { TextField } from "ui/text-field";

import { User } from "../shared/user";
import { LoginService } from "../shared/login.service";

@Component({
    selector: "Login",
    moduleId: module.id,
    providers: [LoginService],
    templateUrl: "./login.component.html",
    styleUrls: ["./login.css"]
})
export class LoginComponent implements OnInit {

    // public members
    public user: User = new User();
    public isLoggingIn: boolean = true;

    @ViewChild("container") container: ElementRef;
    @ViewChild("icon") icon: ElementRef;
    @ViewChild("email") email: ElementRef;
    @ViewChild("password") password: ElementRef;

    // private members

    // functions

    constructor(private router: Router, private loginService: LoginService, private page: Page) {
    }

    /* ***********************************************************
     * Use the sideDrawerTransition property to change the open/close animation of the drawer.
     *************************************************************/
    ngOnInit(): void {
	this.page.actionBarHidden = true;
	//this.page.backgroundImage = "res://bg_login";
	//this.page.addCss("Page { background-repeat: no-repeat; background-size: 100% 100%; }");
    }

    public enterApp(): void {
	this.router.navigate(["/dashboard"]);
    }

    public cancel(): void {
	this.enterApp();
    }
    
    public submit(): void {
	console.log(JSON.stringify(this.user, null, 2));
	console.log(this.user.email);
	if (!this.user.isValidEmail()) {
	    alert("Enter a valid email address.");
	    return;
	}
	if (this.isLoggingIn) {
	    this.login();
	} else {
	    this.signUp();
	}
    }

    public login(): void {
	this.enterApp();
    }

    public signUp(): void {
	this.enterApp();
    }

    public toggleDisplay(): void {
	this.isLoggingIn = !this.isLoggingIn;
	/*
	this.setTextFieldColors();
	// animate the background of the container
	let container = <View>this.container.nativeElement;
	container.animate({
	    backgroundColor: this.isLoggingIn ? new Color("white") : new Color("#301217"),
	    duration: 200
	});
	// animate the rotation of the icon
	let icon = <View>this.icon.nativeElement;
	let definitions = new Array<AnimationDefinition>();
	definitions.push({target: icon, rotate: 360, scale: {x:1.1, y:1.1}, duration: 200 });
	definitions.push({target: icon, rotate: 0, scale: {x:1, y:1}, duration: 200 });
	var playSequentially = true;
	var animationSet = new Animation(definitions, playSequentially);
	animationSet.play().then(() => {
            //console.log("Animation finished");
	})
	    .catch((e) => {
		console.log(e.message);
	    });
	*/
    }

}
