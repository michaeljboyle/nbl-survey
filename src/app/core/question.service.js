(function() {
  'use strict';

  angular
    .module('nblsurvey.core')
    .factory('Question', Question);

  Question.$inject = ['$log'];

  /* @ngInject */
  function Question($log) {

    /**
     * Constructor
     * Small object to store both the question and its key for ease of use
     * @param {string} key A key to look up question data.
     * @return {Object} An object with key and question data
     */
    function QuestionObj(key, data) {
      this.key = key;
      this.data = angular.copy(data);
    }

    /**
     * Gets the next question key based on response to this question
     * @param {string|number|Array} response The response to this question
     * @return {string} The appropriate next question key
     */
    QuestionObj.prototype.getNextQuestionKey = function(response) {
      var nextQ = this.data['nextq'];
      // If only a string is specified as the next question, it is a key
      if (typeof nextQ === 'string') {
        return nextQ;
      }
      // If a dictionary is specified as next question, look in the dict
      else if (response in nextQ) {
        return nextQ[response];
      }
    }

    /**
     * @return {string} The option that is not specified in allowed options,
     *    and thus is an "other" selection.
     */
    QuestionObj.prototype.getOtherOption = function() {
      var options = this.data.options;
      var others = this.data.response.filter(function(option) {
        return options.indexOf(option) == -1;
      });
      if (others.length == 0) {
        return ''; // If no others, return empty string
      }
      else {
        return others[0]; // should only be one option that is not in options
      }
    }

    /**
     * @return {Array} Array of allowable options
     */
    QuestionObj.prototype.getOptions = function() {
      return this.data.options;
    }

    /**
     * @return {boolean} Whether an 'other' option is allowed for multiselect
     */
    QuestionObj.prototype.allowOther = function() {
      return this.data.allowOther === true;
    }

    /**
     * @return {boolean} True if this question has a next question
     */
    QuestionObj.prototype.hasNextQuestion = function() {
      return this.data['nextq'] !== undefined;
    }

    /**
     * @return {boolean} True if the response is of appropriate type
     */
    QuestionObj.prototype.isValidResponse = function(response) {
      if (this.isYesNo() && typeof response === 'boolean') {
        return true;
      }
      if (this.isNumber() && typeof response === 'number') {
        return true;
      }
      if (this.isText() && typeof response === 'string') {
        return true;
      }
      if (this.isMultiselect() && Array.isArray(response)) {
        return true;
      }
      return false;
    }

    // Private variable
    var questionTypes = {
      YESNO: 1,
      NUMBER: 2,
      MULTISELECT: 3,
      TEXT: 4
    };

    /**
     * @return {boolean} True if this question is a yes/no type
     */
    QuestionObj.prototype.isYesNo = function() {
      return this.data.qtype == questionTypes.YESNO;
    }

    /**
     * @return {boolean} True if this question is a text type
     */
    QuestionObj.prototype.isText = function() {
      return this.data.qtype == questionTypes.TEXT;
    }

    /**
     * @return {boolean} True if this question is a number type
     */
    QuestionObj.prototype.isNumber = function() {
      return this.data.qtype == questionTypes.NUMBER;
    }

    /**
     * @return {boolean} True if this question is a multiselect type
     */
    QuestionObj.prototype.isMultiselect = function() {
      return this.data.qtype == questionTypes.MULTISELECT;
    }

    /**
     * Sets response after checking it is of correct type
     * @param {string|number|Array} response The response to this question
     */
    QuestionObj.prototype.setResponse = function(response) {
      if (this.isValidResponse(response)) {
        this.data.response = response;
      }
      else {
        throw 'Incorrect response type';
      }
    }

    /**
     * Static method, assigned to class
     */
    QuestionObj.build = function (key, data) {
      return new QuestionObj(key, data);
    };

    // Return the constructor
    return QuestionObj;
  }
})();
