/**
 * This component is based in the react-select component https://github.com/JedWatson/react-select
 * It adds the ability to pass only the url from where options are get.
 * Url should have the following format: http://localhost:3004/options?q={{keyword}}
 * Keyword is the string to be sent to the server and retrive the available options
 * for that word.
 *
 * You can override all the available properties of the original component.
 * For more documentation about  this component please go
 * to https://github.com/JedWatson/react-select
 */

import React, { Component } from 'react';
import Registry from '../utils/Registry';
import {makeKey} from '../utils/utils';
import BaseComponent from './BaseComponent';
import ReactSelect from './ReactSelect';

export default class Autocomplete extends BaseComponent {

  constructor(props) {
    super(props);
    this.state.data = this.state.ownParams; 
  }
  
  onFilter(e) {
    this.applyDataHandlers(e, this.props.dataHandlers);
  }
  
  onChange(e) {
    // @@TODO wire param routing to Autocomplete!
    // Currently this overrides onFilter in BaseComponent
    // which does param handling
    this.onFilter(e);

    this.emit({
      actionType: 'AUTOCOMPLETE_CHANGE',
      value: e,
      id: this.props.id
    });
  }

  /**
   * Load autocomplete options
   * @param  {String}   input A text with the query to be sent to the server
   * @param  {Function} cb    Callback to be called right after server response
   * @return {Promise}        A promise with the request
   */
  loadOptions(input, cb){
    let re = /\{\{(.+)\}\}/;
    if(this.props.url) {
      return fetch(this.props.url.replace(re, input))
        .then((response) => {
          return response.json();
        }).then((json) => {
          return { options: json };
        });
    } else if(this.props.options) {
      return Promise.resolve({options: this.props.options, isLoading: false});
    }
    return  Promise.resolve({options: [], isLoading: false});
  }

  render(){
    return (
      <ReactSelect.Async value={this.state.data} loadOptions={this.loadOptions.bind(this)} {...this.props} onChange={this.onChange.bind(this)}/>
    );
  }
}

Registry.set('Autocomplete', Autocomplete);
