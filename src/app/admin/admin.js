(function() {
  'use strict';

  var adminConfig = {
    controller: AdminController,
    controllerAs: 'vm',
    templateUrl: 'app/admin/admin.html'
  };

  angular
    .module('nblsurvey.questions')
    .component('adminComponent', adminConfig);

  AdminController.$inject = ['dataService', '$log', '$state', '$mdToast'];

  /* @ngInject */
  function AdminController(dataService, $log, $state, $mdToast) {
    var vm = this;

    vm.$onInit = onInit;
    vm.submit = submit;
    vm.data = {
      'eisId': '',
      'nblFinishTime': null,
      'surveySendDelay': 48,
      'email': '',
      'firstName': ''
    };
    vm.nblDate = null;
    vm.nblTime = null;
  
    function onInit() {
      console.log('HERE');
    }

    function submit() {
      // calculate the finish timestamp
      var timestamp = vm.nblDate.getTime();
      var time = vm.nblTime.split(':');
      try {
        timestamp = timestamp + time[0] * 60 * 60 * 1000 + time[1] * 60 * 1000;
      }
      catch(e) {
        timestamp = timestampe + 12 * 60 * 60 * 1000; // Assume it was around noon
      }
      vm.data.nblFinishTime = timestamp;
      dataService.createSurvey(vm.data)
        .then(function(success) {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Submission successful!')
              .position({'position': 'top'})
              .hideDelay(3000)
          );
        }).catch(function() {
          alert('Something went wrong with the submission. It was not successful');
      });
      $state.go('done');
    }
  }
})();
