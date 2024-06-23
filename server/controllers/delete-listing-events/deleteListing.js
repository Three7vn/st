const { getIntegrationSdk, getSdk } = require('../../api-util/sdk');
const isdk = getIntegrationSdk();
const nodeCron = require('node-cron');
const fs = require('fs');
const { handleError } = require('../../api-util/sdk');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);

const EVENT_TYPE_LISTING_DELETED = 'listing/deleted';
const EVENT_SOURCE_CONSOLE = 'source/console';

const handleDeleteListing = async event => {
  const { eventType, source, previousValues, resource: currentListing } = event.attributes;
  const response = currentListing;
  const ID = event?.attributes?.resourceId?.uuid;
  const indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX;
  try {
    if (EVENT_SOURCE_CONSOLE === source && eventType === EVENT_TYPE_LISTING_DELETED) {
      const index = client.initIndex(indexName);
      return index
        .deleteObjects([ID])
        .then(response => { })
        .catch(e => {
          console.error(e, '**** **** => e');
          handleError(res, e);
        });
    }
  } catch (error) {
    console.error(error, '**** **** => error');
    handleError(res, error);
  }
};

const stateFile = './notify-listing-delete.state';
// Start polling from current time on, when there's no stored state
const startTime = new Date();

const saveLastEventSequenceId = sequenceId => {
  try {
    fs.writeFileSync(stateFile, sequenceId.toString());
  } catch (err) {
    throw err;
  }
};

const loadLastEventSequenceId = () => {
  try {
    const data = fs.readFileSync(stateFile);
    return parseInt(data, 10);
  } catch (err) {
    return null;
  }
};

const deleteListingUpdateEvents = async () => {
  try {
    const lastSequenceId = loadLastEventSequenceId();

    const params = lastSequenceId
      ? { startAfterSequenceId: lastSequenceId }
      : { createdAtStart: startTime };
    const result = await isdk.events.query({
      ...params,
      eventTypes: EVENT_TYPE_LISTING_DELETED,
    });

    const events = result.data.data;
    const lastEvent = events[events.length - 1];
    if (lastEvent) saveLastEventSequenceId(lastEvent.attributes.sequenceId);
    for (const event of events) {
      await handleDeleteListing(event);
    }
    // return res.status(200).json({ status: 'OK', events });
  } catch (error) {
    // return res.status(500).json({ status: 'Error', error: error.message });
  }
};

const methods = {
  updateDeletedListing: (req, res) => {
    try {
      nodeCron.schedule('*/10 * * * * *', deleteListingUpdateEvents);
    } catch (error) {
      console.log(error, 'error');
      // res.status(500).json({ message: error.message });
    }
  },
};

module.exports = methods;
