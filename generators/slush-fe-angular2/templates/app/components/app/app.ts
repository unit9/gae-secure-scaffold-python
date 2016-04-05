import {Component} from 'angular2/core'
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router'

import {PageLanding} from 'components/pages/page-landing/page-landing'

@Component({
    selector: 'app',
    templateUrl: 'components/app/app.html',
    styleUrls: ['components/app/app.css'],
    directives: [ROUTER_DIRECTIVES]
})

@RouteConfig([
    {path:'/', name: 'Landing', component: PageLanding}
])

export class AppComponent {
    message: string;

    constructor() {
        var that = this
    }
}
