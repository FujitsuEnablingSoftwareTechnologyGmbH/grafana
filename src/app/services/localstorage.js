/*
 * Copyright 2015 FUJITSU LIMITED
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

 define(['angular'], function (angular) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('NamespaceLocalStorage', function() {

    function NamespaceLocalStorage(namespace) {
      if(!namespace) {
        throw new Error('Namespace for storage expected.');
      }
      Object.defineProperty(this, 'namespace', {
        value: 'grafana:'+namespace,
        enumerate: true
      });
    }
    NamespaceLocalStorage.prototype = {
      _sid: function(id) {
        return this.namespace+':' + id;
      },
      _read: function(id) {
        return storage.read(this._sid(id)) || {};
      },
      _write: function(id, items) {
        storage.write(this._sid(id), items || {});
      },
      /**
       * Return item by id
       *
       * @return {Object}
       */
      get: function(id) {
        return this._read(id);
      },
      /**
       * Insert data. Set generated id.
       *
       * @param {Object} data
       * @return {Object}
       */
      insert: function(data) {
        data.id = sid();
        this._write(data.id, data);
        return data;
      },
      /**
       * Replace data (by id)
       *
       * @param {Object} data
       * @return {Object}
       */
      update: function(data) {
        this._write(data.id, data);
        return data;
      },
      /**
       * Remove item by id
       *
       * @param {String} id
       */
      remove: function(id) {
        storage.remove(this._sid(id));
      },
      /**
       * Search item by title or tags
       *
       * @param {String} title
       * @param {String} tags
       * @return {Array}
       */
      search: function(title, tags) {
        return this.values().filter(function(item) {
          var result = false;
          if(title) {
            result = item.title.toLowerCase().indexOf(title) !== -1;
          }
          if(!result && tags) {
            result = item.tags.some(function(tag) {
              return tag.toLowerCase().indexOf(tags) !== -1;
            });
          }
          return result;
        });
      },
      /**
       * Return all items
       *
       * @return {Array}
       */
      all: function() {
        return this.values();
      },
      /**
       * Return a list of values
       *
       * @return {Array}
       */
      values: function() {
        var buff = [];
        var keys = this.keys();
        for(var i = 0; i < keys.length; i += 1) {
          buff.push(this.get(keys[i]));
        }
        return buff;
      },
      /**
       * Return list of keys
       *
       * @return {Array}
       */
      keys: function() {
        var keys = [];
        var namespace = this.namespace;
        storage.keys().forEach(function(key) {
          if(key.indexOf(namespace) === 0) {
            keys.push(key.substr(namespace.length + 1));
          }
        });
        return keys;
      },
      /**
       * Remove all items
       */
      clear: function() {
        var keys = this.keys();
        for(var i = 0; i < keys.length; i += 1) {
          this.remove(keys[i]);
        }
      }
    };

    /**
     * Generate unique id
     *
     * @param {String} name Default: "sid"
     */
    function sid(name) {
      return (name||'sid')+'-'+(new Date().getTime()).toString()+(Math.random()*(1<<32)).toString().substr(2);
    }

    /**
     * The localStorage wrapper
     */
    var storage = {
      /**
       * More smart writing data to a localStorage
       *
       * @param {String} key
       * @param {Object} data
       */
      write: function(key, data) {
        try{
          localStorage.setItem(key,  angular.toJson(data));
        }catch(e) {
          localStorage.removeItem(key);
          throw new Error('Problem with key: ' + name + '.  '+ e.toString());
        }
      },
      /**
       * More smart reading data from localStorage
       *
       * @param {String} key
       */
      read: function(key) {
        try{
          var data = localStorage.getItem(key);
          if(data){
            return angular.fromJson(data);
          }
          return null;
        }catch(e) {
          localStorage.removeItem(key);
          throw new Error('Problem read: '+key+'. ' + e.toString());
        }
      },
      /**
       * Return a array of all keys
       */
      keys:function() {
        var keys = [];
        for(var i = 0; i < localStorage.length; i += 1) {
          keys.push(localStorage.key(i));
        }
        return keys;
      },
      /**
        * Returns an array of all values
        *
        * @return {Array}
        */
      values:function() {
        return this.keys().map(function(key) {
          return localStorage.getItem(key);
        });
      },
      /**
       * Remove from localStorage
       *
       * @param {String} key
       */
      remove: function(key) {
        localStorage.removeItem(key);
      }
    };

    return NamespaceLocalStorage;

  });

});
