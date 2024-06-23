import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { displayPrice } from '../../../util/configHelpers';
import {
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  propTypes,
  STOCK_MULTIPLE_ITEMS,
} from '../../../util/types';
import { formatMoney } from '../../../util/currency';
import { ensureOwnListing } from '../../../util/data';
import {
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../../util/urlHelpers';
import { createResourceLocatorString, findRouteByRouteName } from '../../../util/routes';
import { isBookingProcessAlias, isPurchaseProcessAlias } from '../../../transactions/transaction';

import {
  AspectRatioWrapper,
  InlineTextButton,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  IconSpinner,
  PrimaryButtonInline,
  ResponsiveImage,
  Modal,
} from '../../../components';

import MenuIcon from './MenuIcon';
import Overlay from './Overlay';
import css from './ManageListingCard.module.css';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { fetchListings } from '../../LandingPage/LandingPage.duck';
import Checkbox from 'rc-checkbox';
import { checkCountLimit, checkPriceLimit } from '../../../util/dataExtractor';
const { Money } = sdkTypes;

// Menu content needs the same padding
const MENU_CONTENT_OFFSET = -12;
const MAX_LENGTH_FOR_WORDS_IN_TITLE = 7;

const priceData = (price, currency, intl) => {
  if (price?.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ManageListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ManageListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const createListingURL = (routes, listing) => {
  const id = listing.id.uuid;
  const slug = createSlug(listing.attributes.title);
  const isPendingApproval = listing.attributes.state === LISTING_STATE_PENDING_APPROVAL;
  const isDraft = listing.attributes.state === LISTING_STATE_DRAFT;
  const variant = isDraft
    ? LISTING_PAGE_DRAFT_VARIANT
    : isPendingApproval
    ? LISTING_PAGE_PENDING_APPROVAL_VARIANT
    : null;

  const linkProps =
    isPendingApproval || isDraft
      ? {
          name: 'ListingPageVariant',
          params: {
            id,
            slug,
            variant,
          },
        }
      : {
          name: 'ListingPage',
          params: { id, slug },
        };

  return createResourceLocatorString(linkProps.name, routes, linkProps.params, {});
};

// Cards are not fixed sizes - So, long words in title make flexboxed items to grow too big.
// 1. We split title to an array of words and spaces.
//    "foo bar".split(/([^\s]+)/gi) => ["", "foo", " ", "bar", ""]
// 2. Then we break long words by adding a '<span>' with word-break: 'break-all';
const formatTitle = (title, maxLength) => {
  const nonWhiteSpaceSequence = /([^\s]+)/gi;
  return title.split(nonWhiteSpaceSequence).map((word, index) => {
    return word.length > maxLength ? (
      <span key={index} style={{ wordBreak: 'break-all' }}>
        {word}
      </span>
    ) : (
      word
    );
  });
};

const ShowFinishDraftOverlayMaybe = props => {
  const { isDraft, title, id, slug, hasImage, intl } = props;

  return isDraft ? (
    <React.Fragment>
      <div className={classNames({ [css.draftNoImage]: !hasImage })} />
      <Overlay
        message={intl.formatMessage(
          { id: 'ManageListingCard.draftOverlayText' },
          { listingTitle: title }
        )}
      >
        <NamedLink
          className={css.finishListingDraftLink}
          name="EditListingPage"
          params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_DRAFT, tab: 'photos' }}
        >
          <FormattedMessage id="ManageListingCard.finishListingDraft" />
        </NamedLink>
      </Overlay>
    </React.Fragment>
  ) : null;
};

const ShowClosedOverlayMaybe = props => {
  const {
    isClosed,
    title,
    actionsInProgressListingId,
    currentListingId,
    onOpenListing,
    intl,
  } = props;

  return isClosed ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.closedListing' },
        { listingTitle: title }
      )}
    >
      <PrimaryButtonInline
        className={css.openListingButton}
        disabled={!!actionsInProgressListingId}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          if (!actionsInProgressListingId) {
            onOpenListing(currentListingId);
          }
        }}
      >
        <FormattedMessage id="ManageListingCard.openListing" />
      </PrimaryButtonInline>
    </Overlay>
  ) : null;
};

