import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: 'c-<%= name %>',
  templateUrl: './ui/<%= name %>/c-<%= name %>.html',
  styleUrls: ['./ui/<%= name %>/c-<%= name %>.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class <%= camelName %>Component {}
