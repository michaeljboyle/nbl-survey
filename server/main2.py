# [START app]
import logging

# [START imports]
from flask import Flask, request
from google.appengine.ext import ndb
from google.appengine.api import mail
from survey import Survey
from settings import Settings
from datetime import datetime, timedelta
from pytz import timezone
import json
# [END imports]

# [START create_app]
app = Flask(__name__)
# [END create_app]


SURVEY_EMAIL = """{}:

Please complete this 30-second survey about your recent suit exposure at the NBL.

Thank you!

Link: {}"""


# Returns the GMT input date as a Central time (CST/CDT) output date
def to_central_time(dt):
    utc_time = timezone('UTC').localize(dt)
    return utc_time.astimezone(timezone('America/Chicago'))


@app.route('/api/survey/<survey_id>', methods=['GET', 'POST'])
def survey(survey_id):
    # GET is a fetch
    if request.method == 'GET':
        survey = ndb.Key(urlsafe=survey_id).get()
        return json.dumps(survey.jsonify())

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
    email_sender_address = Settings.get('email_sender_address')
    survey_link_base_url = Settings.get('survey_link_base_url')
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
        link = survey_link_base_url + survey.key.urlsafe()
        # mail it
        mail.send_mail(sender=email_sender_address,
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
    email_sender_address = Settings.get('email_sender_address')
    survey_admin_email = Settings.get('survey_admin_email')

    toSend = Survey.query(Survey.results_reported == False,
                          Survey.survey_complete_timestamp != None).fetch()

    if len(toSend) == 0:
        return 'no surveys to send'

    survey_strs = []
    for survey in toSend:
        # convert dates to readable dates. Divide by 1000 b/c javascript
        # stamps in milliseconds and we want this back to python format
        nbl_str_time = to_central_time(
                survey.nbl_finish_timestamp).strftime('%m/%d/%Y %H:%M')
        complete_str_time = to_central_time(
                survey.survey_complete_timestamp).strftime('%m/%d/%Y %H:%M')
        survey_data = survey.jsonify(include_sensitive=True)
        # Using jsonify gave us timestamps so we want to reset those to the 
        # human readable strings we just created
        survey_data['nblFinishTimestamp'] = nbl_str_time
        survey_data['surveyCompleteTimestamp'] = complete_str_time
        j = json.dumps(survey_data, indent=4)
        logging.info('adding new survey string to list \n\n' + j)
        survey_strs.append(j)

    logging.info('about to concat')
    body = '\n\n\n\n'.join(survey_strs)
    logging.info('the length of the body of email is %s' % str(len(body)))
    logging.info(body)

    mail.send_mail(sender=email_sender_address,
                   to=survey_admin_email,
                   subject="NBL survey data", body=body)
    
    reported_keys = []
    for survey in toSend:
        survey.results_reported = True
        reported_keys.append(survey.put().urlsafe())
    return json.dumps(reported_keys)


@app.route('/admin/settings')
def initSettings():
    # Initializes settings or returns if already all initialized
    email_sender_address = Settings.get('email_sender_address')
    survey_admin_email = Settings.get('survey_admin_email')
    survey_link_base_url = Settings.get('survey_link_base_url')

    return_str = """
        email_sender_address: {}\n
        survey_admin_email: {}\n
        survey_link_base_url: {}\n
        """.format(email_sender_address, survey_admin_email,
                   survey_link_base_url)

    return return_str


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]