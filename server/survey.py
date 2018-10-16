from google.appengine.ext import ndb
from datetime import datetime

BODYPART_NAMES = ['head', 'neck', 'torso', 'rShoulder', 'rArm', 'rHand',
                  'lShoulder', 'lArm', 'lHand', 'groin', 'rHip', 'rLeg',
                  'rFoot', 'lHip', 'lLeg', 'lFoot']

# Converts datetime into javascript friendly timestamp in millisec since epoch
def get_timestamp(dt):
    if dt is None:
        return dt
    return (dt - datetime(1970, 1, 1)).total_seconds() * 1000

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

    # survey recipient email
    email = ndb.StringProperty(required=True)
    # EIS key that ties this survey to the corresponding EIS survey
    eis_id = ndb.StringProperty(required=True)
    # The time that the NBL run finished
    nbl_finish_timestamp = ndb.DateTimeProperty(required=True)
    # The time the survey was complete
    survey_complete_timestamp = ndb.DateTimeProperty()
    # The time the survey is due to be sent to use
    survey_send_time = ndb.DateTimeProperty(required=True)
    # Track the number of times it's been sent to the user
    send_count = ndb.IntegerProperty(default=0)
    # Tracks whether the results have successfully been mailed or downloaded
    results_reported = ndb.BooleanProperty(default=False)
    # track the last time the survey was sent
    last_sent = ndb.DateTimeProperty()
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

    # Creates a dictionary of all properties for serialization to client
    def jsonify(self, include_sensitive=False):
        obj = {
            'eisId': self.eis_id,
            # Convert dates appropriately
            'nblFinishTimestamp': get_timestamp(self.nbl_finish_timestamp),
            'surveyCompleteTimestamp': get_timestamp(self.survey_complete_timestamp),
            'firstName': self.first_name,
        }

        # Check if we want to include sensitive info
        if include_sensitive:
            obj['email'] = self.email

        obj['questions'] = {
            'exposure': self.other_exposure,
            'pain': self.pain,
            'pain-medattention': self.pain_medattention,
            'pain-activitychange': self.pain_activitychange,
            'pain-suitperformance': self.pain_suitperformance,
            'pain-suitperformance-duration': self.pain_suitperformance_duration,
            'fingernails': self.fingernails,
            'treatments': self.treatments
        }
        # Add body parts
        obj['bodyparts'] = {}
        for bodypart in self.bodyparts:
            name = bodypart.name
            obj['bodyparts'][name] = {
                'affected': bodypart.affected,
                'location': bodypart.location,
                'pain': bodypart.pain,
                'irritation': bodypart.irritation_or_hotspot,
                'numbness': bodypart.numbness_or_tingling,
                'bruises': bodypart.bruises_or_discoloration,
                'cuts': bodypart.cuts_or_abrasions,
                'comments': bodypart.comments
            }
        return obj

    def update_from_json(self, j):
        # timestamp completion
        self.survey_complete_timestamp = datetime.now()

        # Update questions
        question_data = j.get('questions')
        self.other_exposure = question_data.get('exposure')
        self.pain = question_data.get('pain')
        self.pain_medattention = question_data.get('pain-medattention')
        self.pain_activitychange = question_data.get('pain-activitychange')
        self.pain_suitperformance = question_data.get('pain-suitperformance')
        self.pain_suitperformance_duration = question_data.get('pain-suitperformance-duration')
        self.fingernails = question_data.get('fingernails')
        self.treatments = question_data.get('treatments', [])

        # now update bodyparts
        bodyparts_data = j.get('bodyparts')
        for part in self.bodyparts:
            if (part.name in bodyparts_data):
                part_data = bodyparts_data[part.name]
                part.affected = part_data.get('affected')
                part.location = part_data.get('location')
                part.pain = part_data.get('pain')
                part.irritation_or_hotspot = part_data.get('irritation')
                part.numbness_or_tingling = part_data.get('numbness')
                part.bruises_or_discoloration = part_data.get('bruises')
                part.cuts_or_abrasions = part_data.get('cuts')
                part.comments = part_data.get('comments')

