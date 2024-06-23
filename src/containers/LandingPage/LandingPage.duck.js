import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { parse } from '../../util/urlHelpers';
import { isOriginInUse } from '../../util/search';
import { convertUnitToSubUnit, unitDivisor } from '../../util/currency';
import {
  addTime,
  daysBetween,
  getExclusiveEndDate,
  getStartOf,
  parseDateFromISO8601,
  subtractTime,
} from '../../util/dates';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { storableError } from '../../util/errors';
import { searchListings } from '../SearchPage/SearchPage.duck';
import { CLOTHING, PHONES_ACCESSORIES } from '../../util/types';
import { getAllUsers, getOwnListings, getShowListings, getUpdateUser } from '../../util/api';
export const ASSET_NAME = 'landing-page';
import { types as sdkTypes } from '../../util/sdkLoader';

const { UUID } = sdkTypes;

const searchValidListingTypes = (listingTypes, config) => {
  return config.listing.enforceValidListingType
    ? {
        pub_listingType: listingTypes.map(l => l.listingType),
      }
    : {};
};

const priceSearchParams = (priceParam, config) => {
  const inSubunits = value => convertUnitToSubUnit(value, unitDivisor(config.currency));
  const values = priceParam ? priceParam.split(',') : [];
  return priceParam && values.length === 2
    ? {
        price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
      }
    : {};
};

const datesSearchParams = (datesParam, config) => {
  const searchTZ = 'Etc/UTC';
  const datesFilter = config.search.defaultFilters.find(f => f.key === 'dates');
  const values = datesParam ? datesParam.split(',') : [];
  const hasValues = datesFilter && datesParam && values.length === 2;
  const { dateRangeMode, availability } = datesFilter || {};
  const isNightlyMode = dateRangeMode === 'night';
  const isEntireRangeAvailable = availability === 'time-full';
  const getProlongedStart = date => subtractTime(date, 14, 'hours', searchTZ);
  const getProlongedEnd = date => addTime(date, 12, 'hours', searchTZ);

  const startDate = hasValues ? parseDateFromISO8601(values[0], searchTZ) : null;
  const endRaw = hasValues ? parseDateFromISO8601(values[1], searchTZ) : null;
  const endDate =
    hasValues && isNightlyMode ? endRaw : hasValues ? getExclusiveEndDate(endRaw, searchTZ) : null;

  const today = getStartOf(new Date(), 'day', searchTZ);
  const possibleStartDate = subtractTime(today, 14, 'hours', searchTZ);
  const hasValidDates =
    hasValues &&
    startDate.getTime() >= possibleStartDate.getTime() &&
    startDate.getTime() <= endDate.getTime();

  const dayCount = isEntireRangeAvailable ? daysBetween(startDate, endDate) : 1;
  const day = 1440;
  const hour = 60;

  const minDuration = isEntireRangeAvailable ? dayCount * day - hour : hour;
  return hasValidDates
    ? {
        start: getProlongedStart(startDate),
        end: getProlongedEnd(endDate),
        availability: 'time-partial',
        minDuration,
      }
    : {};
};

const stockFilters = datesMaybe => {
  const hasDatesFilterInUse = Object.keys(datesMaybe).length > 0;
  return hasDatesFilterInUse ? {} : { minStock: 1, stockMode: 'match-undefined' };
};

export const SEARCH_LISTINGS_REQUEST = 'app/LandingPage/SEARCH_LISTINGS_REQUEST';
export const SEARCH_LISTINGS_SUCCESS = 'app/LandingPage/SEARCH_LISTINGS_SUCCESS';
export const SEARCH_LISTINGS_ERROR = 'app/LandingPage/SEARCH_LISTINGS_ERROR';
export const SEARCH_DISCOVER_LISTINGS_SUCCESS = 'app/LandingPage/SEARCH_DISCOVER_LISTINGS_SUCCESS';
export const SEARCH_BEFORE_GONE_LISTINGS_SUCCESS =
  'app/LandingPage/SEARCH_BEFORE_GONE_LISTINGS_SUCCESS';

