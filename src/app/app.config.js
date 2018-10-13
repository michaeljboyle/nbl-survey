(function() {
  angular
    .module('nblsurvey')
    .config(configure);

  configure.$inject = ['$mdThemingProvider', '$urlRouterProvider'];

  function configure($mdThemingProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/');
    $mdThemingProvider
      .theme('default')
      .primaryPalette('blue')
      .accentPalette('red')
      .backgroundPalette('grey');
  }
})();