import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { convertUnitToSubUnit, unitDivisor } from '../../util/currency';
import {
  addTime,
  daysBetween,
  getExclusiveEndDate,
  getStartOf,
  parseDateFromISO8601,
  subtractTime,
} from '../../util/dates';
import { isOriginInUse } from '../../util/search';
import { parse } from '../../util/urlHelpers';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 12 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 20;

// ================ Action types ================ //

export const WISHLIST_LISTING_REQUEST = 'app/MyWishlistPage/WISHLIST_LISTING_REQUEST';
export const WISHLIST_LISTING_SUCCESS = 'app/MyWishlistPage/WISHLIST_LISTING_SUCCESS';
export const WISHLIST_LISTING_ERROR = 'app/MyWishlistPage/WISHLIST_LISTING_ERROR';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  queryParams: {},
  queryInProgress: false,
  wishlistListingError: null,
  wishlistListingIds: [],
};

const resultIds = data => data.map(l => l.id);
const MyWishlistPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case WISHLIST_LISTING_REQUEST:
      return {
        ...state,
        queryInProgress: true,
        wishlistListingError: null,
      };
    case WISHLIST_LISTING_SUCCESS:
      return { ...state, queryInProgress: false, wishlistListingIds: payload };

    case WISHLIST_LISTING_ERROR:
      return { ...state, queryInProgress: false, wishlistListingError: payload };

    default:
      return state;
  }
};

export default MyWishlistPageReducer;

// ================ Action creators ================ //

export const wishlistListingRequest = queryParams => ({
  type: WISHLIST_LISTING_REQUEST,
  payload: queryParams,
});

export const wishlistListingSuccess = listingIds => ({
  type: WISHLIST_LISTING_SUCCESS,
  payload: listingIds,
});

export const wishlistListingError = e => ({
  type: WISHLIST_LISTING_ERROR,
  error: true,
  payload: e,
});

export const searchListings = (searchParams, config) => async (dispatch, getState, sdk) => {
  dispatch(wishlistListingRequest(searchParams));
  const searchValidListingTypes = listingTypes => {
    return config.listing.enforceValidListingType
      ? {
          pub_listingType: listingTypes.map(l => l.listingType),
        }
      : {};
  };

  const priceSearchParams = priceParam => {
    const inSubunits = value => convertUnitToSubUnit(value, unitDivisor(config.currency));
    const values = priceParam ? priceParam.split(',') : [];
    return priceParam && values.length === 2
      ? {
          price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
        }
      : {};
  };

  const datesSearchParams = datesParam => {
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
      hasValues && isNightlyMode
        ? endRaw
        : hasValues
        ? getExclusiveEndDate(endRaw, searchTZ)
        : null;

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
    // return hasDatesFilterInUse ? {} : { minStock: 1, stockMode: 'match-undefined' };
  };

  const { perPage, price, dates, sort, ...rest } = searchParams;
  const priceMaybe = priceSearchParams(price);
  const datesMaybe = datesSearchParams(dates);
  const stockMaybe = stockFilters(datesMaybe);
  const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };
  await dispatch(fetchCurrentUser());
  const { currentUser } = getState().user;
  const { wishListItems = []} =
    (!!currentUser?.id && currentUser?.attributes?.profile?.protectedData) || {};

  const params = {
    ids: wishListItems ?? [],
    ...rest,
    ...priceMaybe,
    ...datesMaybe,
    ...stockMaybe,
    ...sortMaybe,
    ...searchValidListingTypes(config.listing.listingTypes),
    perPage,
  };

  try {
    const response = await sdk.listings.query(params);
    const listingFields = config?.listing?.listingFields;
    const sanitizeConfig = { listingFields };

    dispatch(addMarketplaceEntities(response, sanitizeConfig));
    const listingIds = response.data.data?.map(item => item.id);
    dispatch(wishlistListingSuccess(listingIds));
    return response;
  } catch (e) {
    dispatch(wishlistListingError(storableError(e)));
    throw e;
  }
};

export const loadData = (params, search, config) => {
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

  return searchListings(
    {
      ...rest,
      ...originMaybe,
      page,
      perPage: RESULT_PAGE_SIZE,
      include: ['author', 'images', "currentStock"],
      'fields.listing': ['title', 'geolocation', 'price', 'publicData'],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName', 'profile.publicData'],
      'fields.image': [
        'variants.scaled-small',
        'variants.scaled-medium',
        `variants.${variantPrefix}`,
        `variants.${variantPrefix}-2x`,
      ],
      ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
      ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
      'limit.images': 1,
    },
    config
  );
};
