(function() {
  'use strict';

  var outroConfig = {
    controller: OutroController,
    controllerAs: 'vm',
    templateUrl: 'app/introoutro/outro.html',
  };

  angular
    .module('nblsurvey.introoutro')
    .component('outroComponent', outroConfig);

  OutroController.$inject = ['dataService', '$log', '$state'];

  /* @ngInject */
  function OutroController(dataService, $log, $state) {
    var vm = this;

    vm.submit = submit;

    function submit() {
      dataService.uploadData().then(function(success) {
        $state.go('done');
      })
    }
  }
})();
