import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {NavbarComponent} from '../ui/navbar/c-navbar';
import {ToolbarComponent} from '../ui/toolbar/c-toolbar';
import {HomeComponent} from '../pages/home/c-home';
import {AboutComponent} from '../pages/about/c-about';
import {NameListService} from '../services/c-name-list';

@Component({
  selector: 'sd-app',
  viewProviders: [NameListService],
  templateUrl: './app/c-app.html',
  directives: [ROUTER_DIRECTIVES, NavbarComponent, ToolbarComponent]
})
@RouteConfig([
  { path: '/',      name: 'Home',  component: HomeComponent  },
  { path: '/about', name: 'About', component: AboutComponent }
])
export class AppComponent {}