export const USER_DATA_REQUEST = 'app/LandingPage/USER_DATA_REQUEST';
export const USER_DATA_SUCCESS = 'app/LandingPage/USER_DATA_SUCCESS';
export const USER_DATA_ERROR = 'app/LandingPage/USER_DATA_ERROR';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  searchParams: null,
  searchInProgress: false,
  searchListingsError: null,
  landingPageResultIds: [],
  beforeGoneListingResultIds: [],
  discoverListingResultIds: [],
  userDataInProgress: false,
  userDataError: null,
  userData: [],
  userProducts: [],
};

const resultIds = data => data.data.map(l => l.id);

const listingPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case USER_DATA_REQUEST:
      return {
        ...state,
        userDataInProgress: true,
      };
    case USER_DATA_SUCCESS:
      return {
        ...state,
        userDataInProgress: false,
        userData: payload.response,
        userProducts: payload.data,
      };
    case USER_DATA_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, userDataInProgress: false, userDataError: payload };

    case SEARCH_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_SUCCESS:
      return {
        ...state,
        landingPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case SEARCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchInProgress: false, searchListingsError: payload };
    case SEARCH_DISCOVER_LISTINGS_SUCCESS:
      return {
        ...state,
        discoverListingResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case SEARCH_BEFORE_GONE_LISTINGS_SUCCESS:
      return {
        ...state,
        beforeGoneListingResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };

    default:
      return state;
  }
};

export default listingPageReducer;

// ================ Action creators ================ //

