(function() {
  'use strict';

  angular
    .module('nblsurvey.core')
    .factory('dataService', dataService);

  dataService.$inject = ['$http', '$log', '$q', 'Question', 'Bodypart'];

  /* @ngInject */
  function dataService($http, $log, $q, Question, Bodypart) {
    var bodyData = {
      'head': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'neck': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'torso': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rShoulder': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rArm': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rHand': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lShoulder': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lArm': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lHand': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rHip': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rLeg': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rFoot': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lHip': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lLeg': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lFoot': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'groin': {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      }
    };

    var questionTypes = {
      YESNO: 1,
      NUMBER: 2,
      MULTISELECT: 3,
      TEXT: 4
    };

    var primaryQuestions = {
      'exposure': {
        'q': 'Have you had any other suit exposure since this referenced ' +
            'exposure?',
        'response': false,
        'qtype': questionTypes.YESNO,
        'nextq': {
          true: 'pain',
          false: 'pain'
        }
      },
      'pain': {
        'q': 'Do you have any pain, discomfort, or injuries to report?',
        'response': false,
        'qtype': questionTypes.YESNO,
        'nextq': {
          true: 'pain-medattention',
          false: 'fingernails'
        }
      },
      'pain-medattention': {
        'q': 'Would you like medical attention?',
        'response': false,
        'qtype': questionTypes.YESNO,
        'nextq': 'pain-activitychange'
      },
      'pain-activitychange': {
        'q': 'Did these symptoms require a change in activity? (e.g. ' +
            'restrict physical activity or work-related activity)',
        'response': false,
        'qtype': questionTypes.YESNO,
        'nextq': 'pain-suitperformance'
      },
      'pain-suitperformance': {
        'q': 'Would these symptoms have affected your performance in ' +
            'a subsequent suit test?',
        'response': false,
        'qtype': questionTypes.YESNO,
        'nextq': {
          true: 'pain-suitperformance-duration',
          false: 'fingernails'
        }
      },
      'pain-suitperformance-duration': {
        'q': 'For how many days?',
        'response': 0,
        'qtype': questionTypes.NUMBER,
        'nextq': 'fingernails'
      },
      'fingernails': {
        'q': 'Any sign and/or symptom specific to the fingernails?',
        'response': 'None',
        'qtype': questionTypes.TEXT,
        'nextq': 'treatments'
      },
      'treatments': {
        'q': 'Did you use any therapeutic treatments following exposure?',
        'response': [],
        'qtype': questionTypes.MULTISELECT,
        'options': [
          'Non-prescription medications (e.g. ibuprofen)',
          'Stretching',
          'Heat/Ice',
          'Wrap(s)',
          'Band-aids',
          'Topical analgesic'
        ],
        'allowOther': true
      }
    };

    var service = {
      'createSurvey': createSurvey,
      'getBodypart': getBodypart,
      'getQuestion': getQuestion,
      'getSelectedBodyparts': getSelectedBodyparts,
      'getStartingQuestion': getStartingQuestion,
      'loadSurvey': loadSurvey,
      'resetBodyData': resetBodyData,
      'saveSelectedBodyparts': saveSelectedBodyparts,
      'updateBodypart': updateBodypart,
      'updateQuestion': updateQuestion,
      'uploadData': uploadData
    };

    var selectedBodyparts = [];
    var surveyId = '';

    return service;

    // Calls the api to create a survey
    function createSurvey(data) {
      return $http.post('/api/survey/create', data)
        .then(createSuccess)
        .catch(function(message) {
          $log.error(message);
          throw message;
        });

      function createSuccess(data, status, headers, config) {
        return data.data;
      }
    }

    /**
     * Returns the appropriate BodypartObject from the key provided
     * @param {string} key The key for the bodypart object
     * @return {Object} A bodypart object
     */
    function getBodypart(key) {
      if (key in bodyData) {
        return Bodypart.build(key, bodyData[key]);
      }
      else {
        throw 'Key not found';
      }
    }

    /**
     * Returns the appropriate QuestionObject from the key provided
     * @param {string} key The key for the question object
     * @return {Object} A question object
     */
    function getQuestion(key) {
      if (key in primaryQuestions) {
        console.log('building new QuestionObject with key: ' + key);
        return Question.build(key, primaryQuestions[key]);
      }
      else {
        throw 'Key not found';
      }
    }

    // Returns the first question to be displayed
    function getStartingQuestion() {
      return getQuestion('exposure');
    }

    // Gets bodyparts that have been selected and modified
    function getSelectedBodyparts() {
      return selectedBodyparts;
    }

    /**
     * Gets the survey with this unique ID from the server, then sets local
     * data to reflect it.
     * @return {Object} An object containing identifying info for display
     */
    function loadSurvey(id) {
      surveyId = id; // for safekeeping to make requests later
      return $http.get('/api/survey/' + id)
        .then(getSurveyComplete)
        .catch(function(message) {
          $log.error(message);
        });

      function getSurveyComplete(data, status, headers, config) {
        $log.log('Retrieved survey');
        $log.info(data.data);
        // bodyData = data.data.bodyparts;
        // updateLocalQuestions(data.data.questions);
        return {'name': data.data.firstName, 'endTime': data.data.nblFinishTimestamp};
      }
    }


    // Resets body part data to baseline
    function resetBodyData(key) {
      bodyData[key] = {
        'location': '',
        'pain': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      };
    };

    // Saves bodyparts that have been selected and modified
    function saveSelectedBodyparts(parts) {
      selectedBodyparts = parts;
    }

    // Updates the locally stored bodypart data
    function updateBodypart(bodyObj) {
      console.log('updating key:' + bodyObj.key);
      bodyData[bodyObj.key] = bodyObj.data;
      console.log(bodyData);
    }

    // Updates the locally stored question data
    function updateQuestion(qObj) {
      console.log('updating key:' + qObj.key + ' with ' + qObj.data.response);
      primaryQuestions[qObj.key].response = qObj.data.response;
      // If the pain question is set to false, reset all other pain questions to
      // false or 0
      if (qObj.key == 'pain' && qObj.data.response === false) {
        primaryQuestions['pain-medattention'].response = false;
        primaryQuestions['pain-activitychange'].response = false;
        primaryQuestions['pain-suitperformance'].response = false;
        primaryQuestions['pain-suitperformance-duration'].response = 0;
      }
      // If subsequent suit test is answered negative, any saved value for
      // duration should be zero'd
      if (qObj.key == 'pain-suitperformance' && qObj.data.response === false) {
        primaryQuestions['pain-suitperformance-duration'].response = 0;
      }
      console.log(primaryQuestions);
    }

    // Save dataa to backend
    function uploadData() {
      // First serialize questions
      var data = {'questions': {}};
      for (var key in primaryQuestions) {
        data['questions'][key] = primaryQuestions[key]['response'];
      }
      data['bodyparts'] = bodyData;
      
      return $http.post('/api/survey/' + surveyId, data)
        .then(postComplete)
        .catch(function(message) {
          $log.error(message);
          throw message;
        });

      function postComplete(data, status, headers, config) {
        return data.data;
      }
    }
  }
})();
