import { fetchCurrentUser } from '../../ducks/user.duck';
import { searchAlgoliaData } from '../../util/api';
import { parse } from '../../util/urlHelpers';
import { types as sdkTypes } from '../../util/sdkLoader';
const { UUID } = sdkTypes;
const RESULT_PAGE_SIZE = 24;

// ================ Action types ================ //

export const SEARCH_LISTINGS_REQUEST = 'app/AlgoliaSearchPage/SEARCH_LISTINGS_REQUEST';
export const SEARCH_LISTINGS_SUCCESS = 'app/AlgoliaSearchPage/SEARCH_LISTINGS_SUCCESS';
export const SEARCH_LISTINGS_ERROR = 'app/AlgoliaSearchPage/SEARCH_LISTINGS_ERROR';
export const ALGOLIA_SEARCH_RESULTS = 'app/AlgoliaSearchPage/ALGOLIA_SEARCH_RESULTS';

// ================ Reducer ================ //

const initialState = {
  searchParams: null,
  pagination: null,
  searchInProgress: false,
  searchListings: [],
  searchListingsError: null,
  algoliaSearchResults: [],
};

const listingPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case ALGOLIA_SEARCH_RESULTS:
      return {
        ...state,
        algoliaSearchResults: payload,
      };
    case SEARCH_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload,
        searchInProgress: true,
        pagination: null,
        searchListings: [],
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_SUCCESS:
      return {
        ...state,
        searchInProgress: false,
        pagination: payload.pagination,
        searchListings: payload.data,
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return {
        ...state,
        searchInProgress: false,
        searchListingsError: payload,
        searchListings: [],
        pagination: null,
      };

    default:
      return state;
  }
};

export default listingPageReducer;

// ================ Action creators ================ //

export const algoliasearchResults = data => ({
  type: ALGOLIA_SEARCH_RESULTS,
  payload: data,
});
export const searchListingsRequest = searchParams => ({
  type: SEARCH_LISTINGS_REQUEST,
  payload: searchParams,
});

export const searchListingsSuccess = response => ({
  type: SEARCH_LISTINGS_SUCCESS,
  payload: response,
});

export const searchListingsError = e => ({
  type: SEARCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchListings = searchParams => async (dispatch, getState, sdk) => {
  dispatch(searchListingsRequest(searchParams));
};

export const getAlgoliasearchResults = params => (dispatch, getState, sdk) => {
  try {
    dispatch(algoliasearchResults(params));
  } catch (error) {}
};

export const fetchAuthorData = ({ userId }) => async (dispatch, getState, sdk) => {
  try {
    const result = await sdk.users.show({ id: new UUID(userId) });
    return result?.data?.data;
  } catch (error) {}
};

export const loadData = (params, search, config) => (dispatch, getState, sdk) => {
  const queryParams = parse(search);
  const page = queryParams.page || 1;

  const searchParams = {
    ...queryParams,
    page,
    perPage: RESULT_PAGE_SIZE,
  };

  return Promise.all([dispatch(searchListings(searchParams), dispatch(fetchCurrentUser()))]);
};

// "_geoloc": {
//   "lat": 19.07609,
//   "lng": 72.877426
// }
