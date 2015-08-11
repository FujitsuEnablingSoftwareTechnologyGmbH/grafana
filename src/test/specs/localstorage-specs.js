/* global afterEach:false */
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

define(['services/localstorage'], function() {
  'use strict';

  function rawRead(id){
    if(!localStorage.length){
      throw new Error('Empty localStorage');
    }
    if(!id){
      id = localStorage.key(0);
    }
    return JSON.parse(localStorage.getItem(id));
  }

  describe('Storage', function() {

    var storage, LocalStorage;

    beforeEach(module('grafana.services'));
    beforeEach(inject(function(NamespaceLocalStorage) {
      LocalStorage = NamespaceLocalStorage;
      localStorage.clear();
      storage = new NamespaceLocalStorage('test');
    }));

    afterEach(function() {
      localStorage.clear();
    });

    it('should throw error for unset titlespace', function() {
      expect(function(){
        new LocalStorage();
      }).to.throwError();
    });

    it('should set titlespace', function() {
      expect(storage.namespace).to.be('grafana:test');
    });

    it('should not find anything in empty localStorage', function() {
      expect(storage.search()).to.be.empty;
      expect(storage.get(1)).to.be.empty;
      expect(storage.keys()).to.be.empty;
      expect(storage.values()).to.be.empty;
    });

    it('should insert data', function(){
      storage.insert({title:'Test'});
      expect(localStorage.length).to.be.equal(1);
    });

    it('should insert many items', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      expect(localStorage.length).to.be.equal(3);
    });

    it('should insert data in localStorage', function(){
      storage.insert({title:'Test'});
      expect(rawRead().title).to.be.equal('Test');
    });

    it('should set id in data and insert it in localStorage', function(){
      var data = storage.insert({title:'Test'});
      expect(data.id).not.to.be.empty;
    });

    it('should read data', function(){
      var id = storage.insert({title:'Test'}).id;
      expect(storage.get(id).id).to.be.equal(id);
    });

    it('should update data', function(){
      var data = storage.insert({title:'Test'});
      data.title = 'Updated';
      storage.update(data);
      expect(rawRead().title).to.be.equal('Updated');
    });

    it('should remove data', function(){
      storage.insert({title:'Test1'});
      var data2 = storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      storage.remove(data2.id);
      expect(localStorage.length).to.be.equal(2);
    });

    it('should clear all data', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      storage.clear();
      expect(localStorage).to.have.length(0);
    });

    it('should in insert throw error for incorrect data', function(){
      var a = {};
      var b = {};
      a.b = b;
      b.a = a;
      expect(function(){
        storage.insert(a);
      }).to.throwError();
    });

    it('should find keys', function(){
      var d1 = storage.insert({title:'Test1'});
      var d2 = storage.insert({title:'Test2'});
      var d3 = storage.insert({title:'Test3'});
      var keys = storage.keys();
      expect(keys).to.length(3);
      expect(keys.indexOf(d1.id)).not.to.be.equal(-1);
      expect(keys.indexOf(d2.id)).not.to.be.equal(-1);
      expect(keys.indexOf(d3.id)).not.to.be.equal(-1);
    });

    it('should find keys after remove', function(){
      storage.insert({title:'Test1'});
      var d2 = storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      expect(storage.keys()).to.length(3);
      storage.remove(d2.id);
      expect(storage.keys()).to.length(2);
    });

    it('should find keys after insert', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      expect(storage.keys()).to.length(2);
      storage.insert({title:'Test3'});
      expect(storage.keys()).to.length(3);
    });

    it('should find values', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      expect(storage.values()).to.length(3);
    });

    it('should find values after remove', function(){
      storage.insert({title:'Test1'});
      var d2 = storage.insert({title:'Test2'});
      storage.insert({title:'Test3'});
      expect(storage.values()).to.length(3);
      storage.remove(d2.id);
      expect(storage.values()).to.length(2);
    });

    it('should find values after insert', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      expect(storage.values()).to.length(2);
      storage.insert({title:'Test3'});
      expect(storage.values()).to.length(3);
    });

    it('should return all items', function(){
      storage.insert({title:'Test1'});
      storage.insert({title:'Test2'});
      expect(storage.all()).to.length(2);
      storage.insert({title:'Test3'});
      expect(storage.all()).to.length(3);
    });

    describe('search', function() {

      function create(title, tags){
        storage.insert({
          title:title,
          tags:tags || []
        });
      }

      describe('for empty params', function(){
        it('should read all items', function(){
          create('one', ['two']);
          create('one two', ['one']);
          create('three', ['one']);
          expect(storage.search()).to.length(0);
        });
      });

      describe('(by:title)', function(){

        function sample(){
          create('one', ['two']);
          create('one two', ['one']);
          create('three', ['one']);
        }

        it('should not find any items' , function(){
          sample();
          expect(storage.search('test')).to.length(0);
        });

        it('should find title: "one" - 2 items' , function(){
          sample();
          expect(storage.search('one')).to.length(2);
        });

        it('should find title: "two" - 1 items' , function(){
          sample();
          expect(storage.search('two')).to.length(1);
        });

        it('should find title: "three" - 1 items' , function(){
          sample();
          expect(storage.search('three')).to.length(1);
        });

      });

      describe('(by:tags)', function(){

        function sample(){
          create('one t1', ['t1']);
          create('two', ['t1', 't2']);
          create('three t2' ,['t3']);
        }

        it('should not find any items' , function(){
          sample();
          expect(storage.search(null, 'test')).to.length(0);
        });

        it('should find tag: "t1" - 2 items' , function(){
          sample();
          expect(storage.search(null, 't1')).to.length(2);
        });

        it('should find tag: "t2" - 1 items' , function(){
          sample();
          expect(storage.search(null, 't2')).to.length(1);
        });

        it('should find tag: "t3" - 1 items' , function(){
          sample();
          expect(storage.search(null, 't3')).to.length(1);
        });

      });

      describe('(by:title and by:tags)', function(){

        function sample(){
          create('one', ['two']);
          create('two', ['one']);
          create('three' ,['four']);
          create('five' ,['six']);
        }

        it('should not find any items' , function(){
          sample();
          expect(storage.search('test', 'test')).to.length(0);
        });

        it('should find: "one" - 2 items' , function(){
          sample();
          expect(storage.search('one', 'one')).to.length(2);
        });

        it('should find title: "two" - 2 items' , function(){
          sample();
          expect(storage.search('two', 'two')).to.length(2);
        });

        it('should find only title: "three" - 1 items' , function(){
          sample();
          expect(storage.search("three", 'three')).to.length(1);
        });

        it('should find only tag: "siz" - 1 items' , function(){
          sample();
          expect(storage.search("nine", 'six')).to.length(1);
        });

      });

    });

  });

});
