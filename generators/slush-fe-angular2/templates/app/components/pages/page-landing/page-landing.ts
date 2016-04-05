import {Component} from 'angular2/core'

@Component({
  selector: 'page-landing',
  templateUrl: 'components/pages/page-landing/page-landing.html',
  styleUrls: ['components/pages/page-landing/page-landing.css'],
  directives: []
})
export class PageLanding {
  message: string;

  constructor() {
    var that = this;
  }
}
