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
      'nblFinishTime': '',
      'surveySendDelay': 48,
      'email': '',
      'firstName': ''
    };
    vm.nblDate = null;
    vm.nblTime = null;
    vm.submitEnabled = submitEnabled;
    vm.submitting = false
  
    function onInit() {
    }

    function submitEnabled() {
      if (vm.data.eisId == '') {
        return false;
      }
      if (vm.nblDate === null || vm.nblTime === null) {
        return false;
      }
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(vm.nblTime)) {
        return false;
      }
      if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(vm.data.email)) {
        return false;
      }
      if (vm.submitting) {
        return false;
      }
      return true;
    }

    function submit() {
      // Disable submit button and show loading progress
      vm.submitting = true;
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
          $state.go('done');
          $mdToast.show(
            $mdToast.simple()
              .textContent('Submission successful!')
              .position('bottom')
              .hideDelay(3000)
          );
        }).catch(function() {
          alert('Something went wrong with the submission. It was not successful');
      });
    }
  }
})();
