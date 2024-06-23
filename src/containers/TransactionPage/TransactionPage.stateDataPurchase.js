import {
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
  CONDITIONAL_RESOLVER_WILDCARD,
  ConditionalResolver,
} from '../../transactions/transaction';

/**
 * Get state data against product process for TransactionPage's UI.
 * I.e. info about showing action buttons, current state etc.
 *
 * @param {*} txInfo detials about transaction
 * @param {*} processInfo  details about process
 */
export const getStateDataForPurchaseProcess = (txInfo, processInfo) => {
  const { transaction, transactionRole, nextTransitions } = txInfo;
  const isProviderBanned = transaction?.provider?.attributes?.banned;
  const isShippable = transaction?.attributes?.protectedData?.deliveryMethod === 'shipping';
  const _ = CONDITIONAL_RESOLVER_WILDCARD;

  const {
    processName,
    processState,
    states,
    transitions,
    isCustomer,
    actionButtonProps,
    leaveReviewProps,
  } = processInfo;

  return (
    new ConditionalResolver([processState, transactionRole])
      .cond([states.INQUIRY, CUSTOMER], () => {
        const transitionNames = Array.isArray(nextTransitions)
          ? nextTransitions.map(t => t.attributes.name)
          : [];
        const requestAfterInquiry = transitions.REQUEST_PAYMENT_AFTER_INQUIRY;
        const hasCorrectNextTransition = transitionNames.includes(requestAfterInquiry);
        const showOrderPanel = !isProviderBanned && hasCorrectNextTransition;
        return { processName, processState, showOrderPanel };
      })
      .cond([states.INQUIRY, PROVIDER], () => {
        return { processName, processState, showDetailCardHeadings: true };
      })
      .cond([states.PURCHASED, CUSTOMER], () => {
        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showActionButtons: true,
          showExtraInfo: true,
          // primaryButtonProps: actionButtonProps(transitions.CANCEL, CUSTOMER),
        };
      })
      .cond([states.PURCHASED, PROVIDER], () => {
        const actionButtonTranslationId = 'TransactionPage.shippingLabel';

        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showActionButtons: true,
          primaryButtonProps: actionButtonProps(
            transitions.TRANSITION_PRINT_SHIPPING_LABEL,
            PROVIDER,
            {
              actionButtonTranslationId,
            }
          ),
        };
      })
      .cond([states.LABEL_PRINTED, PROVIDER], () => {

        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showActionButtons: true,
        };
      })
      //For OFFER
      .cond([states.OFFER, PROVIDER], () => {
        const actionButtonTranslationId = isShippable
          ? `TransactionPage.${processName}.${PROVIDER}.transition-accept-offer.actionButtonAccept`
          : `TransactionPage.${processName}.${PROVIDER}.transition-accept-offer.actionButton`;

        const actionButtonTranslationcancelId = `TransactionPage.${processName}.${PROVIDER}.transition-declined-offer.actionButton`;

        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showActionButtons: true,
          primaryButtonProps: actionButtonProps(transitions.OFFER_ACCEPT_BY_PROVIDER, PROVIDER, {
            actionButtonTranslationId,
          }),
          secondaryButtonProps: actionButtonProps(transitions.OFFER_DECLINE_BY_PROVIDER, PROVIDER, {
            actionButtonTranslationcancelId,
          }),
        };
      })

      .cond([states.DELIVERED, CUSTOMER], () => {
        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showDispute: true,
          showActionButtons: true,
          primaryButtonProps: actionButtonProps(transitions.MARK_RECEIVED, CUSTOMER),
        };
      })

      .cond([states.RETURN_ORDER, CUSTOMER], () => {
        const actionButtonTranslationId = 'TransactionPage.returnLabel';

        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showActionButtons: true,
          primaryButtonProps: actionButtonProps(transitions.RETURN_SHIPPING_LABEL_BY_CUSTOMER, CUSTOMER, {
            actionButtonTranslationId,
          }),
        };
      })

      .cond([states.COMPLETED, _], () => {
        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showReviewAsFirstLink: true,
          showActionButtons: true,
          primaryButtonProps: leaveReviewProps,
        };
      })
      .cond([states.REVIEWED_BY_PROVIDER, CUSTOMER], () => {
        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showReviewAsSecondLink: true,
          showActionButtons: true,
          primaryButtonProps: leaveReviewProps,
        };
      })
      .cond([states.REVIEWED_BY_CUSTOMER, PROVIDER], () => {
        return {
          processName,
          processState,
          showDetailCardHeadings: true,
          showReviewAsSecondLink: true,
          showActionButtons: true,
          primaryButtonProps: leaveReviewProps,
        };
      })
      .cond([states.REVIEWED, _], () => {
        return { processName, processState, showDetailCardHeadings: true, showReviews: true };
      })
      .default(() => {
        // Default values for other states
        return { processName, processState, showDetailCardHeadings: true };
      })
      .resolve()
  );
};
