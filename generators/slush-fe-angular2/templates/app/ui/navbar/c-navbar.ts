import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: 'c-navbar',
  templateUrl: './ui/navbar/c-navbar.html',
  styleUrls: ['./ui/navbar/c-navbar.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class NavbarComponent {}
