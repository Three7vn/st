import React from 'react';
import { arrayOf, bool, number, oneOf, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import {
  propTypes,
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_NIGHT,
  LINE_ITEM_HOUR,
  LISTING_UNIT_TYPES,
  STOCK_MULTIPLE_ITEMS,
} from '../../util/types';
import { subtractTime } from '../../util/dates';
import {
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  resolveLatestProcessName,
  getProcess,
  isBookingProcess,
} from '../../transactions/transaction';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import {
  H2,
  Avatar,
  NamedLink,
  NotificationBadge,
  Page,
  PaginationLinks,
  TabNav,
  IconSpinner,
  TimeRange,
  UserDisplayName,
  LayoutSideNavigation,
} from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
import { stateDataShape, getStateData } from './InboxPage.stateData';
import css from './InboxPage.module.css';
import { updateTransactionMetadata } from '../../util/api';
import { fetchTransaction } from '../TransactionPage/TransactionPage.duck';
// Check if the transaction line-items use booking-related units
const getUnitLineItem = lineItems => {
  const unitLineItem = lineItems?.find(
    item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal
  );
  return unitLineItem;
};
// Booking data (start & end) are bit different depending on display times and
// if "end" refers to last day booked or the first exclusive day
const bookingData = (tx, lineItemUnitType, timeZone) => {
  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/marketplace.html#bookings
  const { start, end, displayStart, displayEnd } = tx.booking.attributes;
  const bookingStart = displayStart || start;
  const bookingEndRaw = displayEnd || end;
  // When unit type is night, we can assume booking end to be inclusive.
  const isNight = lineItemUnitType === LINE_ITEM_NIGHT;
  const isHour = lineItemUnitType === LINE_ITEM_HOUR;
  const bookingEnd =
    isNight || isHour ? bookingEndRaw : subtractTime(bookingEndRaw, 1, 'days', timeZone);
  return { bookingStart, bookingEnd };
};
const BookingTimeInfoMaybe = props => {
  const { transaction, ...rest } = props;
  const processName = resolveLatestProcessName(transaction?.attributes?.processName);
  const process = getProcess(processName);
  const isInquiry = process.getState(transaction) === process.states.INQUIRY;
  if (isInquiry) {
    return null;
  }
  const hasLineItems = transaction?.attributes?.lineItems?.length > 0;
  const unitLineItem = hasLineItems
    ? transaction.attributes?.lineItems?.find(
      item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal
    )
    : null;
  const lineItemUnitType = unitLineItem ? unitLineItem.code : null;
  const dateType = lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE;
  const timeZone = transaction?.listing?.attributes?.availabilityPlan?.timezone || 'Etc/UTC';
  const { bookingStart, bookingEnd } = bookingData(transaction, lineItemUnitType, timeZone);
  return (
    <TimeRange
      startDate={bookingStart}
      endDate={bookingEnd}
      dateType={dateType}
      timeZone={timeZone}
      {...rest}
    />
  );
};
BookingTimeInfoMaybe.propTypes = {
  transaction: propTypes.transaction.isRequired,
};
export const InboxItem = props => {
  const {
    transactionRole,
    tx,
    intl,
    stateData,
    isBooking,
    stockType = STOCK_MULTIPLE_ITEMS,
    currentUser,
    config,
    tab,
  } = props;
  const dispatch = useDispatch();
  const { transitions, payinTotal, metadata } = tx?.attributes || {};
  const { orderNumber, buyerAddress } = tx?.attributes?.protectedData || {};

  const location = buyerAddress || {};
  const { isCustomerMessage, isProviderMessage, lastUpdatedTime } = metadata || {};
  // Find the entry with the transition "transition/offer-accept-by-provider"
  const transitionEntry = transitions.find(
    entry =>
      entry.transition === 'transition/offer-accept-by-provider' || 'transition/confirm-payment'
  );
  const messages = transitions?.[0]?.transition === 'transition/inquire-without-payment';
  // Format the createdAt date
  const formattedDateYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour12: true,
  }).format(transitionEntry?.createdAt);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour12: true,
  }).format(transitionEntry?.createdAt);
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(transitionEntry?.createdAt);
  const lastTransition = tx?.attributes?.lastTransition || {};
  const { customer, provider, listing } = tx;
  const storeName = tx?.provider?.attributes?.profile?.publicData?.storeName || 'you';
  const userName = tx?.customer?.attributes?.profile?.publicData?.userName || '';
  const itemName = tx?.listing?.attributes?.title || '';
  const { listingImagesUrl } = listing?.attributes?.publicData || {};
  const listingImageUrl = listingImagesUrl?.[0]?.url;
  const { processName, processState, actionNeeded, isSaleNotification, isFinal } = stateData;
  const isCustomer = customer?.id?.uuid === currentUser?.id?.uuid;
  const lineItems = tx.attributes?.lineItems;
  const hasPricingData = lineItems.length > 0;
  const unitLineItem = getUnitLineItem(lineItems);
  const quantity = hasPricingData && !isBooking ? unitLineItem.quantity.toString() : null;
  const showStock = stockType === STOCK_MULTIPLE_ITEMS || (quantity && unitLineItem.quantity > 1);
  const otherUser = isCustomer ? provider : customer;
  const otherUserDisplayName = <UserDisplayName user={otherUser} intl={intl} />;
  const isOtherUserBanned = otherUser.attributes.banned;
  const rowNotificationDot = isSaleNotification ? <div className={css.notificationDot} /> : null;
  const messageNotificationdot =
    (!isCustomer && isCustomerMessage) || (isCustomer && isProviderMessage) ? (
      <div className={css.notificationDot} />
    ) : null;

  const notificationRecieve =
    tx?.attributes?.lastTransition === 'transition/make-an-offer-by-customer';

  const offerNotificationdot = notificationRecieve ? <div className={css.notificationDot} /> : null;

  const messageFunc = () => {
    if (isCustomer === true) {
      if (
        isProviderMessage === false &&
        processName == 'default-inquiry' &&
        lastTransition == 'transition/inquire-without-payment'
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      false;
    }
    if (isCustomer === false) {
      if (
        isProviderMessage === true &&
        processName == 'default-inquiry' &&
        lastTransition == 'transition/inquire-without-payment'
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      false;
    }
  };

  const isVisibleText = messageFunc();

  const linkClasses = classNames(css.itemLink, {
    [css.bannedUserLink]: isOtherUserBanned,
  });
  const stateClasses = classNames(css.stateName, {
    [css.stateConcluded]: isFinal,
    [css.stateActionNeeded]: actionNeeded,
    [css.stateNoActionNeeded]: !actionNeeded,
    [css.pending]: processState == 'offer',
    [css.expired]: processState == 'offer-expired' || processState == 'payment-expired',
    [css.notShipped]: processState == 'purchased' || processState == 'offer-declined',
    [css.new]: processState == 'free-inquiry',
    [css.delivered]: processState == 'delivered',
    [css.shipped]: processState == 'reviewed',
  });
  return (
    <div className={css.item}>
      <div className={css.itemAvatar}>
        {messages ? (
          <Avatar user={otherUser} />
        ) : (
          <Avatar user={otherUser} listingImageUrl={listingImageUrl} />
        )}
      </div>
      <NamedLink
        className={linkClasses}
        name={isCustomer ? 'OrderDetailsPage' : 'SaleDetailsPage'}
        params={{ id: tx.id.uuid }}
      >
        <div
          onClick={async () => {
            const result = await updateTransactionMetadata({
              id: tx.id,
              isCustomerMessage: !isCustomer && isCustomerMessage ? false : isCustomerMessage,
              isProviderMessage: isCustomer && isProviderMessage ? false : isProviderMessage,
              lastUpdatedTime,
            });
            if (result) {
              dispatch(fetchTransaction(tx.id, transactionRole, config));
            }
          }}
          className={css.messageInfoWrapper}
        >
          <div>
            <div className={css.itemUsername}>
              {tab === 'offerRecieved' || tab === 'offerSent'
                ? itemName
                : !isCustomer
                  ? tx?.customer?.attributes?.profile?.publicData?.userName
                  : tx?.provider?.attributes?.profile?.publicData?.storeName ||
                  tx?.provider?.attributes?.profile?.publicData?.userName}
              <span className={css.rowNotificationDot}>
                {tab === 'messages'
                  ? messageNotificationdot
                  : tab === 'offerRecieved'
                    ? offerNotificationdot
                    : rowNotificationDot}
              </span>
            </div>
            <div className={css.itemDetails}>
              {tab === 'offerRecieved' || tab === 'offerSent' ? (
                <span>
                  {isCustomer ? (
                    <>
                      <strong>{storeName}</strong> sent an offer of{' '}
                      <strong>£{payinTotal?.amount / 100}</strong>
                    </>
                  ) : (
                    <>
                      <strong>{userName}</strong> sent an offer of{' '}
                      <strong>£{payinTotal?.amount / 100}</strong>
                    </>
                  )}
                </span>
              ) : (
                <>
                  <span>
                    {tab !== 'messages' && `${formattedDate},`}
                    {lastUpdatedTime &&
                      `${lastUpdatedTime.split(' ')[2]} ${lastUpdatedTime.split(' ')[3]}`}
                  </span>
                  {!messages && <span>&nbsp;| &nbsp;{`£${payinTotal?.amount / 100} Paid`}</span>}
                  {!messages && (
                    <span>
                      &nbsp;|&nbsp;
                      {!isCustomer
                        ? `${location?.address_line_1}, ${location?.postalCode}`
                        : 'Stripe'}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {/* <div className={css.itemDetails}>
          {isBooking ? (
            <BookingTimeInfoMaybe transaction={tx} />
          ) : hasPricingData && showStock ? (
            <FormattedMessage id="InboxPage.quantity" values={{ quantity }} />
          ) : null}
        </div> */}
          <div>
            <div className={css.itemState}>
              <div className={stateClasses}>
                {!isVisibleText ? null : (
                  <>
                    {(!isCustomer && isCustomerMessage) || (isCustomer && isProviderMessage) ? (
                      <FormattedMessage
                        id={`InboxPage.${processName}.${processState}.status`}
                        values={{ transactionRole }}
                      />
                    ) : lastTransition === 'transition/expire-offer' ? (
                      <FormattedMessage
                        id={`InboxPage.${processName}.${processState}.expiredStatus`}
                        values={{ transactionRole }}
                      />
                    ) : null}
                  </>
                )}

                {/* {
                  isCustomer && !isProviderMessage ? "" : "New"
                } */}
              </div>
            </div>
            {tab === 'offerRecieved' || tab === 'offerSent'
              ? formattedDateYear
              : tab === 'messages'
                ? formattedDate
                : `#${orderNumber}`}
          </div>
        </div>
      </NamedLink>
    </div>
  );
};
InboxItem.propTypes = {
  transactionRole: oneOf([TX_TRANSITION_ACTOR_CUSTOMER, TX_TRANSITION_ACTOR_PROVIDER]).isRequired,
  tx: propTypes.transaction.isRequired,
  intl: intlShape.isRequired,
  stateData: stateDataShape.isRequired,
};
export const InboxPageComponent = props => {
  const config = useConfiguration();
  const {
    currentUser,
    fetchInProgress,
    fetchOrdersOrSalesError,
    intl,
    pagination,
    params,
    providerNotificationCount,
    customerNotificationCount,
    scrollingDisabled,
    transactions,
    currentUserHasListings,
    notificationOfferRecieve,
    notificationMessageRecieve,
  } = props;
  const { tab } = params;
  const validTab =
    tab === 'orders' ||
    tab === 'sales' ||
    tab === 'messages' ||
    tab === 'offerRecieved' ||
    tab === 'offerSent';
  if (!validTab) {
    return <NotFoundPage />;
  }
  const sortTransactionsByDateTime = transactions => {
    return transactions?.sort((a, b) => {
      const dateA = new Date(a.attributes.metadata.lastUpdatedTime);
      const dateB = new Date(b.attributes.metadata.lastUpdatedTime);

      // Compare dates first
      if (dateA.toDateString() !== dateB.toDateString()) {
        return dateB - dateA; // Sort by date in descending order
      }

      // If dates are the same, compare times
      return dateB.getTime() - dateA.getTime(); // Sort by time in descending order
    });
  };

  if (tab === 'messages' && transactions?.length > 0) {
    sortTransactionsByDateTime(transactions);
  }

  const isOrders = tab === 'orders';
  const isMessages = tab === 'messages';
  const isOfferRecieved = tab === 'offerRecieved';
  const isOfferSent = tab === '"offerSent"';
  const hasNoResults = !fetchInProgress && transactions.length === 0 && !fetchOrdersOrSalesError;
  const ordersTitle = intl.formatMessage({ id: 'InboxPage.ordersTitle' });
  const salesTitle = intl.formatMessage({ id: 'InboxPage.salesTitle' });
  const title = isOrders ? ordersTitle : salesTitle;
  const pickType = lt => conf => conf.listingType === lt;
  const findListingTypeConfig = publicData => {
    const listingTypeConfigs = config.listing?.listingTypes;
    const { listingType } = publicData || {};
    const foundConfig = listingTypeConfigs?.find(pickType(listingType));
    return foundConfig;
  };
  const toTxItem = tx => {
    const transactionRole = isOrders ? TX_TRANSITION_ACTOR_CUSTOMER : TX_TRANSITION_ACTOR_PROVIDER;
    let stateData = null;
    try {
      stateData = getStateData({ transaction: tx, transactionRole, intl });
    } catch (error) {
      // If stateData is missing, omit the transaction from InboxItem list.
    }
    const publicData = tx?.listing?.attributes?.publicData || {};
    const foundListingTypeConfig = findListingTypeConfig(publicData);
    const { transactionType, stockType } = foundListingTypeConfig || {};
    const process = tx?.attributes?.processName || transactionType?.transactionType;
    const transactionProcess = resolveLatestProcessName(process);
    const isBooking = isBookingProcess(transactionProcess);
    // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
    return stateData ? (
      <li key={tx.id.uuid} className={css.listItem}>
        <InboxItem
          transactionRole={transactionRole}
          tx={tx}
          intl={intl}
          stateData={stateData}
          stockType={stockType}
          isBooking={isBooking}
          currentUser={currentUser}
          tab={tab}
        />
      </li>
    ) : null;
  };
  const hasOrderOrSaleTransactions = (tx, isOrdersTab, user) => {
    return isOrdersTab
      ? user?.id && tx && tx.length > 0 && tx[0].customer.id.uuid === user?.id?.uuid
      : user?.id && tx && tx.length > 0 && tx[0].provider.id.uuid === user?.id?.uuid;
  };
  const hasTransactions =
    !fetchInProgress && hasOrderOrSaleTransactions(transactions, isOrders, currentUser);
  const tabs = [
    {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabMessage" />
          {notificationMessageRecieve > 0 ? (
            <NotificationBadge count={notificationMessageRecieve} />
          ) : null}
        </span>
      ),
      selected: isMessages,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'messages' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabPurchase" />
        </span>
      ),
      selected: isOrders,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'orders' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="InboxPage.salesTabOrder" />
          {providerNotificationCount > 0 ? (
            <NotificationBadge count={providerNotificationCount} />
          ) : null}
        </span>
      ),
      selected: window.location.pathname == '/inbox/sales',
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'sales' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabOfferRecieved" />
          {notificationOfferRecieve > 0 ? (
            <NotificationBadge count={notificationOfferRecieve} />
          ) : null}
        </span>
      ),
      selected: window.location.pathname == '/inbox/offerRecieved',
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'offerRecieved' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabOfferSent" />
        </span>
      ),
      selected: window.location.pathname == '/inbox/offerSent',
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'offerSent' },
      },
    },
  ];
  const nav = (
    <TabNav
      rootClassName={css.tabs}
      tabRootClassName={css.tab}
      tabs={tabs}
    />
  );
  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        sideNavClassName={css.navigation}
        topbar={
          <TopbarContainer
            mobileRootClassName={css.mobileTopbar}
            desktopClassName={css.desktopTopbar}
          />
        }
        sideNav={
          <>
            <H2 as="h1" className={css.title}>
              <FormattedMessage id="InboxPage.title" />
            </H2>
            {/* <TabNav rootClassName={css.tabs} tabRootClassName={css.tab} tabs={tabs} />{' '} */}
            {nav}
          </>
        }
        footer={<FooterContainer />}
      >
        {fetchOrdersOrSalesError ? (
          <p className={css.error}>
            <FormattedMessage id="InboxPage.fetchFailed" />
          </p>
        ) : null}
        <div className={css.heading}>
          <h4>
            {window.location.pathname == '/inbox/messages'
              ? 'My Message'
              : window.location.pathname == '/inbox/orders'
                ? 'My Purchases'
                : window.location.pathname == '/inbox/sales'
                  ? 'My Orders'
                  : window.location.pathname == '/inbox/offerRecieved'
                    ? 'Offer Received'
                    : window.location.pathname == '/inbox/offerSent'
                      ? 'Offer Sent'
                      : ''}
          </h4>
        </div>
        <ul className={css.itemList}>
          {!fetchInProgress ? (
            transactions.map(toTxItem)
          ) : (
            <li className={css.listItemsLoading}>
              <IconSpinner />
            </li>
          )}
          {hasNoResults ? (
            <li key="noResults" className={css.noResults}>
              <FormattedMessage
                id={isOrders ? 'InboxPage.noOrdersFound' : 'InboxPage.noSalesFound'}
              />
            </li>
          ) : null}
        </ul>
        {hasTransactions && pagination && pagination.totalPages > 1 ? (
          <PaginationLinks
            className={css.pagination}
            pageName="InboxPage"
            pagePathParams={params}
            pagination={pagination}
          />
        ) : null}
      </LayoutSideNavigation>
    </Page>
  );
};
InboxPageComponent.defaultProps = {
  currentUser: null,
  currentUserHasOrders: null,
  fetchOrdersOrSalesError: null,
  pagination: null,
  providerNotificationCount: 0,
  sendVerificationEmailError: null,
};
InboxPageComponent.propTypes = {
  params: shape({
    tab: string.isRequired,
  }).isRequired,
  currentUser: propTypes.currentUser,
  fetchInProgress: bool.isRequired,
  fetchOrdersOrSalesError: propTypes.error,
  pagination: propTypes.pagination,
  providerNotificationCount: number,
  scrollingDisabled: bool.isRequired,
  transactions: arrayOf(propTypes.transaction).isRequired,
  // from injectIntl
  intl: intlShape.isRequired,
};
const mapStateToProps = state => {
  const { fetchInProgress, fetchOrdersOrSalesError, pagination, transactionRefs } = state.InboxPage;
  const {
    currentUser,
    currentUserNotificationCount: providerNotificationCount,
    currentUserOrderNotificationCount: customerNotificationCount,
    currentUserHasListings,
    currentUserOfferRecieveNotificationCount: notificationOfferRecieve,
    currentUserOrderMessageNotificationCount: notificationMessageRecieve,
  } = state.user;
  return {
    currentUser,
    fetchInProgress,
    fetchOrdersOrSalesError,
    currentUserHasListings,
    pagination,
    providerNotificationCount,
    notificationOfferRecieve,
    customerNotificationCount,
    notificationMessageRecieve,
    scrollingDisabled: isScrollingDisabled(state),
    transactions: getMarketplaceEntities(state, transactionRefs),
  };
};
const InboxPage = compose(connect(mapStateToProps), injectIntl)(InboxPageComponent);
export default InboxPage;
