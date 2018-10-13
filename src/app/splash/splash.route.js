(function() {
  'use strict';

  angular
    .module('nblsurvey.splash')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());

    function getStates() {
      return [
        {
          state: 'splash',
          config: {
            name: 'splash',
            url: '/',
            component: 'splashComponent'
          }
        }
      ];
    }
  }
})();
