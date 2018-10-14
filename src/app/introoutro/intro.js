(function() {
  'use strict';

  var introConfig = {
    controller: IntroController,
    controllerAs: 'vm',
    templateUrl: 'app/introoutro/intro.html',
    bindings: {
      idData: '<',
    },
  };

  angular
    .module('nblsurvey.introoutro')
    .component('introComponent', introConfig);

  IntroController.$inject = ['$log'];

  /* @ngInject */
  function IntroController($log) {
    var vm = this;

    vm.idData; // set by the binding from the resolve on state load
  }
})();
