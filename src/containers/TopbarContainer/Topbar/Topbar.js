import React, { Component } from 'react';
import { array, arrayOf, bool, func, number, object, shape, string } from 'prop-types';
import pickBy from 'lodash/pickBy';
import classNames from 'classnames';

import appSettings from '../../../config/settings';
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { ACCOUNT_SETTINGS_PAGES } from '../../../routing/routeConfiguration';
import { FormattedMessage, intlShape, useIntl } from '../../../util/reactIntl';
import { isMainSearchTypeKeywords, isOriginInUse } from '../../../util/search';
import { parse, stringify } from '../../../util/urlHelpers';
import { createResourceLocatorString, matchPathname, pathByRouteName } from '../../../util/routes';
import { propTypes } from '../../../util/types';
import {
  listingCategories,
  listingSubCategories,
  listingSubCategoriesChild,
} from '../../../config/configListing';

import {
  AvatarSmall,
  Button,
  InlineTextButton,
  LimitedAccessBanner,
  LinkedLogo,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  Modal,
  ModalMissingInformation,
  NamedLink,
} from '../../../components';

import MenuIcon from './MenuIcon';
import SearchIcon from './SearchIcon';
import TopbarSearchForm from './TopbarSearchForm/TopbarSearchForm';
import TopbarMobileMenu from './TopbarMobileMenu/TopbarMobileMenu';
import TopbarDesktop from './TopbarDesktop/TopbarDesktop';

import css from './Topbar.module.css';
import IconCollection from '../../../components/IconCollection/IconCollection';

const MAX_MOBILE_SCREEN_WIDTH = 1024;

const redirectToURLWithModalState = (props, modalStateParam) => {
  const { history, location } = props;
  const { pathname, search, state } = location;
  const searchString = `?${stringify({ [modalStateParam]: 'open', ...parse(search) })}`;
  history.push(`${pathname}${searchString}`, state);
};

const redirectToURLWithoutModalState = (props, modalStateParam) => {
  const { history, location } = props;
  const { pathname, search, state } = location;
  const queryParams = pickBy(parse(search), (v, k) => {
    return k !== modalStateParam;
  });
  const stringified = stringify(queryParams);
  const searchString = stringified ? `?${stringified}` : '';
  history.push(`${pathname}${searchString}`, state);
};

const isPrimary = o => o.group === 'primary';
const isSecondary = o => o.group === 'secondary';
const compareGroups = (a, b) => {
  const isAHigherGroupThanB = isPrimary(a) && isSecondary(b);
  const isALesserGroupThanB = isSecondary(a) && isPrimary(b);
  // Note: sort order is stable in JS
  return isAHigherGroupThanB ? -1 : isALesserGroupThanB ? 1 : 0;
};
// Returns links in order where primary links are returned first
const sortCustomLinks = customLinks => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.sort(compareGroups);
};

// Resolves in-app links against route configuration
const getResolvedCustomLinks = (customLinks, routeConfiguration) => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.map(linkConfig => {
    const { type, href } = linkConfig;
    const isInternalLink = type === 'internal' || href.charAt(0) === '/';
    if (isInternalLink) {
      // Internal link
      const testURL = new URL('http://my.marketplace.com' + href);
      const matchedRoutes = matchPathname(testURL.pathname, routeConfiguration);
      if (matchedRoutes.length > 0) {
        const found = matchedRoutes[0];
        const to = { search: testURL.search, hash: testURL.hash };
        return {
          ...linkConfig,
          route: {
            name: found.route?.name,
            params: found.params,
            to,
          },
        };
      }
    }
    return linkConfig;
  });
};

const isCMSPage = found =>
  found.route?.name === 'CMSPage' ? `CMSPage:${found.params?.pageId}` : null;
const isInboxPage = found =>
  found.route?.name === 'InboxPage' ? `InboxPage:${found.params?.tab}` : null;
