
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { createAlgoliaData, deleteAlgoliaData, getOwnListings } from '../../util/api';
import { updatedEntities, denormalisedEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { parse } from '../../util/urlHelpers';
import { fetchListings } from '../LandingPage/LandingPage.duck';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 42 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 10;

// ================ Action types ================ //

export const FETCH_LISTINGS_REQUEST = 'app/ManageListingsPage/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'app/ManageListingsPage/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_ERROR = 'app/ManageListingsPage/FETCH_LISTINGS_ERROR';

export const OPEN_LISTING_REQUEST = 'app/ManageListingsPage/OPEN_LISTING_REQUEST';
export const OPEN_LISTING_SUCCESS = 'app/ManageListingsPage/OPEN_LISTING_SUCCESS';
export const OPEN_LISTING_ERROR = 'app/ManageListingsPage/OPEN_LISTING_ERROR';

export const CLOSE_LISTING_REQUEST = 'app/ManageListingsPage/CLOSE_LISTING_REQUEST';
export const CLOSE_LISTING_SUCCESS = 'app/ManageListingsPage/CLOSE_LISTING_SUCCESS';
export const CLOSE_LISTING_ERROR = 'app/ManageListingsPage/CLOSE_LISTING_ERROR';

export const ADD_OWN_ENTITIES = 'app/ManageListingsPage/ADD_OWN_ENTITIES';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  queryParams: null,
  queryInProgress: false,
  queryListingsError: null,
  currentPageResultIds: [],
  ownEntities: {},
  openingListing: null,
  openingListingError: null,
  closingListing: null,
  closingListingError: null,
};

const resultIds = data => data.data.map(l => l.id);

const merge = (state, sdkResponse) => {
  const apiResponse = sdkResponse.data;
  return {
    ...state,
    ownEntities: updatedEntities({ ...state.ownEntities }, apiResponse),
  };
};

const updateListingAttributes = (state, listingEntity) => {

  const oldListing = state.ownEntities.ownListing[listingEntity.id.uuid];
  const updatedListing = { ...oldListing, attributes: listingEntity.attributes };
  const ownListingEntities = {
    ...state.ownEntities.ownListing,
    [listingEntity.id.uuid]: updatedListing,
  };
  return {
    ...state,
    ownEntities: { ...state.ownEntities, ownListing: ownListingEntities },
  };
};

const manageListingsPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_LISTINGS_REQUEST:
      return {
        ...state,
        queryParams: payload.queryParams,
        queryInProgress: true,
        queryListingsError: null,
        currentPageResultIds: [],
      };
    case FETCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        queryInProgress: false,
      };
    case FETCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, queryInProgress: false, queryListingsError: payload };

    case OPEN_LISTING_REQUEST:
      return {
        ...state,
        openingListing: payload.listingId,
        openingListingError: null,
      };
    case OPEN_LISTING_SUCCESS:
      return {
        ...state,
        openingListing: null,
      };
    case OPEN_LISTING_ERROR: {
      // eslint-disable-next-line no-console
      console.error(payload);
      return {
        ...state,
        openingListing: null,
        openingListingError: {
          listingId: state.openingListing,
          error: payload,
        },
      };
    }

    case CLOSE_LISTING_REQUEST:
      return {
        ...state,
        closingListing: payload.listingId,
        closingListingError: null,
      };
    case CLOSE_LISTING_SUCCESS:
      return {
        ...state,
        closingListing: null,
      };
    case CLOSE_LISTING_ERROR: {
      // eslint-disable-next-line no-console
      console.error(payload);
      return {
        ...state,
        closingListing: null,
        closingListingError: {
          listingId: state.closingListing,
          error: payload,
        },
      };
    }

    case ADD_OWN_ENTITIES:
      return merge(state, payload);

    default:
      return state;
  }
};

export default manageListingsPageReducer;

// ================ Selectors ================ //

/**
 * Get the denormalised own listing entities with the given IDs
 *
 * @param {Object} state the full Redux store
 * @param {Array<UUID>} listingIds listing IDs to select from the store
 */