const ShowPendingApprovalOverlayMaybe = props => {
  const { isPendingApproval, title, intl } = props;

  return isPendingApproval ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.pendingApproval' },
        { listingTitle: title }
      )}
    />
  ) : null;
};

const ShowOutOfStockOverlayMaybe = props => {
  const {
    showOutOfStockOverlay,
    title,
    id,
    slug,
    actionsInProgressListingId,
    currentListingId,
    hasStockManagementInUse,
    onCloseListing,
    onUpdateListing,
    intl,
  } = props;

  return showOutOfStockOverlay ? (
    <Overlay
      message={intl.formatMessage(
        { id: 'ManageListingCard.outOfStockOverlayText' },
        { listingTitle: title }
      )}
    >
      {hasStockManagementInUse ? (
        <div className={css.outOfStockWrapper}>
          <NamedLink
            className={css.finishListingDraftLink}
            name="EditListingPage"
            params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_EDIT, tab: 'pricing-and-stock' }}
          >
            <FormattedMessage id="ManageListingCard.setPriceAndStock" />
          </NamedLink>

          <div className={css.closeListingText}>
            {intl.formatMessage(
              { id: 'ManageListingCard.closeListingTextOr' },
              {
                closeListingLink: (
                  <div>
                    <InlineTextButton
                      key="closeListingLink"
                      className={css.closeListingBtn}
                      disabled={!!actionsInProgressListingId}
                      onClick={() => {
                        if (!actionsInProgressListingId) {
                          onUpdateListing(currentListingId, {
                            publicData: {
                              isDeleted: true,
                            },
                          });
                          onCloseListing(currentListingId);
                        }
                      }}
                    >
                      <FormattedMessage id="ManageListingCard.closeListingText" />
                    </InlineTextButton>
                  </div>
                ),
              }
            )}
          </div>
        </div>
      ) : (
        <div className={css.closeListingText}>
          <InlineTextButton
            key="closeListingLink"
            className={css.closeListingText}
            disabled={!!actionsInProgressListingId}
            onClick={() => {
              if (!actionsInProgressListingId) {
                onCloseListing(currentListingId);
              }
            }}
          >
            <FormattedMessage id="ManageListingCard.closeListingText" />
          </InlineTextButton>
        </div>
      )}
    </Overlay>
  ) : null;
};

const LinkToStockOrAvailabilityTab = props => {
  const {
    id,
    slug,
    editListingLinkType,
    isBookable,
    hasListingType,
    hasStockManagementInUse,
    currentStock,
    intl,
  } = props;

  if (!hasListingType || !(isBookable || hasStockManagementInUse)) {
    return null;
  }

  return (
    <>
      {/* <span className={css.manageLinksSeparator}>{' • '}</span> */}

      {/* {isBookable ? (
        <NamedLink
          className={css.manageLink}
          name="EditListingPage"
          params={{ id, slug, type: editListingLinkType, tab: 'availability' }}
        >
          <FormattedMessage id="ManageListingCard.manageAvailability" />
        </NamedLink>
      ) : (
        <NamedLink
          className={css.manageLink}
          name="EditListingPage"
          params={{ id, slug, type: editListingLinkType, tab: 'pricing-and-stock' }}
        >
          {currentStock == null
            ? intl.formatMessage({ id: 'ManageListingCard.setPriceAndStock' })
            : intl.formatMessage({ id: 'ManageListingCard.manageStock' }, { currentStock })}
        </NamedLink>
      )} */}
    </>
  );
};

const PriceMaybe = props => {
  const { price, publicData, config, intl } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const showPrice = displayPrice(foundListingTypeConfig);
  if (showPrice && !price) {
    return (
      <div className={css.noPrice}>
        <FormattedMessage id="ManageListingCard.priceNotSet" />
      </div>
    );
  } else if (!showPrice) {
    return null;
  }

  const { amount, currency } = price;
  const priceMoney = new Money(amount, currency);

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(priceMoney, config.currency, intl);
  return (
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage
            id="ManageListingCard.perUnit"
            values={{ unitType: publicData?.unitType }}
          />
        </div>
      ) : null}
    </div>
  );
};

