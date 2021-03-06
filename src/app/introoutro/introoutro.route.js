(function() {
  'use strict';

  angular
    .module('nblsurvey.introoutro')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());

    function getStates() {
      return [
        {
          state: 'intro',
          config: {
            name: 'intro',
            url: '/survey/{surveyId}',
            component: 'introComponent',
            resolve: {
              idData: loadSurvey,
            },
          }
        },
        {
          state: 'outro',
          config: {
            name: 'outro',
            url: '/outro',
            component: 'outroComponent'
          }
        },
        {
          state: 'done',
          config: {
            name: 'done',
            url: '/done',
            templateUrl: 'app/introoutro/done.html'
          }
        }
      ];
    }
  }

  loadSurvey.$inject = ['dataService', '$transition$'];

  /* @ngInject */
  function loadSurvey(dataService, $transition$) {
    var id = $transition$.params().surveyId;
    var idData = dataService.loadSurvey(id);
    // idData.dateSubmitted = new Date(pub.dateSubmitted);
    return idData;
  }
})();
