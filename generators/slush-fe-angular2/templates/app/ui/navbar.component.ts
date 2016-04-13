import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: 'sd-navbar',
  templateUrl: './ui/navbar.component.html',
  styleUrls: ['./ui/navbar.component.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class NavbarComponent {}
