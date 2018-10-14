# [START app]
import logging

# [START imports]
from flask import Flask, request
from survey import Survey
from datetime import datetime, timedelta
# [END imports]

# [START create_app]
app = Flask(__name__)
# [END create_app]


""" Creates a new survey entry to be sent out later """
@app.route('/api/survey/create', methods=['POST'])
def createSurvey():
    # Get data required to create a survey
    nbl_finish_time = int(request.form['nblFinishTime'])
    survey_send_delay = int(request.form['surveySendDelay'])
    first_name = request.form['firstName']

    # Calculate survey send time
    # Convert times
    # javascript timestamps are in milliseconds so divide
    nbl_time = datetime.fromtimestamp(nbl_finish_time / 1000)
    survey_send_time = nbl_time + timedelta(hours=survey_send_delay)
    survey = Survey(first_name=first_name,
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