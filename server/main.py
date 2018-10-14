# [START app]
import logging

# [START imports]
from flask import Flask, request
from google.appengine.ext import ndb
from survey import Survey
from datetime import datetime, timedelta
import json
# [END imports]

# [START create_app]
app = Flask(__name__)
# [END create_app]


def send_json(r):
    def date_converter(dt):
        t0 = datetime(1970, 1, 1)
        if isinstance(dt, datetime):
            logging.info(dt)
            timestamp = (dt - t0).total_seconds() * 1000  # for time in ms
            logging.info(timestamp)
            return timestamp
    # self.response.headers['content-type'] = 'text/plain'
    return json.dumps(r, default=date_converter)


@app.route('/api/survey/<survey_id>', methods=['GET', 'POST'])
def survey(survey_id):
    # GET is a fetch
    if request.method == 'GET':
        survey = ndb.Key(urlsafe=survey_id).get()
        return send_json(survey.jsonify())

    if request.method == 'POST':
        data = json.loads(request.form['data'])
        survey = ndb.Key(urlsafe=survey_id).get()
        
        survey.update_from_json(data)
        return survey.put().urlsafe()


""" Creates a new survey entry to be sent out later """
@app.route('/api/survey/create', methods=['POST'])
def createSurvey():
    # Get data required to create a survey
    data = json.loads(request.form['data'])
    eis_id = data['eisId']
    nbl_finish_time = int(data['nblFinishTime'])
    survey_send_delay = int(data['surveySendDelay'])
    first_name = data['firstName']

    # Calculate survey send time
    # Convert times
    # javascript timestamps are in milliseconds so divide
    nbl_time = datetime.fromtimestamp(nbl_finish_time / 1000)
    survey_send_time = nbl_time + timedelta(hours=survey_send_delay)
    survey = Survey(eis_id=eis_id,
                    first_name=first_name,
                    nbl_finish_timestamp=nbl_time,
                    survey_send_time=survey_send_time)
    survey.set_defaults()
    return survey.put().urlsafe()


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]