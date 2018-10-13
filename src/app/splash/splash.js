(function() {
  'use strict';

  var publicationsConfig = {
    controller: SplashController,
    controllerAs: 'vm',
    templateUrl: 'app/splash/splash.html',
  };

  angular
    .module('nblsurvey.splash')
    .component('splashComponent', publicationsConfig);

  SplashController.$inject = ['$log'];

  /* @ngInject */
  function SplashController($log) {
    var vm = this;
  }
})();
