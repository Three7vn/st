import { bool, func, oneOf, shape, string } from 'prop-types';
import {
  BOOKING_PROCESS_NAME,
  CRYPTO_PROCESS_NAME,
  INQUIRY_PROCESS_NAME,
  PURCHASE_PROCESS_NAME,
  resolveLatestProcessName,
} from '../../transactions/transaction';
import { getStateDataForBookingProcess } from './TransactionPage.stateDataBooking.js';
import { getStateDataForInquiryProcess } from './TransactionPage.stateDataInquiry.js';
import { getStateDataForPurchaseProcess } from './TransactionPage.stateDataPurchase.js';
import { transitions } from '../../transactions/transactionProcessCrypto';
import { makeReceivedTransition } from './TransactionPage.duck';
import { getUserDetails } from '../../util/dataExtractor';
import { useConfiguration } from '../../context/configurationContext.js';

const errorShape = shape({
  type: oneOf(['error']).isRequired,
  name: string.isRequired,
  message: string,
});

const actionButtonsShape = shape({
  inProgress: bool,
  error: errorShape,
  onAction: func.isRequired,
  buttonText: string,
  errorText: string,
});

export const stateDataShape = shape({
  processName: string.isRequired,
  processState: string.isRequired,
  primaryButtonProps: actionButtonsShape,
  secondaryButtonProps: actionButtonsShape,
  showActionButtons: bool,
  showDetailCardHeadings: bool,
  showDispute: bool,
  showOrderPanel: bool,
  showReviewAsFirstLink: bool,
  showReviewAsSecondLink: bool,
  showReviews: bool,
});

// Transitions are following process.edn format: "transition/my-transtion-name"
// This extracts the 'my-transtion-name' string if namespace exists
const getTransitionKey = transitionName => {
  const [nameSpace, transitionKey] = transitionName.split('/');
  return transitionKey || transitionName;
};

// Action button prop for the TransactionPanel
const getActionButtonPropsMaybe = (params, onlyForRole = 'both') => {
  const {
    processName,
    transitionName,
    inProgress,
    transitionError,
    onAction,
    transactionRole,
    actionButtonTranslationId,
    actionButtonTranslationErrorId,
    intl,
  } = params;
  const transitionKey = getTransitionKey(transitionName);

  const actionButtonTrId =
    actionButtonTranslationId ||
    `TransactionPage.${processName}.${transactionRole}.transition-${transitionKey}.actionButton`;
  const actionButtonTrErrorId =
    actionButtonTranslationErrorId ||
    `TransactionPage.${processName}.${transactionRole}.transition-${transitionKey}.actionError`;

  return onlyForRole === 'both' || onlyForRole === transactionRole
    ? {
        inProgress,
        error: transitionError,
        onAction,
        buttonText: intl.formatMessage({ id: actionButtonTrId }),
        errorText: intl.formatMessage({ id: actionButtonTrErrorId }),
      }
    : {};
};

export const getStateData = (params, process) => {
  const {
    transaction,
    transactionRole,
    intl,
    transitionInProgress,
    transitionError,
    onTransition,
    sendReviewInProgress,
    sendReviewError,
    onOpenReviewModal,
    dispatch,
    transitions,
    isProviderRole,
    isCustomerRole,
    createShippingLabel,
    createReturnShippingLabel,
  } = params;

  const config = useConfiguration();

  const isCustomer = transactionRole === 'customer';
  const processName = resolveLatestProcessName(transaction?.attributes?.processName);
  const { provider } = (!!transaction?.id && transaction) || {};
  const sellerEmail = !!provider?.id && getUserDetails(provider).email;
  const { amount } = (!!transaction?.id && transaction.attributes.payoutTotal) || {};
  const orderParams = {
    sellerEmail,
    payoutAmount: amount / 100,
    sellerId: provider?.id?.uuid,
  };
  const getActionButtonProps = (transitionName, forRole, extra = {}) =>
    getActionButtonPropsMaybe(
      {
        processName,
        transitionName,
        transactionRole,
        intl,
        inProgress: transitionInProgress === transitionName,
        transitionError,
        onAction: () => {
          transitionName === transitions.MARK_RECEIVED_FROM_PURCHASED
            ? dispatch(makeReceivedTransition(transaction?.id, transitionName, orderParams))
            : transitionName === transitions.TRANSITION_PRINT_SHIPPING_LABEL
            ? createShippingLabel()
            : transitionName === transitions.RETURN_SHIPPING_LABEL_BY_CUSTOMER
            ? createReturnShippingLabel()
            : onTransition(
                transaction?.id,
                transitionName,
                transaction,
                config,
                transitions,
                isProviderRole,
                isCustomerRole
              );
        },
        ...extra,
      },
      forRole
    );

  const getLeaveReviewProps = getActionButtonPropsMaybe({
    processName,
    transitionName: 'leaveReview',
    transactionRole,
    intl,
    inProgress: sendReviewInProgress,
    transitionError: sendReviewError,
    onAction: onOpenReviewModal,
    actionButtonTranslationId: 'TransactionPage.leaveReview.actionButton',
    actionButtonTranslationErrorId: 'TransactionPage.leaveReview.actionError',
  });

  const processInfo = () => {
    const { getState, states, transitions } = process;
    const processState = getState(transaction);
    return {
      processName,
      processState,
      states,
      transitions,
      isCustomer,
      actionButtonProps: getActionButtonProps,
      leaveReviewProps: getLeaveReviewProps,
    };
  };

  if (processName === PURCHASE_PROCESS_NAME) {
    return getStateDataForPurchaseProcess(params, processInfo());
  } else if (processName === BOOKING_PROCESS_NAME) {
    return getStateDataForBookingProcess(params, processInfo());
  } else if (processName === INQUIRY_PROCESS_NAME) {
    return getStateDataForInquiryProcess(params, processInfo());
  } else if (processName === CRYPTO_PROCESS_NAME) {
    return getStateDataForPurchaseProcess(params, processInfo());
  } else {
    return {};
  }
};
