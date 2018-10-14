(function() {
  'use strict';

  angular
    .module('nblsurvey.core')
    .factory('dataService', dataService);

  dataService.$inject = ['$http', '$log', '$q', 'Question'];

  /* @ngInject */
  function dataService($http, $log, $q, Question) {
    var bodyData = {
      'head': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'neck': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'torso': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rShoulder': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rArm': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rHand': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lShoulder': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lArm': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lHand': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rHip': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rLeg': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'rFoot': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lHip': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lLeg': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'lFoot': {
        'location': '',
        'pain': false,
        'severity': 0,
        'irritation': false,
        'numbness': false,
        'bruises': false,
        'cuts': false,
        'comments': ''
      },
      'groin': {
        'location': '',
        'pain': false,
        'severity': 0,
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
        'response': '',
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
      'getQuestion': getQuestion,
      'getStartingQuestion': getStartingQuestion,
      'update': update
    };

    return service;

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
      console.log(primaryQuestions);
    }
  }
})();
