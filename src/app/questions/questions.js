(function() {
  'use strict';

  var questionsConfig = {
    controller: QuestionsController,
    controllerAs: 'vm',
    templateUrl: 'app/questions/questions.html',
  };

  angular
    .module('nblsurvey.questions')
    .component('questionsComponent', questionsConfig);

  QuestionsController.$inject = ['dataService', '$log', '$state'];

  /* @ngInject */
  function QuestionsController(dataService, $log, $state) {
    var vm = this;

    vm.$onInit = onInit;
    vm.allowOther = allowOther;
    vm.answer = answer;
    vm.back = back;
    vm.hasPrevious = hasPrevious;
    vm.input = null;
    vm.isChecked = isChecked;
    vm.qtype = null
    vm.questionText = null;
    vm.saveResponse = saveResponse;
    vm.toggleSelection = toggleSelection;
    vm.options = [];
    vm.other = '';
    
    var questionObj;
    var visitedKeys = [];

    function onInit() {
      reset();
      setQuestion(dataService.getStartingQuestion());
    }

    function allowOther() {
      return questionObj.allowOther();
    }

    // This submit/saves the answer and takes care of navigation to the next
    function answer(response) {
      saveResponse(response);
      visitedKeys.push(questionObj.key);
      console.log('just visited: ' + visitedKeys);
      if (questionObj.hasNextQuestion()) {
        var nextKey = questionObj.getNextQuestionKey(response);
        setQuestion(dataService.getQuestion(nextKey));
      }
      else {
        $state.go('body');
      }
    }

    // Goes to the previous question
    function back() {
      console.log('GOING BACK: ' + visitedKeys);
      var previousKey = visitedKeys.pop()
      console.log('getting previous question with key: ' + previousKey);
      setQuestion(dataService.getQuestion(previousKey));
    }

    // Returns true if it is possible to go back (i.e. not at beginning)
    function hasPrevious() {
      return visitedKeys.length !== 0;
    }

    // Returns true if this option is among selected options
    function isChecked(option) {
      if (!Array.isArray(vm.input)) {
        return false;
      }
      return vm.input.indexOf(option) != -1;
    }

    // Clears all to defaults
    function reset() {
      vm.input = null;
      vm.otherChecked = false;
      vm.qtype = null;
      vm.questionText= null;
      vm.options = [];
      vm.other = '';
    }

    function saveResponse(response) {
      if (allowOther() && vm.other !== '') {
        response.push(vm.other);
      }
      try {
        questionObj.setResponse(response);
      }
      catch(e) {
        alert(e);
        return;
      }
      console.log('submitting response with input ' + response);
      dataService.updateQuestion(questionObj);
    }

    function setQuestion(qObj) {
      reset();

      questionObj = qObj;
      vm.input = qObj.data.response;

      console.log('fetch qObj response: ' + vm.input);
      
      // Appropriately set "other" checkbox and input
      if (allowOther() && questionObj.getOtherOption() !== '') {
        console.log('before splice: ' + vm.input);
        var other = questionObj.getOtherOption();
        // If an "other" option is present, remove it from the array
        // and add set it on vm.other
        vm.input.splice(vm.input.indexOf(other), 1);
        console.log('after splice: ' + vm.input);
        vm.other = other;
      }
      console.log('input is ' + qObj.data.response);

      console.log('otherChecked = ' + vm.otherChecked + ' and value is ' + vm.other);

      vm.questionText = qObj.data.q;

      if (qObj.isYesNo()) {
        vm.qtype = 'yesno';
      }
      if (qObj.isNumber()) {
        vm.qtype = 'number';
      }
      if (qObj.isText()) {
        vm.qtype = 'text';
      }
      if (qObj.isMultiselect()) {
        vm.qtype = 'multiselect';
        vm.options = qObj.getOptions();
      }
    }

    function toggleSelection(option) {
      var idx = vm.input.indexOf(option);
      if (idx != -1) {
        vm.input.splice(idx, 1);
      }
      else {
        vm.input.push(option);
      }
      console.log(vm.input);
    }
  }
})();
