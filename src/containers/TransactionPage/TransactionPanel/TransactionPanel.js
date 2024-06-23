import React, { Component, useState } from 'react';
import { arrayOf, bool, func, node, object, oneOf, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { displayPrice } from '../../../util/configHelpers';
import { propTypes } from '../../../util/types';
import { userDisplayNameAsString } from '../../../util/data';
import { isMobileSafari } from '../../../util/userAgent';
import { createSlug } from '../../../util/urlHelpers';

import { AvatarLarge, Button, Modal, NamedLink, UserDisplayName } from '../../../components';

import { stateDataShape } from '../TransactionPage.stateData';
import SendMessageForm from '../SendMessageForm/SendMessageForm';

// These are internal components that make this file more readable.
import BreakdownMaybe from './BreakdownMaybe';
import DetailCardHeadingsMaybe from './DetailCardHeadingsMaybe';
import DetailCardImage from './DetailCardImage';
import DeliveryInfoMaybe from './DeliveryInfoMaybe';
import BookingLocationMaybe from './BookingLocationMaybe';
import InquiryMessageMaybe from './InquiryMessageMaybe';
import FeedSection from './FeedSection';
import ActionButtonsMaybe from './ActionButtonsMaybe';
import DiminishedActionButtonMaybe from './DiminishedActionButtonMaybe';
import PanelHeading from './PanelHeading';

import css from './TransactionPanel.module.css';
import { createResourceLocatorString, findRouteByRouteName } from '../../../util/routes';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { transitions } from '../../../transactions/transactionProcessPurchase';
import { listingConditions } from '../../../config/configListing';
import { reportUserEmailToAdmin } from '../../../util/api';
import { downloadFiles } from '../../../util/dataExtractor';

const { Money } = sdkTypes;

// Helper function to get display names for different roles
const displayNames = (currentUser, provider, customer, intl) => {
  const authorDisplayName = <UserDisplayName user={provider} intl={intl} />;
  const customerDisplayName = <UserDisplayName user={customer} intl={intl} />;

  let otherUserDisplayName = '';
  let otherUserDisplayNameString = '';
  const currentUserIsCustomer =
    currentUser.id && customer?.id && currentUser.id.uuid === customer?.id?.uuid;
  const currentUserIsProvider =
    currentUser.id && provider?.id && currentUser.id.uuid === provider?.id?.uuid;

  if (currentUserIsCustomer) {
    otherUserDisplayName = authorDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(provider, '');
  } else if (currentUserIsProvider) {
    otherUserDisplayName = customerDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(customer, '');
  }

  return {
    authorDisplayName,
    customerDisplayName,
    otherUserDisplayName,
    otherUserDisplayNameString,
  };
};

export class TransactionPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendMessageFormFocused: false,
      offerPrice: '',
      errorMessage: '',
      description: '',
      isModalOpen: false,
    };
    this.isMobSaf = false;
    this.sendMessageFormName = 'TransactionPanel.SendMessageForm';

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.onHandleSubmit = this.onHandleSubmit.bind(this);
    this.handleReportUser = this.handleReportUser.bind(this);

    this.onSendMessageFormFocus = this.onSendMessageFormFocus.bind(this);
    this.onSendMessageFormBlur = this.onSendMessageFormBlur.bind(this);
    this.onMessageSubmit = this.onMessageSubmit.bind(this);
    this.scrollToMessage = this.scrollToMessage.bind(this);
  }

  componentDidMount() {
    this.isMobSaf = isMobileSafari();
  }

  onSendMessageFormFocus() {
    this.setState({ sendMessageFormFocused: true });
    if (this.isMobSaf) {
      // Scroll to bottom
      window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
    }
  }

  onSendMessageFormBlur() {
    this.setState({ sendMessageFormFocused: false });
  }

  onMessageSubmit(values, form) {
    const message = values.message ? values.message.trim() : null;
    const { transactionId, onSendMessage, config, transactionRole, metaData } = this.props;

    if (!message) {
      return;
    }
    onSendMessage(transactionId, message, config, transactionRole, metaData)
      .then(messageId => {
        form.reset();
        this.scrollToMessage(messageId);
      })
      .catch(e => {
        // Ignore, Redux handles the error
      });
  }

  scrollToMessage(messageId) {
    const selector = `#msg-${messageId.uuid}`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }

  handleInputChange = event => {
    const inputValue = event.target.value.trim();
    // Ensure that only numbers are entered
    const sanitizedValue = inputValue.replace(/\D/g, '');
    this.setState({
      offerPrice: sanitizedValue,
      errorMessage: '', // Clear error message on input change
    });
  };

  handleSubmitOffer = () => {
    const { offerPrice } = this.state;
    const {
      callSetInitialValues,
      listing,
      currentUser,
      routeConfiguration,
      history,
      transactionId,
    } = this.props;

    const formattedOfferPrice = new Money(offerPrice * 100, 'GBP');
    const initialValues = {
      listing,
      orderData: {
        offerPrice: formattedOfferPrice,
      },
      confirmPaymentError: null,
    };
    const saveToSessionStorage = !currentUser;

    // Customize checkout page state with current listing and selected orderData
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', routeConfiguration);

    callSetInitialValues(setInitialValues, initialValues, saveToSessionStorage);
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        routeConfiguration,
        { id: listing.id.uuid, slug: createSlug(listing.attributes.title) },
        {}
      )
    );
  };


  openModal() {
    this.setState({ isModalOpen: true });
  }

  closeModal() {
    this.setState({ isModalOpen: false });
  }

  handleDescriptionChange(event) {
    this.setState({ description: event.target.value });
  }

  onHandleSubmit(event) {
    event.preventDefault();

    const { currentUser, listing } = this.props;

    reportUserEmailToAdmin({
      reporterUserId: currentUser?.id?.uuid,
      sellerUserId: listing?.author?.id?.uuid,
      listingId: listing?.id?.uuid,
      textBox: this.state.description,
      reporterUserName: currentUser?.attributes?.profile?.publicData?.userName,
      reportedUserName: listing?.author?.attributes?.profile?.publicData?.userName
    });

    this.closeModal();
  }

  handleReportUser() {
    this.openModal();
  }


  render() {
    const {
      rootClassName,
      className,
      currentUser,
      transactionRole,
      listing,
      customer,
      provider,
      hasTransitions,
      protectedData,
      messages,
      initialMessageFailed,
      savePaymentMethodFailed,
      fetchMessagesError,
      sendMessageInProgress,
      sendMessageError,
      onOpenDisputeModal,
      intl,
      stateData,
      showBookingLocation,
      activityFeed,
      isInquiryProcess,
      orderBreakdown,
      orderPanel,
      config,
      transaction,
      callSetInitialValues,
      routeConfiguration,
      history,
      transactionId,
      onManageDisableScrolling
    } = this.props;
    const metaData = transaction?.attributes?.metadata || {};
    const { offerPrice: prevOfferPrice, labelData, returnlabelData } = transaction?.attributes?.protectedData || {};

    const { lastTransition } = transaction?.attributes || {};
    const { cartItems } = protectedData || {};

    const isCustomer = transactionRole === 'customer';
    const isProvider = transactionRole === 'provider';

    const listingDeleted = !!listing?.attributes?.deleted;
    const isCustomerBanned = !!customer?.attributes?.banned;
    const isCustomerDeleted = !!customer?.attributes?.deleted;
    const isProviderBanned = !!provider?.attributes?.banned;
    const isProviderDeleted = !!provider?.attributes?.deleted;

    const { authorDisplayName, customerDisplayName, otherUserDisplayNameString } = displayNames(
      currentUser,
      provider,
      customer,
      intl
    );

    const deletedListingTitle = intl.formatMessage({
      id: 'TransactionPanel.deletedListingTitle',
    });
    const listingTitle = listingDeleted ? deletedListingTitle : listing?.attributes?.title;
    const { condition, returnProtection } = !!listing?.id && listing?.attributes?.publicData || {};
    const capCondition = listingConditions.find(e => e?.option === condition)?.label;

    const firstImage = listing?.images?.length > 0 ? listing?.images[0] : null;

    const actionButtons = (
      <ActionButtonsMaybe
        showButtons={stateData.showActionButtons}
        primaryButtonProps={stateData?.primaryButtonProps}
        secondaryButtonProps={stateData?.secondaryButtonProps}
        isListingDeleted={listingDeleted}
        isProvider={isProvider}
      />
    );

    const listingType = listing?.attributes?.publicData?.listingType;
    const listingTypeConfigs = config.listing.listingTypes;
    const listingTypeConfig = listingTypeConfigs.find(conf => conf.listingType === listingType);
    const showPrice = isInquiryProcess && displayPrice(listingTypeConfig);

    const showSendMessageForm =
      !isCustomerBanned && !isCustomerDeleted && !isProviderBanned && !isProviderDeleted;

    const deliveryMethod = protectedData?.deliveryMethod || 'none';

    const classes = classNames(rootClassName || css.root, className);
    //Set New Offer Work

    const { OFFER_DECLINE_BY_PROVIDER } = transitions || '';

    const handleReportUser = () => {
      // Define the action you want to take when the user is reported
      // For example, you can show a modal, send a report request, etc.
    };
    const { description, isModalOpen, offerPrice, errorMessage } = this.state;

    // Then in your JSX:
    {
      ['offer-declined'].includes(stateData?.processState) ? null : (
        <div>
          <FormattedMessage id="TransactionPanel.somethingFishy" />&nbsp;
          <a href="#" onClick={handleReportUser}>
            {' '}
            <FormattedMessage id="TransactionPanel.reportUser" />
          </a>
        </div>
      );
    }

    return (
      <div className={classes}>
        <div className={css.container}>
          <div className={css.txInfo}>
            <DetailCardImage
              rootClassName={css.imageWrapperMobile}
              avatarWrapperClassName={css.avatarWrapperMobile}
              listingTitle={listingTitle}
              image={firstImage}
              provider={provider}
              isCustomer={isCustomer}
              listingImageConfig={config.layout.listingImage}
            />
            {/* {isProvider ? (
              <div className={css.avatarWrapperProviderDesktop}>
                <AvatarLarge user={customer} className={css.avatarDesktop} />
              </div>
            ) : null} */}

            <PanelHeading
              processName={stateData.processName}
              processState={stateData.processState}
              showExtraInfo={stateData.showExtraInfo}
              showPriceOnMobile={showPrice}
              price={listing?.attributes?.price}
              intl={intl}
              deliveryMethod={deliveryMethod}
              isPendingPayment={!!stateData.isPendingPayment}
              transactionRole={transactionRole}
              providerName={authorDisplayName}
              provider={provider}
              customer={customer}
              customerName={customerDisplayName}
              isCustomerBanned={isCustomerBanned}
              listingId={listing?.id?.uuid}
              listingTitle={listingTitle}
              listingDeleted={listingDeleted}
              lastTransition={lastTransition}
            />

            <InquiryMessageMaybe
              protectedData={protectedData}
              showInquiryMessage={isInquiryProcess}
              isCustomer={isCustomer}
            />

            {!isInquiryProcess ? (
              <div className={css.orderDetails}>
                <div className={css.orderDetailsMobileSection}>
                  <BreakdownMaybe
                    orderBreakdown={orderBreakdown}
                    stateData={stateData.processState}
                    processName={stateData.processName}
                  />
                  <DiminishedActionButtonMaybe
                    showDispute={stateData.showDispute}
                    onOpenDisputeModal={onOpenDisputeModal}
                  />
                </div>

                {savePaymentMethodFailed ? (
                  <p className={css.genericError}>
                    <FormattedMessage
                      id="TransactionPanel.savePaymentMethodFailed"
                      values={{
                        paymentMethodsPageLink: (
                          <NamedLink name="PaymentMethodsPage">
                            <FormattedMessage id="TransactionPanel.paymentMethodsPageLink" />
                          </NamedLink>
                        ),
                      }}
                    />
                  </p>
                ) : null}
                <DeliveryInfoMaybe
                  className={css.deliveryInfoSection}
                  protectedData={protectedData}
                  listing={listing}
                  locale={config.localization.locale}
                />
                <BookingLocationMaybe
                  className={css.deliveryInfoSection}
                  listing={listing}
                  showBookingLocation={showBookingLocation}
                />
              </div>
            ) : null}

            <FeedSection
              rootClassName={css.feedContainer}
              hasMessages={messages.length > 0}
              hasTransitions={hasTransitions}
              fetchMessagesError={fetchMessagesError}
              initialMessageFailed={initialMessageFailed}
              activityFeed={activityFeed}
              isConversation={isInquiryProcess}
            />
            {showSendMessageForm ? (
              <SendMessageForm
                formId={this.sendMessageFormName}
                rootClassName={css.sendMessageForm}
                messagePlaceholder={intl.formatMessage(
                  { id: 'TransactionPanel.sendMessagePlaceholder' },
                  { name: otherUserDisplayNameString }
                )}
                inProgress={sendMessageInProgress}
                sendMessageError={sendMessageError}
                onFocus={this.onSendMessageFormFocus}
                onBlur={this.onSendMessageFormBlur}
                onSubmit={this.onMessageSubmit}
              />
            ) : (
              <div className={css.sendingMessageNotAllowed}>
                <FormattedMessage id="TransactionPanel.sendingMessageNotAllowed" />
              </div>
            )}

            {stateData.showActionButtons ? (
              <>
                <div className={css.mobileActionButtonSpacer}></div>
                <div className={css.mobileActionButtons}>{actionButtons}</div>
              </>
            ) : null}
          </div>

          <div className={css.asideDesktop}>
            <div className={css.stickySection}>
              <div className={css.detailCard}>
                {cartItems?.length > 1 ? (
                  <>
                    {/* <DetailCardImage
                      avatarWrapperClassName={css.avatarWrapperDesktop}
                      listingTitle={listingTitle}
                      image={firstImage}
                      provider={provider}
                      isCustomer={isCustomer}
                      listingImageConfig={config.layout.listingImage}
                    /> */}
                    <div>{condition}</div>
                    <DetailCardHeadingsMaybe
                      showDetailCardHeadings={stateData.showDetailCardHeadings}
                      cartItems={cartItems}
                      listingTitle={
                        listingDeleted ? (
                          listingTitle
                        ) : (
                          <NamedLink
                            name="ListingPage"
                            params={{ id: listing.id?.uuid, slug: createSlug(listingTitle) }}
                          >
                            {listingTitle}
                          </NamedLink>
                        )
                      }
                      showPrice={showPrice}
                      price={listing?.attributes?.price}
                      intl={intl}
                    />
                  </>
                ) : (
                  <>
                    <DetailCardImage
                      avatarWrapperClassName={css.avatarWrapperDesktop}
                      listingTitle={listingTitle}
                      image={firstImage}
                      provider={provider}
                      isCustomer={isCustomer}
                      listingImageConfig={config.layout.listingImage}
                    />
                    <div className={css.listingTitle}>{listingTitle}</div>
                    <div className={css.lisitngCondition}>{capCondition}</div>
                    <DetailCardHeadingsMaybe
                      showDetailCardHeadings={stateData.showDetailCardHeadings}
                      listingTitle={
                        listingDeleted ? (
                          listingTitle
                        ) : (
                          <NamedLink
                            name="ListingPage"
                            params={{ id: listing.id?.uuid, slug: createSlug(listingTitle) }}
                          >
                            {listingTitle}
                          </NamedLink>
                        )
                      }
                      showPrice={showPrice}
                      price={listing?.attributes?.price}
                      intl={intl}
                    />
                    <div className={css.offerPriceWrapper}>
                      <span>
                        <FormattedMessage id="TransactionPanel.orignalListingPrice" />£
                        {listing?.attributes?.price?.amount / 100}
                      </span>
                      <div>
                        {prevOfferPrice &&
                          typeof prevOfferPrice !== 'object' &&
                          ['offer-declined', 'offer', 'purchased', 'reviewed'].includes(
                            stateData?.processState
                          ) ? (
                          <div className={css.OfferedPrice}>
                            {lastTransition === 'transition/offer-accept-by-provider' ? (
                              <FormattedMessage id="TransactionPanel.newListingPrice" />
                            ) : (
                              <FormattedMessage id="TransactionPanel.offerPrice" />
                            )}
                            £{prevOfferPrice}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
                {stateData.showOrderPanel ? orderPanel : null}
                {['offer-declined', 'offer'].includes(stateData?.processState) &&
                  isProvider ? null : (
                  <BreakdownMaybe
                    className={css.breakdownContainer}
                    orderBreakdown={orderBreakdown}
                    processName={stateData.processName}
                  />
                )}
                {stateData.showActionButtons ? (
                  <div className={css.desktopActionButtons}>{actionButtons}</div>
                ) : null}
                {lastTransition === OFFER_DECLINE_BY_PROVIDER && isCustomer ? (
                  <div className={css.bookingInputWrapper}>
                    <div className={css.bookingInput}>
                      <label htmlFor="numberInput">
                        <FormattedMessage id="TransactionPanel.newOfferPrice" />
                      </label>
                      <input
                        type="text"
                        id="numberInput"
                        value={offerPrice}
                        onChange={this.handleInputChange}
                      />
                    </div>
                    {parseFloat(offerPrice) === parseFloat(prevOfferPrice) && (
                      <p style={{ color: 'red' }}>
                        <FormattedMessage id="TransactionPanel.offerPriceNotBeSame" />
                      </p>
                    )}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button
                      className={css.Submitbutton}
                      onClick={this.handleSubmitOffer}
                      disabled={parseFloat(offerPrice) === parseFloat(prevOfferPrice)}
                    >
                      <FormattedMessage id="TransactionPanel.submitNewOffer" />
                    </button>
                  </div>
                ) : null}{' '}
              </div>
              {returnProtection === "yes" && <DiminishedActionButtonMaybe
                showDispute={stateData.showDispute}
                onOpenDisputeModal={onOpenDisputeModal}
              />}

              {isProvider && labelData && !returnlabelData && (
                <>
                  <div className={css.downloadBtnWrapper}>
                    <div
                      onClick={() => downloadFiles(labelData?.label_url)}
                      className={css.documentWrapper}
                    >
                      <span>
                        <FormattedMessage id="TransactionPage.dwonloadLabel" />
                      </span>
                    </div>
                  </div>
                </>
              )}
              {isCustomer && returnlabelData && (
                <>
                  <div className={css.downloadBtnWrapper}>
                    <div
                      onClick={() => downloadFiles(returnlabelData?.label_url)}
                      className={css.documentWrapper}
                    >
                      <span>
                        <FormattedMessage id="TransactionPage.dwonloadLabel" />
                      </span>
                    </div>
                  </div>
                </>
              )}
              {(labelData || returnlabelData) && (
                <div className={css.documentWrappers}>
                  <a href={returnlabelData ? returnlabelData?.tracking_url_provider : labelData?.tracking_url_provider} target="_blank">
                    <span>
                      <FormattedMessage id="TransactionPage.trackingText" />
                    </span>
                  </a>
                </div>
              )}

            </div>
            {['offer-declined'].includes(stateData?.processState) ? null : (
              <div className={css.reportUser}>
                <FormattedMessage id="TransactionPanel.somethingFishy" />&nbsp;
                <span className={css.reportUser} onClick={this.openModal}>
                  <FormattedMessage id="OrderPanel.reportUser" />
                </span>
                <Modal
                  isOpen={isModalOpen}
                  onClose={this.closeModal}
                  onManageDisableScrolling={onManageDisableScrolling}
                  contentLabel="Report User"
                >
                  <h2 className={css.reportUserTitle}>Report This User</h2>
                  <form onSubmit={this.onHandleSubmit}>
                    <label className={css.label}>Your reason for reporting:</label>
                    <textarea
                      value={description}
                      onChange={this.handleDescriptionChange}
                      placeholder="Enter your description"
                      required
                    />
                    <div className={css.reportText}>We take reporting seriously and will review the situation ASAP.</div>
                    <div>
                      <Button type="submit" className={css.ReportSubmitbutton}>Report User</Button>
                    </div>
                  </form>
                </Modal>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

TransactionPanelComponent.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  listing: null,
  customer: null,
  provider: null,
  hasTransitions: false,
  fetchMessagesError: null,
  initialMessageFailed: false,
  savePaymentMethodFailed: false,
  sendMessageError: null,
  sendReviewError: null,
  stateData: {},
  activityFeed: null,
  showBookingLocation: false,
  orderBreakdown: null,
  orderPanel: null,
};

TransactionPanelComponent.propTypes = {
  rootClassName: string,
  className: string,

  currentUser: propTypes.currentUser,
  transactionRole: oneOf(['customer', 'provider']).isRequired,
  listing: propTypes.listing,
  customer: propTypes.user,
  provider: propTypes.user,
  hasTransitions: bool,
  transactionId: propTypes.uuid.isRequired,
  messages: arrayOf(propTypes.message).isRequired,
  initialMessageFailed: bool,
  savePaymentMethodFailed: bool,
  fetchMessagesError: propTypes.error,
  sendMessageInProgress: bool.isRequired,
  sendMessageError: propTypes.error,
  onOpenDisputeModal: func.isRequired,
  onSendMessage: func.isRequired,
  stateData: stateDataShape,
  showBookingLocation: bool,
  activityFeed: node,
  orderBreakdown: node,
  orderPanel: node,
  config: object.isRequired,

  // from injectIntl
  intl: intlShape,
};

const TransactionPanel = injectIntl(TransactionPanelComponent);

export default TransactionPanel;
