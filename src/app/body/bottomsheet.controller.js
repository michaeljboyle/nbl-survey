(function() {
  'use strict';

  angular
    .module('nblsurvey.body')
    .controller('BottomsheetController', BottomsheetController);

  BottomsheetController.$inject = ['dataService', '$log', '$state', '$mdBottomSheet', 'part'];

  /* @ngInject */
  function BottomsheetController(dataService, $log, $state, $mdBottomSheet, part) {
    var vm = this;

    vm.clear = clear;
    vm.edit = edit;
    vm.editable = false;
    // Capture injected variable
    vm.part = part;
    vm.save = save;

    function edit() {
      vm.editable = true;
    }

    function clear() {
      dataService.resetBodyData(vm.part.key);
      $mdBottomSheet.hide('cleared');
    }

    function save() {
      dataService.updateBodypart(vm.part);
      $mdBottomSheet.hide('saved');
    }
  }
})();