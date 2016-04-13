import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {NavbarComponent} from '../ui/navbar.component';
import {ToolbarComponent} from '../ui/toolbar.component';
import {HomeComponent} from '../pages/home/home.component';
import {AboutComponent} from '../pages/about/about.component';
import {NameListService} from '../services/name-list.service';

@Component({
  selector: 'sd-app',
  viewProviders: [NameListService],
  templateUrl: './app/app.component.html',
  directives: [ROUTER_DIRECTIVES, NavbarComponent, ToolbarComponent]
})
@RouteConfig([
  { path: '/',      name: 'Home',  component: HomeComponent  },
  { path: '/about', name: 'About', component: AboutComponent }
])
export class AppComponent {}
