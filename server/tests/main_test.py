# [START imports]
import unittest

from google.appengine.api import memcache
from google.appengine.ext import ndb
from google.appengine.ext import testbed

from survey import Survey
from main import app

from datetime import datetime, timedelta
import json
# [END imports]


# [START datastore_example_test]
class SurveyTestCase(unittest.TestCase):

    def setUp(self):
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()
        # Clear ndb's in-context cache between tests.
        # This prevents data from leaking between tests.
        # Alternatively, you could disable caching by
        # using ndb.get_context().set_cache_policy(False)
        ndb.get_context().clear_cache()

# [END datastore_example_test]

    # [START datastore_example_teardown]
    def tearDown(self):
        self.testbed.deactivate()
    # [END datastore_example_teardown]

    # # [START datastore_example_insert]
    # def testSetDefaults(self):
    #     s = Survey()
    #     s.set_defaults()
    #     s.put()
    #     self.assertEqual(1, len(Survey.query().fetch(2)))
    # [END datastore_example_insert]

    # [START datastore_example_insert]
    def testSetDefaults(self):
        s = Survey()
        s.set_defaults()
        self.assertEqual(16, len(s.bodyparts))


    def testJsonify(self):
        s = Survey(eis_id = 'a', first_name='b',
                   nbl_finish_timestamp=datetime.now(),
                   survey_send_time=datetime.now() + timedelta(hours=24))
        s.set_defaults()
        j = s.jsonify()
        self.assertIn('head', j['bodyparts'])
        self.assertIn('cuts', j['bodyparts']['head'])

# [START datastore_example_test]
class ApiTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()
        # Clear ndb's in-context cache between tests.
        # This prevents data from leaking between tests.
        # Alternatively, you could disable caching by
        # using ndb.get_context().set_cache_policy(False)
        ndb.get_context().clear_cache()

# [END datastore_example_test]

    # [START datastore_example_teardown]
    def tearDown(self):
        self.testbed.deactivate()
    # [END datastore_example_teardown]

    # [START datastore_example_insert]
    def testCreateSurvey(self):
        time = 1500000000000
        delay = 24 # hours
        first_name = 'f'
        eis_id = '123'
        expectedSendTime = datetime.fromtimestamp((time + delay * 60 * 60 * 1000)/1000)
        data = {
            'eisId': eis_id,
            'firstName': first_name,
            'nblFinishTime': time,
            'surveySendDelay': delay
        }
        response = self.app.post('/api/survey/create', data=data)

        self.assertEqual(response.status_code, 200)
        # Should have saved that survey, so get it now and check it
        s = Survey.query().fetch(1)[0]
        self.assertEqual(s.eis_id, eis_id)
        self.assertEqual(s.first_name, first_name)
        self.assertEqual(s.nbl_finish_timestamp, datetime.fromtimestamp(time / 1000))
        self.assertEqual(s.survey_send_time, expectedSendTime)

    def testFetchSurvey(self):
        # First create one
        s = Survey(eis_id = 'a', first_name='b',
                   nbl_finish_timestamp=datetime.now(),
                   survey_send_time=datetime.now() + timedelta(hours=24))
        s.set_defaults()
        key = s.put().urlsafe()
        response = self.app.get('/api/survey/%s' % key)
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['eisId'], 'a')

        

