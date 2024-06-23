import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { parse } from '../../util/urlHelpers';
import { getOwnListings } from '../../util/api';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 12 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 20;

// ================ Action types ================ //

export const CART_LISTING_REQUEST = 'app/CartPage/CART_LISTING_REQUEST';
export const CART_LISTING_SUCCESS = 'app/CartPage/CART_LISTING_SUCCESS';
export const CART_LISTING_ERROR = 'app/CartPage/CART_LISTING_ERROR';

export const AUTHOR_LISTINGS_SUCCESS = 'app/ListingPage/AUTHOR_LISTINGS_SUCCESS';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  queryParams: {},
  queryInProgress: false,
  cartListingError: null,
  userListingRefs: [],
  authorListings: {},
};

const resultIds = data => data.map(l => l.id);
const cartPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case CART_LISTING_REQUEST:
      return {
        ...state,
        queryInProgress: true,
        cartListingError: null,
      };
    case CART_LISTING_SUCCESS:
      return { ...state, queryInProgress: true, userListingRefs: payload };

    case CART_LISTING_ERROR:
      return { ...state, queryInProgress: false, cartListingError: payload };

    case AUTHOR_LISTINGS_SUCCESS:
      return { ...state, authorListings: { ...state.authorListings, ...payload } };

    default:
      return state;
  }
};

export default cartPageReducer;

// ================ Action creators ================ //

export const cartListingRequest = queryParams => ({
  type: CART_LISTING_REQUEST,
  payload: queryParams,
});

export const cartListingSuccess = listingRefs => ({
  type: CART_LISTING_SUCCESS,
  payload: listingRefs,
});

export const cartListingError = e => ({
  type: CART_LISTING_ERROR,
  error: true,
  payload: e,
});

export const authorListingsSuccess = response => ({
  type: AUTHOR_LISTINGS_SUCCESS,
  payload: response,
});

export const fetchAuthorListings = ({ authorId }) => async (dispatch, getState, sdk) => {
  try {
    const result = await sdk.listings.query({ authorId });
    if (result) {
      dispatch(authorListingsSuccess({ [`${authorId}`]: result?.data?.data?.length }));
    }
    return result;
  } catch (error) {}
};

export const searchListings = (ids, search, config) => async (dispatch, getState, sdk) => {
  dispatch(cartListingRequest());
  const queryParams = parse(search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });

  const { page = 1 } = queryParams;
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;

  const params = {
    ids,
    include: ['author', 'images', 'currentStock'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
    perPage: RESULT_PAGE_SIZE,
    page,
  };

  try {
    const response = await getOwnListings(params);

    const { data: { data = {} } = {} } = response || {};
    const listingRefs = !!data?.length && data?.map(({ id, type }) => ({ id, type }));
    dispatch(addMarketplaceEntities(response));
    dispatch(cartListingSuccess(listingRefs));

    return response;
  } catch (e) {
    dispatch(cartListingError(storableError(e)));
    throw e;
  }
};

export const loadData = (params, search, config) => async (dispatch, getState, sdk) => {
  try {
    await dispatch(fetchCurrentUser());
    const { currentUser } = getState()?.user;
    if (!currentUser) {
      return;
    }
    const { cartItems } = currentUser?.attributes?.profile?.protectedData || {};
    if (cartItems?.length > 0) {
      dispatch(searchListings(cartItems, search, config));
    }
  } catch (e) {
    dispatch(cartListingError(storableError(e)));
  }
};