export const searchListingsRequest = searchParams => ({
  type: SEARCH_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const searchListingsSuccess = response => ({
  type: SEARCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const discoverListingsSuccess = response => ({
  type: SEARCH_DISCOVER_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const beforeGoneListingsSuccess = response => ({
  type: SEARCH_BEFORE_GONE_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchListingsError = e => ({
  type: SEARCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const userDataRequest = () => ({
  type: USER_DATA_REQUEST,
});

export const userDataSuccess = (response, data) => ({
  type: USER_DATA_SUCCESS,
  payload: { response, data },
});

export const userDataError = e => ({
  type: USER_DATA_ERROR,
  error: true,
  payload: e,
});

export const fetchListings = (searchParams, config) => async (dispatch, getState, sdk) => {
  try {
    dispatch(searchListingsRequest(searchParams));
    const { perPage, price, dates, sort, ...rest } = searchParams;
    const priceMaybe = priceSearchParams(price, config);
    const datesMaybe = datesSearchParams(dates, config);
    const stockMaybe = stockFilters(datesMaybe);
    const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };
    const params = {
      ...rest,
      ...priceMaybe,
      ...datesMaybe,
      ...stockMaybe,
      // ...sortMaybe,
      ...searchValidListingTypes(config.listing.listingTypes, config),
      perPage,
    };

    const response = await sdk.listings.query(params);
    const listingFields = config?.listing?.listingFields;
    const sanitizeConfig = { listingFields };

    dispatch(addMarketplaceEntities(response, sanitizeConfig));
    dispatch(searchListingsSuccess(response));
    return response;
  } catch (error) {
    dispatch(searchListingsError(storableError(error)));
    throw error;
  }
};

export const fetchDiscoverListings = (searchParams, config) => async (dispatch, getState, sdk) => {
  try {
    dispatch(searchListingsRequest(searchParams));
    const { perPage, price, dates, sort, ...rest } = searchParams;
    const priceMaybe = priceSearchParams(price, config);
    const datesMaybe = datesSearchParams(dates, config);
    const stockMaybe = stockFilters(datesMaybe);
    const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };

    const params = {
      ...rest,
      ...priceMaybe,
      ...datesMaybe,
      ...stockMaybe,
      ...sortMaybe,
      ...searchValidListingTypes(config.listing.listingTypes, config),
      perPage,
    };

    const response = await sdk.listings.query({
      ...params,
      pub_subCategory: searchParams?.tabName,
    });
    const listingFields = config?.listing?.listingFields;
    const sanitizeConfig = { listingFields };
    dispatch(addMarketplaceEntities(response, sanitizeConfig));
    dispatch(discoverListingsSuccess(response));
    return response;
  } catch (error) {
    dispatch(searchListingsError(storableError(error)));
    throw error;
  }
};

export const fetchBeforeGoneListings = (searchParams, config) => async (
  dispatch,
  getState,
  sdk
) => {
  try {
    dispatch(searchListingsRequest(searchParams));
    const { perPage, price, dates, sort, ...rest } = searchParams;
    const priceMaybe = priceSearchParams(price, config);
    const datesMaybe = datesSearchParams(dates, config);
    const stockMaybe = stockFilters(datesMaybe);
    const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };

    const params = {
      ...rest,
      ...priceMaybe,
      ...datesMaybe,
      ...stockMaybe,
      // ...sortMaybe,
      ...searchValidListingTypes(config.listing.listingTypes, config),
      perPage,
    };

    const response = await sdk.listings.query(params);
    const listingFields = config?.listing?.listingFields;
    const sanitizeConfig = { listingFields };
    dispatch(addMarketplaceEntities(response, sanitizeConfig));
    dispatch(beforeGoneListingsSuccess(response));
    return response;
  } catch (error) {
    dispatch(searchListingsError(storableError(error)));
    throw error;
  }
};

export const fetchUsersData = () => async (dispatch, getState, sdk) => {
  try {
    dispatch(userDataRequest());

    const result = await getAllUsers({});
    if (result) {
      // Define a function to fetch listings for an element
      const fetchListingsForElement = async element => {
        const listingsArray = [];
        const response = await sdk.listings.query({
          authorId: element.id.uuid,
          include: ['author'],
        });

        const totalPages = response.data.meta.totalPages;

        // Fetch listings for each page
        for (let page = 1; page <= totalPages; page++) {
          const responsePerPage = await sdk.listings.query({
            authorId: element.id.uuid,
            include: ['author'],
            page: page,
          });
          listingsArray.push(...responsePerPage.data.data);
        }

        return listingsArray;
      };

      // Use Promise.all to asynchronously fetch listings for all elements
      const fetchListingsPromises = result.map(fetchListingsForElement);

      // Wait for all promises to resolve
      const allListings = await Promise.all(fetchListingsPromises);

      // Concatenate all listings arrays into a single array
      const combinedListings = allListings.reduce((acc, curr) => acc.concat(curr), []);

      // Dispatch userDataSuccess with the combined listings array
      // dispatch(userDataSuccess(result, combinedListings));
    }
  } catch (error) {
    dispatch(userDataError(storableError(error)));
    throw error;
  }
};

// export const fetchCartlength = () => async (dispatch, getState, sdk) => {
//   try {
//     const userId = getState()?.user?.currentUser?.id?.uuid;
//     let cartItems =
//       getState()?.user?.currentUser?.attributes?.profile?.protectedData?.cartItems ?? [];

//     // Clone the cartItems array

//     let newCartItems = cartItems.length > 0 && [...cartItems];
//     if (cartItems.length > 0) {
//       for (let id of cartItems) {
//         const listing = await getShowListings({ id });
//         const isDeleted = listing?.data?.data?.attributes?.publicData?.isDeleted === true;
//         if (isDeleted) {
//           newCartItems = newCartItems.filter(itemId => itemId !== id);
//         }
//       }
//     }

//     const param = {
//       userId: userId,
//       payload: {
//         protectedData: { cartItems: newCartItems },
//       },
//     };

//     newCartItems?.length > 0 && await getUpdateUser(param);
//   } catch (error) {
//     throw error;
//   }
// };

export const loadData = (params, search, config) => async dispatch => {
  const { subCategory } = params;
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  const queryParams = parse(search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const { page = 1, address, origin, ...rest } = queryParams;
  const originMaybe = isOriginInUse(config) && origin ? { origin } : {};
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;
  const searchParams = {
    ...rest,
    ...originMaybe,
    page,
    perPage: 100,
    include: ['author', 'images'],
    'fields.listing': ['title', 'geolocation', 'price', 'publicData'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
  };

  await dispatch(fetchPageAssets(pageAsset, true));
  const data = await dispatch(
    searchListings(
      { ...searchParams, pub_trendingListing: true, pub_businessListingUnavailable: false },
      config
    )
  );
  const res =
    data?.data?.data?.length < 10 &&
    (await dispatch(
      fetchListings(
        { ...searchParams, pub_trendingListing: false, pub_businessListingUnavailable: false },
        config
      )
    ));
  await dispatch(
    fetchDiscoverListings(
      {
        ...searchParams,
        tabName: 'phones-accessories',
        pub_businessListingUnavailable: false,
      },
      config
    )
  );
  await dispatch(
    fetchBeforeGoneListings({ ...searchParams, pub_businessListingUnavailable: false }, config)
  );
};
