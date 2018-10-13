(function() {
  'use strict';

  angular
    .module('nblsurvey.questions')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());

    function getStates() {
      return [
        {
          state: 'questions',
          config: {
            name: 'questions',
            url: '/questions',
            component: 'questionsComponent'
          }
        }
      ];
    }
  }
})();
