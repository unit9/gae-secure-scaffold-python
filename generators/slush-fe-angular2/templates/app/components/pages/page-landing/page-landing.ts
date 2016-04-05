import {Component} from 'angular2/core'

// import {Test} from '../../test/test'
// import {L10n} from '../../components/l10n/l10n';

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
