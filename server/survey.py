from google.appengine.ext import ndb

BODYPART_NAMES = ['head', 'neck', 'torso', 'rShoulder', 'rArm', 'rHand',
                  'lShoulder', 'lArm', 'lHand', 'groin', 'rHip', 'rLeg',
                  'rFoot', 'lHip', 'lLeg', 'lFoot']

# Structured property to contain bodypart data
class Bodypart(ndb.Model):
    name = ndb.StringProperty(
            choices=BODYPART_NAMES)
    affected = ndb.BooleanProperty(default=False)
    location = ndb.StringProperty()
    pain = ndb.IntegerProperty(choices=range(0, 11), default=0)
    irritation_or_hotspot = ndb.BooleanProperty('irritation', default=False)
    numbness_or_tingling = ndb.BooleanProperty('numbness', default=False)
    bruises_or_discoloration = ndb.BooleanProperty('bruises', default=False)
    cuts_or_abrasions = ndb.BooleanProperty('cuts', default=False)
    comments = ndb.TextProperty()


# Class to contain survey data
class Survey(ndb.Model):
    """A model for representing survey data."""

    eis_id = ndb.StringProperty(required=True)
    # The time that the NBL run finished
    nbl_finish_timestamp = ndb.DateTimeProperty(required=True)
    # The time the survey was complete
    survey_complete_timestamp = ndb.DateTimeProperty()
    # The time the survey is due to be sent to use
    survey_send_time = ndb.DateTimeProperty(required=True)
    # first name
    first_name = ndb.StringProperty()
    # Body parts
    bodyparts = ndb.StructuredProperty(Bodypart, repeated=True)

    # Other questions
    other_exposure = ndb.BooleanProperty(default=False)
    pain = ndb.BooleanProperty(default=False)
    pain_medattention = ndb.BooleanProperty(default=False)
    pain_activitychange = ndb.BooleanProperty(default=False)
    pain_suitperformance = ndb.BooleanProperty(default=False)
    pain_suitperformance_duration = ndb.IntegerProperty()
    fingernails = ndb.StringProperty()
    treatments = ndb.StringProperty(repeated=True)


    # Sets up a new survey with defaults
    def set_defaults(self):
        for part_name in BODYPART_NAMES:
            self.bodyparts.append(Bodypart(name=part_name))
