import React, { useState, useEffect } from 'react';
import qs from 'qs';
import {
  Hits,
  SortBy,
  useStats,
  Configure,
  HitsPerPage,
  InstantSearch,
  Highlight,
} from 'react-instantsearch';

import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { useHistory, useLocation } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import { bool, func, oneOf, object, shape, string, number } from 'prop-types';
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import AlgoliaFilterPanel from './AlgoliaFilterPanel';
import { propTypes } from '../../util/types';
import { withViewport } from '../../util/uiHelpers';
import loadable from '@loadable/component';
import { intlShape, useIntl } from '../../util/reactIntl';
import { Page, Modal } from '../../components';
import AlogoliaSearchCard from '../../components/AlogoliaSearchCard/AlogoliaSearchCard';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import { searchParamsPicker, createSearchResultSchema } from './AlgoliaSearchPage.helpers';
import { getAlgoliasearchResults } from './AlgoliaSearchPage.duck';
import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';
import css from './AlgoliaSearchPage.module.css';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import aa from 'search-insights';
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
import searchInsights from 'search-insights';

const Autocomplete = loadable(() =>
  import(/* webpackChunkName: "Autocomplete" */ './AlgoliaAutocomplete')
);

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_API_KEY,
  {
    _useRequestCache: true,
  }
);
const updateAfter = 700;

const insightsMiddleware = createInsightsMiddleware({
  insightsClient: searchInsights,
});

aa('init', {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  apiKey: process.env.REACT_APP_ALGOLIA_API_KEY,
});

const searchStateToUrl = searchState =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

const Panel = ({ children, header, footer }) => {
  return (
    <div className="ais-Panel">
      {header && <div className="ais-Panel-header">{header}</div>}
      <div className="ais-Panel-body">{children}</div>
      {footer && <div className="ais-Panel-footer">{footer}</div>}
    </div>
  );
};

const CustomStats = props => {
  const { nbHits, page, hitsPerPage } = useStats();
  const { refinementList, productDev } = props;
  return (
    <div className={css.noDataFoundWrapper}>
      <span className={css.searchResults}>
        Showing {page + 1} - {hitsPerPage} out of {nbHits} products
      </span>
      <div
        className={classNames(
          css.noDataFound,
          refinementList || productDev ? null : css.noDataFoundleft
        )}
      >
        {' '}
        {nbHits < 1 ? 'No search results' : null}
      </div>
    </div>
  );
};

