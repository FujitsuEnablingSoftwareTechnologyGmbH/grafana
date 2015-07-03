define([
  'services/dashboard/storage'
], function() {
  'use strict';

  var mocker = {
    create:function(){
      var api = {
        storage: function NamespaceLocalStorageMock(){
            this.get = function(id){
              return api.get(id);
            };
            this.insert = function(model){
              return api.insert(model);
            };
            this.update = function(model){
              return api.update(model);
            };
            this.remove = function(id){
              return api.remove(id);
            };
            this.search = function(title, tags){
              return api.search(title, tags);
            };
            this.all = function(){
              return api.all();
            };
        }
      };
      return api;
    }
  };


  describe('service dashboardStorage', function() {
    var service, $rootScope, mock;

    beforeEach(module('grafana.services'));
    beforeEach(module(function($provide) {
      mock = mocker.create();
      $provide.value("NamespaceLocalStorage", mock.storage);
    }));

    beforeEach(inject(function(_$rootScope_, dashboardStorage) {
      $rootScope = _$rootScope_;
      service = dashboardStorage;
    }));

    it('should read data from storage', function() {
      mock.get = function(id){
        expect(id).to.be.equal(1);
        return 1;
      };
      var done = sinon.spy();
      service.get(1).then(done);

      $rootScope.$digest();
      expect(done.called).to.be.equal(true);
      expect(done.args[0][0]).to.be.equal(1);
    });

    it('should catch error from storage', function() {
      mock.get = function(id) {
        expect(id).to.be.equal(1);
        throw 'test';
      };
      var done = sinon.spy();
      var fail = sinon.spy();
      service.get(1).then(done, fail);

      $rootScope.$digest();
      expect(done.called).to.be.equal(false);
      expect(fail.called).to.be.equal(true);
      expect(fail.args[0][0]).to.be.equal('test');
    });

    it('should update data in storage', function() {
      mock.update = function(model){
        return model;
      };
      var done = sinon.spy();
      var fail = sinon.spy();

      service.save({
        id:1,
        title:'test'
      }).then(done, fail);

      $rootScope.$digest();
      expect(fail.called).to.be.equal(false);
      expect(done.called).to.be.equal(true);
      expect(done.args[0][0].url).to.be.equal('/dashboard/db/1');
      expect(done.args[0][0].title).to.be.equal('test');
    });

    it('should insert data in storage', function() {
      mock.insert = function(model){
        model.id = 111;
        return model;
      };
      var done = sinon.spy();
      var fail = sinon.spy();

      service.save({
        title:'test'
      }).then(done, fail);

      $rootScope.$digest();
      expect(fail.called).to.be.equal(false);
      expect(done.called).to.be.equal(true);
      expect(done.args[0][0].url).to.be.equal('/dashboard/db/111');
      expect(done.args[0][0].title).to.be.equal('test');
    });

    it('should remove data from storage', function() {
      mock.remove = function(id){
        expect(id).to.be.equal(1);
      };
      mock.get = function(id){
        expect(id).to.be.equal(1);
        return {
          id: 1,
          title:'test'
        };
      };
      var done = sinon.spy();
      var fail = sinon.spy();

      service.remove(1).then(done, fail);

      $rootScope.$digest();
      expect(fail.called).to.be.equal(false);
      expect(done.called).to.be.equal(true);
      expect(done.args[0][0]).to.be.equal('test');
    });
    describe('searching', function(){

      it('should find all items', function(){
        mock.all = function(){
          return [];
        };
        var done = sinon.spy();
        var fail = sinon.spy();

        service.search().then(done, fail);

        $rootScope.$digest();
        expect(fail.called).to.be.equal(false);
        expect(done.called).to.be.equal(true);
        expect(done.args[0][0].dashboards.length).to.be.equal(0);
      });

      it('should search by title and tags', function() {
        mock.search = function(title, tags){
          expect(title).to.be.equal('test');
          expect(tags).to.be.equal('test');
          return [];
        };
        var done = sinon.spy();
        var fail = sinon.spy();

        service.search('test').then(done, fail);

        $rootScope.$digest();
        expect(fail.called).to.be.equal(false);
        expect(done.called).to.be.equal(true);
      });

      it('should search by title', function(){
        mock.search = function(title, tags){
          expect(title).to.be.equal('test');
          expect(tags).to.be.equal('');
          return [];
        };
        var done = sinon.spy();
        var fail = sinon.spy();

        service.search('title:Test').then(done, fail);

        $rootScope.$digest();
        expect(fail.called).to.be.equal(false);
        expect(done.called).to.be.equal(true);
      });

      it('should search by tags', function(){
        mock.search = function(title, tags){
          expect(title).to.be.equal('');
          expect(tags).to.be.equal('tags');
          return [];
        };
        var done = sinon.spy();
        var fail = sinon.spy();

        service.search('tags!:Tags').then(done, fail);

        $rootScope.$digest();
        expect(fail.called).to.be.equal(false);
        expect(done.called).to.be.equal(true);
      });

    });

  });

});
