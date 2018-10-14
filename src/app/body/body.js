(function() {
  'use strict';

  var bodyConfig = {
    controller: BodyController,
    controllerAs: 'vm',
    templateUrl: 'app/body/body.html',
  };

  angular
    .module('nblsurvey.body')
    .component('bodyComponent', bodyConfig);

  BodyController.$inject = ['dataService', '$log', '$state', '$mdBottomSheet'];

  /* @ngInject */
  function BodyController(dataService, $log, $state, $mdBottomSheet) {
    var vm = this;

    vm.$onInit = onInit;
    vm.back = back;
    vm.isSelected = isSelected;
    vm.next = next;
    vm.select = select;

    var selected = [];
   
    function onInit() {
      // Retrieve selected parts to preserve state
      selected = dataService.getSelectedBodyparts();
    }

    function back() {
      // First cache the selected body parts to easily recreate state
      dataService.saveSelectedBodyparts(selected);
      $state.go('questions');
    }

    function deselect(partKey) {
      selected.splice(selected.indexOf(partKey), 1);
    }

    function getPart(partKey) {
      return dataService.getBodypart(partKey);
    }

    function isSelected(partKey) {
      return selected.indexOf(partKey) != -1;
    }

    function next() {
      // First cache the selected body parts to easily recreate state
      dataService.saveSelectedBodyparts(selected);
      $state.go('outro');
    }

    function showBottomSheet(partObj) {
      $mdBottomSheet.show({
        templateUrl: 'app/body/bottomsheet.html',
        controller: 'BottomsheetController',
        controllerAs: 'vm',
        locals: {
          'part': partObj
        }
      }).then(function(status) {
        // If it saved, show the part as selected
        if (status == 'saved') {
          if (selected.indexOf(partObj.key) == -1) {
            selected.push(partObj.key);
          }
        }
        // If it was cleared, deselect the part
        else {
          deselect(partObj.key);
        }
      }).catch(function(err) {
      });
    }

    function select(partKey) {
      var partObj = getPart(partKey);
      showBottomSheet(partObj);
      console.log(selected);
    }
  }
})();
