import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { propTypes } from '../../../../util/types';
import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
} from '../../../../components';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import CustomLinksMenu from './CustomLinksMenu/CustomLinksMenu';

import css from './TopbarDesktop.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import {
  listingCategories,
  listingSubCategories,
  listingSubCategoriesChild,
} from '../../../../config/configListing';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { createResourceLocatorString } from '../../../../util/routes';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';

const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';

const SignupLink = () => {
  return (
    <NamedLink name="SignupPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );
};

const ReferAndEarn = () => {
  return (
    <NamedLink name="SignupPage" className={classNames(css.topbarLink, css.referAndEarn)}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.referandearn" />
      </span>
    </NamedLink>
  );
};

const LoginLink = () => {
  return (
    <NamedLink name="LoginPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );
};

const InboxLink = ({ notificationCount, currentUserHasListings }) => {
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  return (
    <NamedLink
      className={css.topbarLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.topbarLinkLabel}>
        <IconCollection icon="chatIcon" />
      </span>
    </NamedLink>
  );
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
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="StripePayoutPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('StripePayoutPage'))}
            name="StripePayoutPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.myWalletLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="InboxPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('InboxPage'))}
            name="InboxPage"
            params={{ tab: 'orders' }}
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.pastOrdersLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="InboxOfferPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('InboxPage'))}
            name="InboxPage"
            params={{ tab: 'offerRecieved' }}
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

        <MenuItem key="EditListingPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('EditListingPage'))}
            name="EditListingPage"
            params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'details' }}
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
  const [category, setCategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  return (
    <>
      {isCategoryOpen && (
        <div
          onClick={() => {
            handleCategoryDropDown();
          }}
        >
          <IconCollection icon="logoBarIcon" />
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

const TopbarDesktop = props => {
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const dispatch = useDispatch();
  const {
    className,
    config,
    customLinks,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
    topbarAlgoliComponent = false,
  } = props;
  const [mounted, setMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect(() => {
  //   const fetchSubscriptions = async () => {
  //     await dispatch(getSubscriptions());
  //   };
  //   fetchSubscriptions();
  // }, []);

  const handleCategoryDropDown = () => {
    if (!isCategoryOpen) {
      setIsCategoryOpen(true);
    } else {
      setIsCategoryOpen(false);
    }
  };

  const marketplaceName = config.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const giveSpaceForSearch = customLinks == null || customLinks?.length === 0;
  const classes = classNames(rootClassName || css.root, className);
  const { cartItems } = (!!currentUser?.id && currentUser.attributes.profile.protectedData) || {};

  const inboxLinkMaybe = authenticatedOnClientSide ? (
    <NamedLink
      className={css.topbarLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.cartItemWrappper}>
        <span className={css.cartCount}>
          <span className={css.badge}>{notificationCount}</span>
        </span>
        <IconCollection icon="inboxIcon" />
      </span>
    </NamedLink>
  ) : null;

  const profileMenuMaybe = authenticatedOnClientSide ? (
    <ProfileMenu currentPage={currentPage} currentUser={currentUser} onLogout={onLogout} />
  ) : null;

  const categoryMenuMaybe = (
    <CatgeoryMenu
      currentPage={currentPage}
      currentUser={currentUser}
      routeConfiguration={routeConfiguration}
      history={history}
      handleCategoryDropDown={handleCategoryDropDown}
      isCategoryOpen={isCategoryOpen}
    />
  );

  const chatIcon = authenticatedOnClientSide ? (
    <InboxLink
      notificationCount={notificationCount}
      currentUserHasListings={currentUserHasListings}
    />
  ) : null;

  const addToCartIcon = authenticatedOnClientSide ? (
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

  const signupLinkMaybe = isAuthenticatedOrJustHydrated ? null : <SignupLink />;
  const referAndEarn = isAuthenticatedOrJustHydrated ? null : <ReferAndEarn />;
  const loginLinkMaybe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;

  return (
    <nav className={classes}>
      <div className={css.menuBarWarpper}>
        <div className={css.menuBar}>{categoryMenuMaybe}</div>
      </div>
      <LinkedLogo
        className={css.logoLink}
        layout="desktop"
        alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        linkToExternalSite={config?.topbar?.logoLink}
      />
      {topbarAlgoliComponent ? (
        topbarAlgoliComponent
      ) : (
        <TopbarSearchForm
          className={classNames(css.searchLink, { [css.takeAvailableSpace]: giveSpaceForSearch })}
          desktopInputRoot={css.topbarSearchWithLeftPadding}
          onSubmit={onSearchSubmit}
          initialValues={initialSearchFormValues}
          appConfig={config}
        />
      )}
      <div className={css.linksWrapper}>
        {!isAuthenticatedOrJustHydrated ? null : (
          <NamedLink name="MyWishlistPage" className={css.topbarLink}>
            <span className={css.topbarLinkLabel}>
              <IconCollection icon="iconWishList" />
              {/* <FormattedMessage id="TopbarDesktop.wishList" /> */}
            </span>
          </NamedLink>
        )}

        <NamedLink name="RewardsPage" className={css.topbarLink}>
          <span className={css.topbarLinkLabel}>
            <FormattedMessage id="TopbarDesktop.rewards" />
          </span>
        </NamedLink>
        <NamedLink name="LoginPage" className={css.topbarLink}>
          <span className={css.topbarLinkLabel}>
            <FormattedMessage id="TopbarDesktop.VerifyPlus" />
          </span>
        </NamedLink>
        <NamedLink name="LoginPage" className={css.topbarLink}>
          <span className={css.topbarLinkLabel}>
            <FormattedMessage id="TopbarDesktop.helpContact" />
          </span>
        </NamedLink>
        {isAuthenticatedOrJustHydrated && (
          <div className={css.customLink}>
            <CustomLinksMenu
              currentPage={currentPage}
              customLinks={customLinks}
              intl={intl}
              hasClientSideContentReady={
                authenticatedOnClientSide || !isAuthenticatedOrJustHydrated
              }
            />
          </div>
        )}
        {chatIcon}
        {inboxLinkMaybe}

        <span className={css.addToCartIcon}> {isAuthenticatedOrJustHydrated && addToCartIcon}</span>
        {profileMenuMaybe}
        {!isAuthenticatedOrJustHydrated && (
          <div className={css.customLink}>
            <CustomLinksMenu
              currentPage={currentPage}
              customLinks={customLinks}
              intl={intl}
              hasClientSideContentReady={
                authenticatedOnClientSide || !isAuthenticatedOrJustHydrated
              }
            />
          </div>
        )}
        {referAndEarn}
        {!isAuthenticatedOrJustHydrated && addToCartIcon}
        {/* {signupLinkMaybe}
        {loginLinkMaybe} */}
      </div>
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  config: null,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  config: object,
};

export default TopbarDesktop;
