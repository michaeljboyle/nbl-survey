# [START app]
import logging

# [START imports]
from flask import Flask, request
from google.appengine.ext import ndb
from google.appengine.api import mail
from survey import Survey
from datetime import datetime, timedelta
import json
# [END imports]

# [START create_app]
app = Flask(__name__)
# [END create_app]

EMAIL_SENDER_ADDRESS = 'nbl-suit-exposure-survey@nbl-survey.appspotmail.com'
SURVEY_LINK_BASE_URL = 'https://nbl-survey.appspot.com/#!/survey/'
SURVEY_ADMINISTRATOR_EMAIL = 'mboyle88@gmail.com'

SURVEY_EMAIL = """
{}:

Please complete this 30-second survey about your recent
suit exposure at the NBL. Thank you!

Link: {}"""

def send_json(r, indent=0):
    def date_converter(dt):
        t0 = datetime(1970, 1, 1)
        if isinstance(dt, datetime):
            logging.info(dt)
            timestamp = (dt - t0).total_seconds() * 1000  # for time in ms
            logging.info(timestamp)
            return timestamp
    # self.response.headers['content-type'] = 'text/plain'
    return json.dumps(r, default=date_converter, indent=indent)


@app.route('/api/survey/<survey_id>', methods=['GET', 'POST'])
def survey(survey_id):
    # GET is a fetch
    if request.method == 'GET':
        survey = ndb.Key(urlsafe=survey_id).get()
        return send_json(survey.jsonify())

    # POST is an update/save
    if request.method == 'POST':
        data = json.loads(request.data)
        logging.info(data)
        survey = ndb.Key(urlsafe=survey_id).get()
        
        survey.update_from_json(data)
        return survey.put().urlsafe()


""" Creates a new survey entry to be sent out later """
@app.route('/api/survey/create', methods=['POST'])
def createSurvey():
    # Get data required to create a survey
    data = json.loads(request.data)
    logging.info(data)
    eis_id = data['eisId']
    nbl_finish_time = int(data['nblFinishTime'])
    survey_send_delay = int(data['surveySendDelay'])
    first_name = data['firstName']
    email = data['email']

    # Calculate survey send time
    # Convert times
    # javascript timestamps are in milliseconds so divide
    nbl_time = datetime.fromtimestamp(nbl_finish_time / 1000)
    survey_send_time = nbl_time + timedelta(hours=survey_send_delay)
    survey = Survey(eis_id=eis_id,
                    first_name=first_name,
                    nbl_finish_timestamp=nbl_time,
                    survey_send_time=survey_send_time,
                    email=email)
    survey.set_defaults()
    return survey.put().urlsafe()


@app.route('/api/test')
def createDummy():
    survey = Survey(eis_id='123',
                    first_name='Michael',
                    nbl_finish_timestamp=datetime.fromtimestamp(1539546879),
                    survey_send_time=datetime.fromtimestamp(1539719679))
    survey.set_defaults()
    return survey.put().urlsafe()


""" The following are scheduled tasks, not meant to be called by a user
"""
@app.route('/tasks/send-surveys')
def sendSurveys():
    # first get surveys with survey_send_time < now AND
    # last_sent == null
    now = datetime.now()
    logging.info(now)
    # Currently only send to those who are due to be reminded AND have NOT
    # completed it AND have never received an email about this nbl run 
    toSend = Survey.query(Survey.survey_send_time < now,
                          Survey.send_count == 0,
                          Survey.survey_complete_timestamp == None).fetch()
    logging.info('About to send %s emails' % len(toSend))
    sent_keys = []
    for survey in toSend:
        # create a link to the survey
        link = SURVEY_LINK_BASE_URL + survey.key.urlsafe()
        # mail it
        mail.send_mail(sender=EMAIL_SENDER_ADDRESS,
                       to="%s <%s>" % (survey.first_name, survey.email),
                       subject="30-second NBL survey about your recent suit exposure",
                       body=SURVEY_EMAIL.format(survey.first_name, link))
        
        # mark it as sent with a timestamp
        survey.last_sent = datetime.now()
        # increment number times sent
        survey.send_count += 1
        # save it
        sent_keys.append(survey.put().urlsafe())
    logging.info('Sent the following keys: ')
    logging.info(sent_keys)
    return json.dumps(sent_keys)

# Task that will send email to survey administrator with latest data
@app.route('/tasks/send-results')
def sendResults():
    toSend = Survey.query(Survey.results_reported == False,
                          Survey.survey_complete_timestamp != None).fetch()
    jsons = []
    for survey in toSend:
        j = send_json(survey.jsonify(include_sensitive=True), indent=4)
        # convert dates to readable dates. Divide by 1000 b/c javascript
        # stamps in milliseconds and we want this back to python format
        nbl_time = datetime.fromtimestamp(j['nblFinishTimestamp'] / 1000)
        j['nblFinishTimestamp'] = nbl_time.strftime('%m/%d/%Y %H:%M')
        complete_time = datetime.fromtimestamp(j['surveyCompleteTimestamp'] / 1000)
        j['surveyCompleteTimestamp'] = complete_time.strftime('%m/%d/%Y %H:%M')
        jsons.append(j)
    body = '\n\n\n\n'.join(jsons)
    logging.info(body)
    mail.send_mail(sender=EMAIL_SENDER_ADDRESS,
                       to=SURVEY_ADMINISTRATOR_EMAIL,
                       subject="NBL survey data",
                       body=jsons)
    return 'success'


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]