export const getOwnListingsById = (state, listingIds) => {
  const { ownEntities } = state.ManageListingsPage;
  const resources = listingIds.map(id => ({
    id,
    type: 'listing',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(ownEntities, resources, throwIfNotFound);
};

// ================ Action creators ================ //

// This works the same way as addMarketplaceEntities,
// but we don't want to mix own listings with searched listings
// (own listings data contains different info - e.g. exact location etc.)
export const addOwnEntities = sdkResponse => ({
  type: ADD_OWN_ENTITIES,
  payload: sdkResponse,
});

export const openListingRequest = listingId => ({
  type: OPEN_LISTING_REQUEST,
  payload: { listingId },
});

export const openListingSuccess = response => ({
  type: OPEN_LISTING_SUCCESS,
  payload: response.data,
});

export const openListingError = e => ({
  type: OPEN_LISTING_ERROR,
  error: true,
  payload: e,
});

export const closeListingRequest = listingId => ({
  type: CLOSE_LISTING_REQUEST,
  payload: { listingId },
});

export const closeListingSuccess = response => ({
  type: CLOSE_LISTING_SUCCESS,
  payload: response.data,
});

export const closeListingError = e => ({
  type: CLOSE_LISTING_ERROR,
  error: true,
  payload: e,
});

export const queryListingsRequest = queryParams => ({
  type: FETCH_LISTINGS_REQUEST,
  payload: { queryParams },
});

export const queryListingsSuccess = response => ({
  type: FETCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const queryListingsError = e => ({
  type: FETCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

// Throwing error for new (loadData may need that info)
export const queryOwnListings = queryParams => (dispatch, getState, sdk) => {
  dispatch(queryListingsRequest(queryParams));

  const { perPage, ...rest } = queryParams;
  const params = { ...rest, perPage };

  return getOwnListings(params)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(queryListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(queryListingsError(storableError(e)));
      throw e;
    });
};

export const closeListing = listingId => (dispatch, getState, sdk) => {
  dispatch(closeListingRequest(listingId));

  return sdk.ownListings
    .close({ id: listingId }, { expand: true })
    .then(response => {
      deleteAlgoliaData({id: listingId.uuid}).then(()=>{
      })
      dispatch(fetchOwnListing())
      dispatch(closeListingSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(closeListingError(storableError(e)));
    });
};

export const updateListing = (listingId, payload) => (dispatch, getState, sdk) => {

  return sdk.ownListings
    .update({ id: listingId, ...payload })
    .then(response => {
      deleteAlgoliaData({id: listingId.uuid}).then(()=>{})
      dispatch(fetchOwnListing())
      return response;
    })
    .catch(e => {
      console.log('e :>> ', e);
    });
};

export const fetchOwnListing = () => async (dispatch, getState, sdk) => {
  const response = await sdk.ownListings.query({})
  if(!!response.data.data.length){
    const modifiedData = response.data.data
    .filter(item => item.attributes.publicData.isDeleted !== true)
    .map(item => {
      item.type = 'listing'
      return item
    })

    response.data.data = modifiedData;
  }
  dispatch(addMarketplaceEntities(response))
  dispatch(queryListingsSuccess(response));
}

export const openListing = listingId => async (dispatch, getState, sdk) => {
  dispatch(openListingRequest(listingId));

  return sdk.ownListings
    .open({ id: listingId }, { expand: true })
    .then(response => {
      const { currentUser } = getState().user;
      const {email} = currentUser.attributes;
      const id = response.data.data.id.uuid;
        const {
          firstName,
          lastName,
          displayName,
          publicData: userPublicData
        } = currentUser.attributes.profile;

        const {
          title = "",
          description = "",
          price,
          geolocation,
          availabilityPlan='',
          publicData = {}
        } = response.data.data.attributes || {};
          createAlgoliaData({
            objectID: id,
            _geoloc: geolocation && geolocation.lat ? { lat: geolocation.lat, lng: geolocation.lng } : {},
            title, description, price, availabilityPlan,
            ...publicData,
            user: { firstName, lastName, email, displayName, ...userPublicData }
          });
          dispatch(fetchOwnListing())
      dispatch(openListingSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(openListingError(storableError(e)));
    });
};

export const loadData = (params, search, config) => (dispatch, getState, sdk) => {
  const queryParams = parse(search);
  const page = queryParams.page || 1;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;

  return Promise.all([dispatch(fetchCurrentUser())])
    .then(response => {
      const authorId = getState().user?.currentUser?.id
      dispatch(queryOwnListings({
        ...queryParams,
        page,
        perPage: RESULT_PAGE_SIZE,
        include: ['images', 'currentStock', "author"],
        'fields.image': [`variants.${variantPrefix}`, `variants.${variantPrefix}-2x`],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
        'limit.images': 1,
        authorId: authorId?.uuid,
        pub_isDeleted: false,
      }));
      return response;
    })
    .catch(e => {
      throw e;
    });
};
