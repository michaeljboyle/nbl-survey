(function() {
  'use strict';

  angular
    .module('nblsurvey.core')
    .factory('Bodypart', Bodypart);

  Bodypart.$inject = ['$log'];

  /* @ngInject */
  function Bodypart($log) {

    /**
     * Constructor
     * Small object to store both the body data and its key for ease of use
     * @param {string} key A key to look up body data.
     * @return {Object} An object with key and body data
     */
    function BodypartObj(key, data) {
      this.key = key;
      this.title = prettyNames[key];
      this.data = angular.copy(data);
    }

    var prettyNames = {
      'head': 'Head',
      'neck': 'Neck',
      'torso': 'Torso',
      'rShoulder': 'Right Shoulder',
      'rArm': 'Right Arm',
      'rHand': 'Right Hand',
      'lShoulder': 'Left Shoulder',
      'lArm': 'Left Arm',
      'lHand': 'Left Hand',
      'rHip': 'Right Hip',
      'rLeg': 'Right Leg',
      'rFoot': 'Right Foot',
      'lHip': 'Left Hip',
      'lLeg': 'Left Leg',
      'lFoot': 'Left Foot',
      'groin': 'Groin'
    };

    // BodypartObj.prototype.reset = function() {
    //   this.data = {
    //     'location': '',
    //     'pain': 0,
    //     'irritation': false,
    //     'numbness': false,
        
    //   }
    // }

    /**
     * Static method, assigned to class
     */
    BodypartObj.build = function (key, data) {
      return new BodypartObj(key, data);
    };

    // Return the constructor
    return BodypartObj;
  }
})();
