(function() {
  'use strict';

  angular
    .module('nblsurvey', [
      /* Shared modules */
      'nblsurvey.core',

      /* Feature areas */
      'nblsurvey.layout',
      'nblsurvey.splash',
      'nblsurvey.questions'
    ]);
})();