export const ManageListingCardComponent = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const {
    className,
    rootClassName,
    hasClosingError,
    hasOpeningError,
    history,
    intl,
    isMenuOpen,
    actionsInProgressListingId,
    listing,
    onCloseListing,
    onOpenListing,
    onToggleMenu,
    renderSizes,
    tableView,
    onUpdateListing,
    isCheckedListings,
    handleCheckboxChange,
  } = props;

  const { quantity } = listing?.currentStock?.attributes || {};
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, state, publicData } = currentListing.attributes;

  const { subCategory, businessListingUnavailable } = publicData || {};
  let status;
  if (state === 'draft') {
    status = 'Draft';
  } else if (state === 'closed' || businessListingUnavailable) {
    status = 'Unavailable';
  } else if (state === 'published') {
    status = 'Published';
  } else {
    status = 'Unknown'; // Handle any other state value
  }
  const slug = createSlug(title);
  const isPendingApproval = state === LISTING_STATE_PENDING_APPROVAL;
  const isClosed = state === LISTING_STATE_CLOSED;
  const isDraft = state === LISTING_STATE_DRAFT;

  const { listingType, transactionProcessAlias } = publicData || {};
  const isBookable = isBookingProcessAlias(transactionProcessAlias);
  const isProductOrder = isPurchaseProcessAlias(transactionProcessAlias);
  const hasListingType = !!listingType;
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const currentStock = currentListing.currentStock?.attributes?.quantity;
  const isOutOfStock = currentStock === 0;
  const showOutOfStockOverlay =
    !isBookable && isOutOfStock && !isPendingApproval && !isClosed && !isDraft;
  const hasStockManagementInUse =
    isProductOrder && foundListingTypeConfig?.stockType === STOCK_MULTIPLE_ITEMS;

  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const menuItemClasses = classNames(css.menuItem, {
    [css.menuItemDisabled]: !!actionsInProgressListingId,
  });

  const hasError = hasOpeningError || hasClosingError;
  const thisListingInProgress =
    actionsInProgressListingId && actionsInProgressListingId.uuid === id;

  const onOverListingLink = () => {
    // Enforce preloading of ListingPage (loadable component)
    const { component: Page } = findRouteByRouteName('ListingPage', routeConfiguration);
    // Loadable Component has a "preload" function.
    if (Page.preload) {
      Page.preload();
    }
  };
  const { listingsSoldPrice, listingsSoldCount, currentPlanData, freePlanData } =
    (!!currentListing?.author?.id && currentListing?.author.attributes.profile.publicData) || {};

  const isExceedPriceLimit = checkPriceLimit(listingsSoldPrice, freePlanData, currentPlanData);
  const isExceedCountLimit = checkCountLimit(listingsSoldCount, freePlanData, currentPlanData);

  const titleClasses = classNames(css.title, {
    [css.titlePending]: isPendingApproval,
    [css.titleDraft]: isDraft,
  });

  const editListingLinkType = isDraft
    ? LISTING_PAGE_PARAM_TYPE_DRAFT
    : LISTING_PAGE_PARAM_TYPE_EDIT;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const popModal = (
    <Modal
      id="ManageListingCard.popUp"
      isOpen={isInfoModalOpen}
      onClose={event => {
        event.preventDefault();
        event.stopPropagation();
        setIsInfoModalOpen(false);
      }}
      usePortal
      onManageDisableScrolling={() => {}}
    >
      <div>
        <span>
          <FormattedMessage id="ManageListingCard.userInfo" />
        </span>
      </div>
    </Modal>
  );

  return tableView ? (
    <tr>
      <td>
        <div className={css.checkboxWrapper}>
          {popModal}
          <div key={listing.id}>
            <Checkbox
              checked={isCheckedListings.includes(listing?.id?.uuid)}
              onChange={() => handleCheckboxChange(listing?.id?.uuid)}
            />
            {/* Render other listing details here */}
          </div>
          <div className={css.imageWrapper}>
            {status === 'Draft' ? (
              <NamedLink
                name="EditListingPage"
                params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_DRAFT, tab: 'details' }}
              >
                <AspectRatioWrapper
                  width={aspectWidth}
                  height={aspectHeight}
                  className={css.aspectWrapper}
                >
                  <ResponsiveImage
                    rootClassName={css.rootForImage}
                    alt={title}
                    image={firstImage}
                    variants={variants}
                    sizes={renderSizes}
                  />
                </AspectRatioWrapper>
              </NamedLink>
            ) : (
              <div
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  history.push(createListingURL(routeConfiguration, listing));
                }}
              >
                <AspectRatioWrapper
                  width={aspectWidth}
                  height={aspectHeight}
                  className={css.aspectWrapper}
                >
                  <ResponsiveImage
                    rootClassName={css.rootForImage}
                    alt={title}
                    image={firstImage}
                    variants={variants}
                    sizes={renderSizes}
                  />
                </AspectRatioWrapper>
              </div>
            )}

            <div className={css.mainInfo}>
              <div className={css.titleWrapper}>
                {status === 'Draft' ? (
                  <NamedLink
                    name="EditListingPage"
                    params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_DRAFT, tab: 'details' }}
                  >
                    {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
                  </NamedLink>
                ) : (
                  <InlineTextButton
                    rootClassName={titleClasses}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      history.push(createListingURL(routeConfiguration, listing));
                    }}
                  >
                    {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
                  </InlineTextButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
      <td>
        <PriceMaybe price={price} publicData={publicData} config={config} intl={intl} />
      </td>
      <td>{quantity}</td>
      <td>
        <div className={css.Category}>{subCategory}</div>
      </td>
      <td>
        <div className={css.status}>{status}</div>
      </td>
      <td className={css.tableMenuBar}>
        <div className={css.menubarWrapper}>
          <div className={css.menubarGradient} />
          <div className={css.menubar}>
            <Menu
              className={classNames(css.menu, { [css.cardIsOpen]: true })}
              contentPlacementOffset={MENU_CONTENT_OFFSET}
              contentPosition="left"
              useArrow={false}
              onToggleActive={isOpen => {
                const listingOpen = isOpen ? currentListing : null;
                onToggleMenu(listingOpen);
              }}
              isOpen={isMenuOpen}
            >
              <MenuLabel className={css.menuLabel} isOpenClassName={css.listingMenuIsOpen}>
                <div className={css.iconWrapper}>
                  <MenuIcon className={css.menuIcon} isActive={isMenuOpen} tableMenuIcon={true} />
                </div>
              </MenuLabel>
              {businessListingUnavailable ? (
                <MenuContent rootClassName={css.menuContent}>
                  <MenuItem key="open-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          setIsInfoModalOpen(true);
                        }
                      }}
                    >
                      <FormattedMessage id="ManageListingCard.openListing" />
                    </InlineTextButton>
                  </MenuItem>
                </MenuContent>
              ) : (
                <MenuContent rootClassName={css.menuContent}>
                  <MenuItem key="share">
                    <InlineTextButton rootClassName={menuItemClasses}>
                      <FormattedMessage id="ManageListingCard.share" />
                    </InlineTextButton>
                  </MenuItem>

                  <MenuItem key="edit-listing">
                    <InlineTextButton rootClassName={menuItemClasses}>
                      <NamedLink
                        className={css.manageLink}
                        name="EditListingPage"
                        params={{ id, slug, type: editListingLinkType, tab: 'details' }}
                      >
                        <FormattedMessage id="ManageListingCard.edit" />
                      </NamedLink>
                    </InlineTextButton>
                  </MenuItem>
                  {state == 'closed' ? (
                    <MenuItem key="open-listing">
                      <InlineTextButton
                        rootClassName={menuItemClasses}
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!actionsInProgressListingId) {
                            onToggleMenu(null);
                            onOpenListing(currentListing.id);
                          }
                        }}
                      >
                        <FormattedMessage id="ManageListingCard.openListing" />
                      </InlineTextButton>
                    </MenuItem>
                  ) : (
                    <MenuItem key="close-listing">
                      <InlineTextButton
                        rootClassName={menuItemClasses}
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!actionsInProgressListingId) {
                            onToggleMenu(null);
                            onCloseListing(currentListing.id);
                          }
                        }}
                      >
                        <FormattedMessage id="ManageListingCard.closeListing" />
                      </InlineTextButton>
                    </MenuItem>
                  )}
                  <MenuItem key="delete-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          onUpdateListing(currentListing?.id, {
                            publicData: {
                              isDeleted: true,
                            },
                          });
                          onCloseListing(currentListing?.id);
                          fetchListings();
                        }
                      }}
                    >
                      <FormattedMessage id="ManageListingCard.deleteListing" />
                    </InlineTextButton>
                  </MenuItem>
                </MenuContent>
              )}
            </Menu>
          </div>
        </div>
      </td>
    </tr>
  ) : (
    <div className={classes}>
      <div
        className={css.clickWrapper}
        tabIndex={0}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();

          // ManageListingCard contains links, buttons and elements that are working with routing.
          // This card doesn't work if <a> or <button> is used to wrap events that are card 'clicks'.
          //
          // NOTE: It might be better to absolute-position those buttons over a card-links.
          // (So, that they have no parent-child relationship - like '<a>bla<a>blaa</a></a>')
          history.push(createListingURL(routeConfiguration, listing));
        }}
        onMouseOver={onOverListingLink}
        onTouchStart={onOverListingLink}
      >
        <AspectRatioWrapper
          className={css.cardAspectRatio}
          width={aspectWidth}
          height={aspectHeight}
        >
          <ResponsiveImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={variants}
            sizes={renderSizes}
            className={css.responsiveImg}
          />
        </AspectRatioWrapper>

        <div className={classNames(css.menuOverlayWrapper)}>
          <div className={classNames(css.menuOverlay, { [css.menuOverlayOpen]: isMenuOpen })} />
        </div>
        <div className={css.menubarWrapper}>
          <div className={css.menubarGradient} />
          <div className={css.menubar}>
            <Menu
              className={classNames(css.menu, { [css.cardIsOpen]: true })}
              contentPlacementOffset={MENU_CONTENT_OFFSET}
              contentPosition="left"
              useArrow={false}
              onToggleActive={isOpen => {
                const listingOpen = isOpen ? currentListing : null;
                onToggleMenu(listingOpen);
              }}
              isOpen={isMenuOpen}
            >
              <MenuLabel className={css.menuLabel} isOpenClassName={css.listingMenuIsOpen}>
                <div className={css.iconWrapper}>
                  <MenuIcon className={css.menuIcon} isActive={isMenuOpen} />
                </div>
              </MenuLabel>
              <MenuContent rootClassName={css.menuContent}>
                <MenuItem key="share">
                  <InlineTextButton rootClassName={menuItemClasses}>
                    <FormattedMessage id="ManageListingCard.share" />
                  </InlineTextButton>
                </MenuItem>

                <MenuItem key="edit-listings">
                  <InlineTextButton rootClassName={menuItemClasses}>
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        const params = { id, slug, type: editListingLinkType, tab: 'details' };
                        const url = createResourceLocatorString(
                          'EditListingPage',
                          routeConfiguration,
                          params,
                          {}
                        );
                        history.push(url);
                      }}
                    >
                      Edit
                    </div>
                  </InlineTextButton>
                </MenuItem>
                {state == 'closed' ? (
                  <MenuItem key="open-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          onOpenListing(currentListing.id);
                        }
                      }}
                    >
                      <FormattedMessage id="ManageListingCard.openListing" />
                    </InlineTextButton>
                  </MenuItem>
                ) : (
                  <MenuItem key="close-listing">
                    <InlineTextButton
                      rootClassName={menuItemClasses}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!actionsInProgressListingId) {
                          onToggleMenu(null);
                          onCloseListing(currentListing.id);
                        }
                      }}
                    >
                      <FormattedMessage id="ManageListingCard.closeListing" />
                    </InlineTextButton>
                  </MenuItem>
                )}
                <MenuItem key="delete-listing">
                  <InlineTextButton
                    rootClassName={menuItemClasses}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!actionsInProgressListingId) {
                        onToggleMenu(null);
                        onUpdateListing(currentListing?.id, {
                          publicData: {
                            isDeleted: true,
                          },
                        });
                        onCloseListing(currentListing?.id);
                      }
                    }}
                  >
                    <FormattedMessage id="ManageListingCard.deleteListing" />
                  </InlineTextButton>
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </div>

        <ShowFinishDraftOverlayMaybe
          isDraft={isDraft}
          title={title}
          id={id}
          slug={slug}
          hasImage={!!firstImage}
          intl={intl}
        />
        <ShowClosedOverlayMaybe
          isClosed={isClosed}
          title={title}
          actionsInProgressListingId={actionsInProgressListingId}
          currentListingId={currentListing.id}
          onOpenListing={onOpenListing}
          intl={intl}
        />

        <div>
          {businessListingUnavailable && (
            <Overlay message={''}>
              <PrimaryButtonInline
                className={css.openListingButton}
                disabled={!!actionsInProgressListingId}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsInfoModalOpen(true);
                }}
              >
                <FormattedMessage id="ManageListingCard.openListing" />
              </PrimaryButtonInline>
            </Overlay>
          )}
        </div>

        <div>
          {(isExceedPriceLimit ||
            isExceedCountLimit ||
            (!currentPlanData?.isActive && !freePlanData?.isFreePlanActive)) && (
            <Overlay message={''}>
              <div className={css.openListingButton}>
                <FormattedMessage id="AlgoliaSearchCard.openListing" />
              </div>
            </Overlay>
          )}
        </div>

        <ShowPendingApprovalOverlayMaybe
          isPendingApproval={isPendingApproval}
          title={title}
          intl={intl}
        />

        <ShowOutOfStockOverlayMaybe
          showOutOfStockOverlay={showOutOfStockOverlay}
          title={title}
          id={id}
          slug={slug}
          actionsInProgressListingId={actionsInProgressListingId}
          currentListingId={currentListing.id}
          onCloseListing={onCloseListing}
          onUpdateListing={onUpdateListing}
          hasStockManagementInUse={hasStockManagementInUse}
          intl={intl}
        />

        {thisListingInProgress ? (
          <Overlay>
            <IconSpinner />
          </Overlay>
        ) : hasError ? (
          <Overlay errorMessage={intl.formatMessage({ id: 'ManageListingCard.actionFailed' })} />
        ) : null}
      </div>

      <div className={css.info}>
        <PriceMaybe price={price} publicData={publicData} config={config} intl={intl} />

        <div className={css.mainInfo}>
          <div className={css.titleWrapper}>
            <InlineTextButton
              rootClassName={titleClasses}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                history.push(createListingURL(routeConfiguration, listing));
              }}
            >
              {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
            </InlineTextButton>
          </div>
        </div>

        <div className={css.manageLinks}>
          <NamedLink
            className={css.manageLink}
            name="EditListingPage"
            params={{ id, slug, type: editListingLinkType, tab: 'details' }}
          >
            <FormattedMessage id="ManageListingCard.editListing" />
          </NamedLink>

          <LinkToStockOrAvailabilityTab
            id={id}
            slug={slug}
            editListingLinkType={editListingLinkType}
            isBookable={isBookable}
            currentStock={currentStock}
            hasListingType={hasListingType}
            hasStockManagementInUse={hasStockManagementInUse}
            intl={intl}
          />
          {popModal}
        </div>
      </div>
    </div>
  );
};

ManageListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  actionsInProgressListingId: null,
  renderSizes: null,
};

const { bool, func, shape, string } = PropTypes;

ManageListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  hasClosingError: bool.isRequired,
  hasOpeningError: bool.isRequired,
  intl: intlShape.isRequired,
  listing: propTypes.ownListing.isRequired,
  isMenuOpen: bool.isRequired,
  actionsInProgressListingId: shape({ uuid: string.isRequired }),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  onToggleMenu: func.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

export default compose(withRouter, injectIntl)(ManageListingCardComponent);