// Find the name of the current route/pathname.
// It's used as handle for currentPage check.
const getResolvedCurrentPage = (location, routeConfiguration) => {
  const matchedRoutes = matchPathname(location.pathname, routeConfiguration);
  if (matchedRoutes.length > 0) {
    const found = matchedRoutes[0];
    const cmsPageName = isCMSPage(found);
    const inboxPageName = isInboxPage(found);
    return cmsPageName ? cmsPageName : inboxPageName ? inboxPageName : `${found.route?.name}`;
  }
};

const GenericError = props => {
  const { show } = props;
  const classes = classNames(css.genericError, {
    [css.genericErrorVisible]: show,
  });
  return (
    <div className={classes}>
      <div className={css.genericErrorContent}>
        <p className={css.genericErrorText}>
          <FormattedMessage id="Topbar.genericError" />
        </p>
      </div>
    </div>
  );
};

GenericError.propTypes = {
  show: bool.isRequired,
};

const ProfileMenu = ({ currentPage, currentUser, onLogout }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <AvatarSmall className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ConfirmPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ConfirmPage'))}
            name="ConfirmPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myWalletLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="LandingPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('LandingPage'))}
            name="LandingPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.pastOrdersLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="SearchPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('SearchPage'))}
            name="SearchPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.offersLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myAccountLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="RewardsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('RewardsPage'))}
            name="RewardsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myRewardsLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.sellingLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="ManageSubscriptionPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageSubscriptionPage'))}
            name="ManageSubscriptionPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.membershipLink" />
          </NamedLink>
        </MenuItem>

        {/* <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem> */}
        {/* <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem> */}
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const CatgeoryMenu = ({ handleCategoryDropDown, isCategoryOpen, history, routeConfiguration }) => {
  const [category, setCategory] = React.useState('');
  const [expandedCategory, setExpandedCategory] = React.useState(null);
  return (
    <>
      {isCategoryOpen && (
        <div
          onClick={() => {
            handleCategoryDropDown();
          }}
          style={{ width: 36 }}
        >
          <IconCollection icon="logoBarIcon2" />
        </div>
      )}
      <div
        className={classNames(css.dropdown, isCategoryOpen ? css.openDropDown : css.closeDropDown)}
      >
        <div className={classNames(css.categoryDropDownItem)}>
          {listingCategories.map(value => {
            return (
              <div key={value.option}>
                <label className={css.categoryLabel}>{value.label}</label>
                <div key={value.option}>
                  {listingSubCategories
                    .filter(e => e.parentCollection === value.option)
                    .map(data => {
                      const isExpanded = expandedCategory === data.label;
                      const subCategoriesChild = listingSubCategoriesChild.filter(
                        child => child.parentCategory === data.option
                      );

                      return (
                        <div
                          key={data.option}
                          className={classNames(isExpanded && css.active, css.categoryItems)}
                          onClick={() => setExpandedCategory(isExpanded ? null : data.label)}
                        >
                          <span
                            onClick={() => {
                              subCategoriesChild.length
                                ? null
                                : history.push(
                                  createResourceLocatorString(
                                    'SearchPage',
                                    routeConfiguration,
                                    {},
                                    {
                                      pub_subCategory: data.option,
                                    }
                                  )
                                );
                            }}
                          >
                            {data.label}
                          </span>
                          {!!subCategoriesChild?.length && (
                            <span
                              className={css.arrowIcon}
                              onClick={() => setExpandedCategory(isExpanded ? null : data.label)}
                            >
                              <IconCollection icon="rightSideIcon" />
                            </span>
                          )}
                          {isExpanded && (
                            <ul className={css.subCategoryDropdown}>
                              {/* Here you can render your subcategories */}
                              {subCategoriesChild.map(childData => (
                                <li
                                  key={childData.option}
                                  className={css.subCategoryItem}
                                  onClick={() => handleSubCategoryClick(childData.label)}
                                >
                                  <span
                                    onClick={() => {
                                      history.push(
                                        createResourceLocatorString(
                                          'SearchPage',
                                          routeConfiguration,
                                          {},
                                          {
                                            pub_category: value.option,
                                            pub_subCategory: data.option,
                                            pub_subCategoryChild: childData.option,
                                          }
                                        )
                                      );
                                    }}
                                  >
                                    {childData.label}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isCategoryOpen && (
        <div
          onClick={() => {
            handleCategoryDropDown();
          }}
        >
          <IconCollection icon="logoBarIcon" />
        </div>
      )}
    </>
  );
};

class TopbarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isCategoryOpen: false };
    this.handleMobileMenuOpen = this.handleMobileMenuOpen.bind(this);
    this.handleMobileMenuClose = this.handleMobileMenuClose.bind(this);
    this.handleMobileSearchOpen = this.handleMobileSearchOpen.bind(this);
    this.handleMobileSearchClose = this.handleMobileSearchClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleCategoryDropDown = () => {
    if (!this.state.isCategoryOpen) {
      this.setState({ isCategoryOpen: true });
    } else {
      this.setState({ isCategoryOpen: false });
    }
  };

  handleMobileMenuOpen() {
    redirectToURLWithModalState(this.props, 'mobilemenu');
  }

  handleMobileMenuClose() {
    redirectToURLWithoutModalState(this.props, 'mobilemenu');
  }

  handleMobileSearchOpen() {
    redirectToURLWithModalState(this.props, 'mobilesearch');
  }

  handleMobileSearchClose() {
    redirectToURLWithoutModalState(this.props, 'mobilesearch');
  }

  handleSubmit(values) {
    const { currentSearchParams } = this.props;
    const { history, config, routeConfiguration } = this.props;

    const topbarSearchParams = () => {
      if (isMainSearchTypeKeywords(config)) {
        return { keywords: values?.keywords };
      }
      // topbar search defaults to 'location' search
      const { search, selectedPlace } = values?.location;
      const { origin, bounds } = selectedPlace;
      const originMaybe = isOriginInUse(config) ? { origin } : {};

      return {
        ...originMaybe,
        address: search,
        bounds,
      };
    };
    const searchParams = {
      ...currentSearchParams,
      ...topbarSearchParams(),
    };
    history.push(
      createResourceLocatorString('AlgoliaSearchPage', routeConfiguration, {}, searchParams)
    );
  }

  handleLogout() {
    const { onLogout, history, routeConfiguration } = this.props;
    onLogout().then(() => {
      const path = pathByRouteName('LandingPage', routeConfiguration);

      // In production we ensure that data is really lost,
      // but in development mode we use stored values for debugging
      if (appSettings.dev) {
        history.push(path);
      } else if (typeof window !== 'undefined') {
        window.location = path;
      }

      console.log('logged out'); // eslint-disable-line
    });
  }

  render() {
    const {
      className,
      rootClassName,
      desktopClassName,
      mobileRootClassName,
      mobileClassName,
      isAuthenticated,
      authScopes,
      authInProgress,
      currentUser,
      currentUserHasListings,
      currentUserHasOrders,
      currentPage,
      notificationCount,
      intl,
      location,
      onManageDisableScrolling,
      onResendVerificationEmail,
      sendVerificationEmailInProgress,
      sendVerificationEmailError,
      showGenericError,
      config,
      routeConfiguration,
      topbarAlgoliComponent,
      history,
    } = this.props;

    const { mobilemenu, mobilesearch, keywords, address, origin, bounds } = parse(location.search, {
      latlng: ['origin'],
      latlngBounds: ['bounds'],
    });

    // Custom links are sorted so that group="primary" are always at the beginning of the list.
    const sortedCustomLinks = sortCustomLinks(config.topbar?.customLinks);
    const customLinks = getResolvedCustomLinks(sortedCustomLinks, routeConfiguration);
    const resolvedCurrentPage = currentPage || getResolvedCurrentPage(location, routeConfiguration);

    const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

    const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
    const isMobileLayout = hasMatchMedia
      ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
      : true;
    const isMobileMenuOpen = isMobileLayout && mobilemenu === 'open';
    const isMobileSearchOpen = isMobileLayout && mobilesearch === 'open';

    const mobileMenu = (
      <TopbarMobileMenu
        isAuthenticated={isAuthenticated}
        currentUserHasListings={currentUserHasListings}
        currentUser={currentUser}
        onLogout={this.handleLogout}
        notificationCount={notificationCount}
        currentPage={resolvedCurrentPage}
        customLinks={customLinks}
      />
    );

    const topbarSearcInitialValues = () => {
      if (isMainSearchTypeKeywords(config)) {
        return { keywords };
      }

      // Only render current search if full place object is available in the URL params
      const locationFieldsPresent = isOriginInUse(config)
        ? address && origin && bounds
        : address && bounds;
      return {
        location: locationFieldsPresent
          ? {
            search: address,
            selectedPlace: { address, origin, bounds },
          }
          : null,
      };
    };
    const initialSearchFormValues = topbarSearcInitialValues();

    const { cartItems } = (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};

    const addToCartIcon = isAuthenticated ? (
      <NamedLink name="CartPage">
        <span className={css.cartItemWrappper}>
          <span className={css.cartCount}>
            <span className={css.badge}>{cartItems?.length > 0 ? cartItems?.length : 0}</span>
          </span>
          <IconCollection icon="addCartIcon" />
        </span>
      </NamedLink>
    ) : (
      <NamedLink name="SignupPage">
        <span className={css.cartItemWrappper}>
          <span className={css.cartCount}>
            <span className={css.badge}>{0}</span>
          </span>
          <IconCollection icon="addCartIcon" />
        </span>
      </NamedLink>
    );

    const profileMenuMaybe = isAuthenticated ? (
      <ProfileMenu
        currentPage={currentPage}
        currentUser={currentUser}
        onLogout={this.handleLogout}
      />
    ) : null;

    const categoryMenuMaybe = (
      <CatgeoryMenu
        currentPage={currentPage}
        currentUser={currentUser}
        routeConfiguration={routeConfiguration}
        history={history}
        handleCategoryDropDown={this.handleCategoryDropDown}
        isCategoryOpen={this.state.isCategoryOpen}
      />
    );

    const classes = classNames(rootClassName || css.root, className);

    return (
      <div className={classes}>
        <LimitedAccessBanner
          isAuthenticated={isAuthenticated}
          authScopes={authScopes}
          currentUser={currentUser}
          onLogout={this.handleLogout}
          currentPage={resolvedCurrentPage}
        />
        <div className={classNames(mobileRootClassName || css.container, mobileClassName)}>
          <div className={css.topbarTopContent}>
            {/* <Button
              rootClassName={css.menu}
              onClick={this.handleCategoryDropDown}
              title={intl.formatMessage({ id: 'Topbar.menuIcon' })}
            >
              <MenuIcon className={css.menuIcon} />
              {notificationDot}
            </Button> */}
            {categoryMenuMaybe}
            <LinkedLogo
              layout={'mobile'}
              alt={intl.formatMessage({ id: 'Topbar.logoIcon' })}
              linkToExternalSite={config?.topbar?.logoLink}
              className={css.logo}
            />

            <div className={css.topbarRight}>
              {isAuthenticated ? (
                <div className={css.avatarContent}>
                  {addToCartIcon}
                  {profileMenuMaybe}
                </div>
              ) : (
                <div className={css.linkWrapper}>
                  <NamedLink name="SignupPage" className={css.signUpFree}>
                    <FormattedMessage id="TopbarMobileMenu.signupLink" />
                  </NamedLink>
                  <NamedLink name="LoginPage" className={css.loginLink}>
                    <FormattedMessage id="TopbarMobileMenu.loginLink" />
                  </NamedLink>
                </div>
              )}
            </div>
          </div>
          <div className={css.mobileSearch}>
            {/* <Button
            rootClassName={css.searchMenu}
            onClick={this.handleMobileSearchOpen}
            title={intl.formatMessage({ id: 'Topbar.searchIcon' })}
          >
            <SearchIcon className={css.searchMenuIcon} />
          </Button> */}
            <TopbarSearchForm
              onSubmit={this.handleSubmit}
              initialValues={initialSearchFormValues}
              isMobile
              appConfig={config}
            />
          </div>
        </div>
        <div className={css.desktop}>
          <TopbarDesktop
            className={desktopClassName}
            currentUserHasListings={currentUserHasListings}
            currentUser={currentUser}
            currentPage={resolvedCurrentPage}
            initialSearchFormValues={initialSearchFormValues}
            intl={intl}
            isAuthenticated={isAuthenticated}
            notificationCount={notificationCount}
            onLogout={this.handleLogout}
            onSearchSubmit={this.handleSubmit}
            config={config}
            customLinks={customLinks}
            topbarAlgoliComponent={topbarAlgoliComponent}
          />
        </div>
        <Modal
          id="TopbarMobileMenu"
          containerClassName={css.modalContainer}
          isOpen={isMobileMenuOpen}
          onClose={this.handleMobileMenuClose}
          usePortal
          onManageDisableScrolling={onManageDisableScrolling}
        >
          {authInProgress ? null : mobileMenu}
        </Modal>
        <Modal
          id="TopbarMobileSearch"
          containerClassName={css.modalContainerSearchForm}
          isOpen={isMobileSearchOpen}
          onClose={this.handleMobileSearchClose}
          usePortal
          onManageDisableScrolling={onManageDisableScrolling}
        >
          <div className={css.searchContainer}>
            {topbarAlgoliComponent ? topbarAlgoliComponent : <TopbarSearchForm
              onSubmit={this.handleSubmit}
              initialValues={initialSearchFormValues}
              isMobile
              appConfig={config}
            />}
            <p className={css.mobileHelp}>
              <FormattedMessage id="Topbar.mobileSearchHelp" />
            </p>
          </div>
        </Modal>
        <ModalMissingInformation
          id="MissingInformationReminder"
          containerClassName={css.missingInformationModal}
          currentUser={currentUser}
          currentUserHasListings={currentUserHasListings}
          currentUserHasOrders={currentUserHasOrders}
          location={location}
          onManageDisableScrolling={onManageDisableScrolling}
          onResendVerificationEmail={onResendVerificationEmail}
          sendVerificationEmailInProgress={sendVerificationEmailInProgress}
          sendVerificationEmailError={sendVerificationEmailError}
        />

        <GenericError show={showGenericError} />
      </div>
    );
  }
}

TopbarComponent.defaultProps = {
  className: null,
  rootClassName: null,
  desktopClassName: null,
  mobileRootClassName: null,
  mobileClassName: null,
  notificationCount: 0,
  currentUser: null,
  currentUserHasOrders: null,
  currentPage: null,
  sendVerificationEmailError: null,
  authScopes: [],
};

TopbarComponent.propTypes = {
  className: string,
  rootClassName: string,
  desktopClassName: string,
  mobileRootClassName: string,
  mobileClassName: string,
  isAuthenticated: bool.isRequired,
  authScopes: array,
  authInProgress: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentUserHasListings: bool.isRequired,
  currentUserHasOrders: bool,
  currentPage: string,
  notificationCount: number,
  onLogout: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onResendVerificationEmail: func.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  showGenericError: bool.isRequired,

  // These are passed from Page to keep Topbar rendering aware of location changes
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // from useIntl
  intl: intlShape.isRequired,

  // from useConfiguration
  config: object.isRequired,

  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,
};

const Topbar = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  return (
    <TopbarComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      {...props}
    />
  );
};

export default Topbar;
