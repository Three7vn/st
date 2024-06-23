const { getIntegrationSdk, getSdk } = require('../../api-util/sdk');
const isdk = getIntegrationSdk();
const nodeCron = require('node-cron');
const fs = require('fs');
const { types } = require('sharetribe-flex-integration-sdk');
const { handleError } = require('../../api-util/sdk');
const algoliasearch = require('algoliasearch');
const { UUID } = types;

const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY
);
const EVENT_TYPE_LISTING_UPDATED = 'listing/updated';
const EVENT_SOURCE_CONSOLE = 'source/console';
const stateFile = './notify-listing-update.state';
// Start polling from current time on, when there's no stored state
const startTime = new Date();

const capitalizeEachWord = text => {
  if (typeof text !== 'string' || text.length === 0) {
    return ''; // Return an empty string if input is invalid
  }

  // Split the string into an array of words
  const words = text.split(' ');

  // Capitalize the first letter of each word and join them back
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(' ');
};

const handleUpdateListing = event => {
  const indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX;
  const { eventType, source, previousValues, resource: currentListing } = event.attributes;
  const response = currentListing;
  const { id } = response;
  const { title, description, price, publicData, state } = response.attributes;
  const { state: previousState } = previousValues.attributes;
  const { productType, size, brand, color, algoliaPublished, style, material, ...restPublicData } =
    publicData || {};

  const styleObj = style ? { style: style?.label } : {};
  const materialObj = material ? { material: material?.label } : {};
  const authorId = response?.relationships?.author?.data?.id?.uuid;
  const listing = {
    objectID: id.uuid,
    title,
    description,
    price,
    brand: capitalizeEachWord(brand),
    productType: capitalizeEachWord(productType),
    ...styleObj,
    size: size?.label,
    color: color?.label,
    ...materialObj,
    state,
    authorId,
    ...restPublicData,
  };
  try {
    const index = client.initIndex(indexName);
    if (
      state === 'published' &&
      previousState === 'closed' &&
      eventType === EVENT_TYPE_LISTING_UPDATED &&
      source === EVENT_SOURCE_CONSOLE
    ) {
      return index
        .partialUpdateObjects([listing])
        .then(res => { })
        .catch(e => {
          console.error(e, '**** partialUpdateObjects **** => e');
          handleError(res, e);
        });

    } else if (
      state === 'closed' &&
      previousState === 'published' &&
      eventType === EVENT_TYPE_LISTING_UPDATED &&
      source === EVENT_SOURCE_CONSOLE
    ) {
      return index
        .partialUpdateObjects([listing])
        .then(res => { })
        .catch(e => {
          console.error(e, '**** partialUpdateObjects **** => e');
          handleError(res, e);
        });
    }
  } catch (err) {
    console.log('err :>> ', err);
  }
};

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

const updateListingUpdateEvents = async () => {
  try {
    const lastSequenceId = loadLastEventSequenceId();

    const params = lastSequenceId
      ? { startAfterSequenceId: lastSequenceId }
      : { createdAtStart: startTime };
    const result = await isdk.events.query({
      ...params,
      eventTypes: EVENT_TYPE_LISTING_UPDATED,
      expand: true,
    });

    const events = result.data.data;
    const lastEvent = events[events.length - 1];
    if (lastEvent) saveLastEventSequenceId(lastEvent.attributes.sequenceId);
    for (const event of events) {
      await handleUpdateListing(event);
    }
    // return res.status(200).json({ status: 'OK', events });
  } catch (error) {
    // return res.status(500).json({ status: 'Error', error: error.message });
  }
};

const methods = {
  updateAlgoliaListings: (req, res) => {
    try {
      nodeCron.schedule('*/10 * * * * *', updateListingUpdateEvents);
    } catch (error) {
      console.log(error, 'error');
      // res.status(500).json({ message: error.message });
    }
  },
};

module.exports = methods;