const AlgoliaSearchPageComponent = props => {
  const {
    intl,
    config,
    routes,
    history,
    location,
    listings,
    currentUser,
    searchParams,
    updateInProgress,
    scrollingDisabled,
    routeConfiguration,
    onUpdateProfile,
  } = props;

  useEffect(() => {
    if (currentUser) {
      searchInsights('init', {
        appId: process.env.REACT_APP_ALGOLIA_APP_ID,
        apiKey: process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY,
      });
      searchInsights('setUserToken', currentUser.id.uuid || 'anonymous');
    }
  }, [currentUser]);

  const [searchState, setSearchState] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = qs.parse(window.location.search.slice(1));
      return params.keywords ? params.keywords : params.refinementList ? params.refinementList : ''; // return the value of 'keywords' or an empty string if it's not present
    } else {
      return ''; // Return an empty string if not in a browser environment
    }
  });
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobileFilter, setIsMobileFilter] = useState(false);
  if (typeof window === undefined) return null;

  useEffect(() => {
    const handlePopState = ({ state: searchState }) => {
      setSearchState(searchState);
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup function to avoid memory leaks
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const onSearchStateChange = (searchState, updateAfter = 500) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(searchState, null, searchStateToUrl(searchState));
    }
    setSearchState(previousState => {
      const hasQueryChanged = previousState?.searchState?.query !== searchState?.query;

      return {
        ...previousState,
        searchState: {
          ...searchState,
          boundingBox: !hasQueryChanged ? searchState.boundingBox : null,
        },
      };
    });
  };

  const refinement =
    (typeof window !== 'undefined' && JSON.parse(sessionStorage.getItem('category'))) || '';
  const CategoryName = !!refinement && categoryName(refinement);
  const { query } = searchState || {};

  const Hit = props => {
    const { hit, sendEvent } = props;
    return (
      <>
        <div
          onClick={() =>
            sendEvent('click', hit, 'Product Clicked', {
              userToken: currentUser?.id?.uuid,
            })
          }
        >
          <AlogoliaSearchCard
            hit={hit}
            currentUser={currentUser} // Assuming currentUser is defined somewhere
            updateInProgress={updateInProgress} // Assuming updateInProgress is defined somewhere
            onUpdateProfile={onUpdateProfile} // Assuming onUpdateProfile is defined somewhere
            routeConfiguration={routeConfiguration}
            location={location}
          />
        </div>
      </>
    );
  };
  const { listingFields: listingFieldsConfig } = config?.listing || {};
  const { defaultFilters: defaultFiltersConfig, sortConfig } = config?.search || {};

  // Page transition might initially use values from previous search
  // urlQueryParams doesn't contain page specific url params
  // like mapSearch, page or origin (origin depends on config.maps.search.sortSearchByDistance)
  const { searchParamsInURL } = searchParamsPicker(
    location.search,
    searchParams,
    listingFieldsConfig,
    defaultFiltersConfig,
    sortConfig,
    false
  );

  const isWindowDefined = typeof window !== 'undefined';
  if (!isWindowDefined) return null;

  const { title, description, schema } = createSearchResultSchema(
    listings,
    searchParamsInURL || {},
    intl,
    routeConfiguration,
    config
  );

  // Set topbar class based on if a modal is open in
  // a child component
  const topbarClasses = isMobileModalOpen
    ? classNames(css.topbarBehindModal, css.topbar)
    : css.topbar;

  const algoliaAutoComplete = (
    <div className={css.searchBox}>
      <Autocomplete
        currentUser={currentUser}
        searchClient={searchClient}
        placeholder="Search products"
        detachedMediaQuery="none"
        searchState={searchState}
        openOnFocus
      />
    </div>
  );
  const algoliaAutoComplete2 = (
    <div className={classNames(css.searchBox, css.topbarSearch)}>
      <Autocomplete
        currentUser={currentUser}
        searchClient={searchClient}
        placeholder="Explore now..."
        detachedMediaQuery="none"
        searchState={searchState}
        openOnFocus
      />
    </div>
  );

  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      description={description}
      title={title}
      schema={schema}
      className={css.mainWrapper}
    >
      <InstantSearch
        future={{ preserveSharedStateOnUnmount: true }}
        searchClient={searchClient}
        indexName={process.env.REACT_APP_ALGOLIA_LISTING_INDEX}
        insights={true}
        initialUiState={{
          [process.env.REACT_APP_ALGOLIA_LISTING_INDEX]: {
            query: searchState?.query ? searchState?.query : '',
            refinementList: searchState?.refinementList
              ? {
                  subCategory: [searchState?.refinementList],
                  category:
                    searchState?.refinementList === 'clothing'
                      ? [searchState?.refinementList]
                      : [''],
                }
              : {},
          },
        }}
        middleware={[insightsMiddleware]}
      >
        <TopbarContainer
          className={topbarClasses}
          currentPage="AlgoliaSearchPage"
          currentSearchParams={{ searchState, onSearchStateChange: onSearchStateChange }}
          topbarAlgoliComponent={algoliaAutoComplete2}
        />

        <div className={css.container}>
          <div className={classNames(css.searchWrapper)}>
            <div className={css.categoryName}>
              <h3>{CategoryName}</h3>
            </div>
            <Configure
              ruleContexts={[]}
              filters="businessListingUnavailable:false AND state:published"
            />

            <section className="container-results">
              <header className="container-header container-options header-desktop">
                <div>
                  <CustomStats
                    refinementList={searchState?.refinementList}
                    productDev={searchState?.productDev?.refinementList}
                  />
                </div>
                <HitsPerPage
                  className="container-option"
                  items={[
                    {
                      value: 16,
                      default: true,
                    },
                  ]}
                />
              </header>
              <header className="container-header container-options header-mobile">
                <div onClick={() => setIsMobileFilter(!isMobileFilter)}>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    className="text-2xl"
                    height="24px"
                    width="24px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M472 168H40a24 24 0 010-48h432a24 24 0 010 48zm-80 112H120a24 24 0 010-48h272a24 24 0 010 48zm-96 112h-80a24 24 0 010-48h80a24 24 0 010 48z"></path>
                  </svg>
                </div>
              </header>
            </section>
            <div className={css.searchFilter}>
              <div className={classNames(css.filterWrapper, css.filterDesktop)}>
                <div>
                  <div className={css.faqsec}>
                    <div className={css.faqwrapper}>
                      <AlgoliaFilterPanel searchState={searchState} Panel={Panel} />
                      <div className={css.categoryWrapper}>
                        {' '}
                        <div className={css.category}>
                          <span>Sort:</span>
                          <SortBy
                            className="container-option"
                            items={[
                              {
                                label: 'Most Recent',
                                value: 'most_recent',
                              },
                              {
                                label: 'Low to High',
                                value: 'price_asc',
                              },
                              {
                                label: 'High to Low',
                                value: 'price_dec',
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {algoliaAutoComplete}
            </div>
            <div
              className={classNames(
                css.aisInstantSearch,
                currentUser ? '' : css.notLoginUserSearch
              )}
            >
              <Modal
                isOpen={isMobileFilter}
                onClose={() => setIsMobileFilter(!isMobileFilter)}
                onManageDisableScrolling={() => {}}
                modalTitle="Filters"
                id="AlgoliasSearchPage.filterModal"
              >
                <div className={classNames(css.filterWrapper)}>
                  <div>
                    <div className={css.faqsec}>
                      <div className={css.faqwrapper}>
                        <AlgoliaFilterPanel searchState={searchState} Panel={Panel} />
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
              <div
                className={classNames(
                  !searchState?.refinementList || !searchState?.productDev?.refinementList
                    ? css.smallMargin
                    : null,
                  css.Resultcontainer
                )}
              >
                <div
                  className={classNames(
                    searchState?.refinementList || searchState?.productDev?.refinementList
                      ? !searchState?.refinementList
                        ? css.show5card
                        : null
                      : css.show5card
                  )}
                >
                  <Hits hitComponent={Hit} />
                  <footer className="container-footer">{/* <Pagination /> */}</footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </InstantSearch>
    </Page>
  );
};

AlgoliaSearchPageComponent.defaultProps = {
  listings: [],
  mapListings: [],
  pagination: null,
  searchListingsError: null,
  searchParams: {},
  tab: 'listings',
  activeListingId: null,
  initialSearchFormValues: {},
};

AlgoliaSearchPageComponent.propTypes = {
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  searchParams: object,
  tab: oneOf(['filters', 'listings', 'map']).isRequired,
  filterConfig: propTypes.filterConfig,
  sortConfig: propTypes.sortConfig,
  initialSearchFormValues: object,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const EnhancedAlgoliaSearchPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const routes = useRouteConfiguration();

  return (
    <AlgoliaSearchPageComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      location={location}
      routes={routes}
      {...props}
    />
  );
};

const mapStateToProps = state => {
  const {
    currentUser,
    currentUserListing,
    currentUserListingFetched,
    categories,
    subCategories,
    subChildCategories,
  } = state.user;
  const { updateInProgress } = state.ProfileSettingsPage;
  const { algoliaSearchResults } = state.AlgoliaSearchPage;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    currentUserListing,
    currentUserListingFetched,
    categories,
    subCategories,
    subChildCategories,
    updateInProgress,
    algoliaSearchResults,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onGetAlgoliasearchResults: params => dispatch(getAlgoliasearchResults(params)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const AlgoliaSearchPage = compose(
  withViewport,
  connect(mapStateToProps, mapDispatchToProps)
)(EnhancedAlgoliaSearchPage);

export default AlgoliaSearchPage;
