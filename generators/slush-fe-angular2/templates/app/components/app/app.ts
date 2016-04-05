import {Component} from 'angular2/core'
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router'

import {PageLanding} from 'components/pages/page-landing/page-landing'
import {ServiceApi} from 'components/services/service-api/service-api'

@Component({
    selector: 'app',
    templateUrl: 'components/app/app.html',
    styleUrls: ['components/app/app.css'],
    directives: [ROUTER_DIRECTIVES],
    providers: [ServiceApi]
})

@RouteConfig([
    {path:'/', name: 'Landing', component: PageLanding}
])

export class AppComponent {
    message: string;

    constructor(private _apiService: ServiceApi) {
        var that = this;
        console.log('[app] ready');
    }
}
