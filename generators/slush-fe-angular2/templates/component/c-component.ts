import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: '<%= name %>',
  templateUrl: './ui/<%= nameBase %>/<%= name %>.html',
  styleUrls: ['./ui/<%= nameBase %>/<%= name %>.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class <%= camelName %>Component {}
