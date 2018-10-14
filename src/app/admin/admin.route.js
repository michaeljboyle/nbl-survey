(function() {
  'use strict';

  angular
    .module('nblsurvey.admin')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());

    function getStates() {
      return [
        {
          state: 'admin',
          config: {
            name: 'admin',
            url: '/admin',
            component: 'adminComponent'
          },
        },
        {
          state: 'download',
          config: {
            name: 'download',
            url: '/download',
            component: 'downloadComponent'
          },
        }
      ];
    }
  }
})();
