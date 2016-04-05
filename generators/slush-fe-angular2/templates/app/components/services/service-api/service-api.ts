import {Injectable} from 'angular2/core'

@Injectable()
export class ServiceApi {
  data: Object;

  constructor() {
    var that = this;
    console.log('[service-api] ready');
  }
}
