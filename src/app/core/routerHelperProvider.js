(function() {
  'use strict';

  angular
      .module('nblsurvey.core')
      .provider('routerHelper', routerHelperProvider);

  routerHelperProvider.$inject = ['$stateProvider', '$urlRouterProvider'];

  /* @ngInject */
  function routerHelperProvider($stateProvider, $urlRouterProvider) {
    this.$get = RouterHelper;

    RouterHelper.$inject = ['$state'];

    /* @ngInject */
    function RouterHelper($state) {
      var hasOtherwise = false;

      var service = {
        configureStates: configureStates,
        getStates: getStates,
      };

      return service;

      // //////////////

      function configureStates(states, otherwisePath) {
        states.forEach(function(state) {
          $stateProvider.state(state.state, state.config);
        });
        if (otherwisePath && !hasOtherwise) {
          hasOtherwise = true;
          $urlRouterProvider.otherwise(otherwisePath);
        }
      }

      function getStates() {
        return $state.get();
      }
    }
  }
})();
