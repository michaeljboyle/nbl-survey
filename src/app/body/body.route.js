(function() {
  'use strict';

  angular
    .module('nblsurvey.body')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());

    function getStates() {
      return [
        {
          state: 'body',
          config: {
            name: 'body',
            url: '/body',
            component: 'bodyComponent'
          }
        }
      ];
    }
  }
})();
