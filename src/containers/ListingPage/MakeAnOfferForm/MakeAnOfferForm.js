import React from 'react';
import { string, bool } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { propTypes } from '../../../util/types';
import { Form, PrimaryButton, FieldCurrencyInput } from '../../../components';
import css from './MakeAnOfferForm.module.css';
import { types as sdkTypes } from '../../../util/sdkLoader';
import appSettings from '../../../config/settings';
import { formatMoney } from '../../../util/currency';

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingAndStockForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingAndStockForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};
const { Money } = sdkTypes;
const MakeAnOfferFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        submitButtonWrapperClassName,
        handleSubmit,
        inProgress,
        intl,
        listing,
        values,
        config,
      } = fieldRenderProps;
      const { price } = listing.attributes;

      const priceValidators = getPriceValidators(config.listingMinimumPriceSubUnits, 'GBP', intl);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = submitInProgress || (!values && values.offerPrice);

      return (
        <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="OrderDetailsPage">
          <h3 className={css.heading}>
            <FormattedMessage id="MakeAnOfferForm.customOffer" />
          </h3>

          <div className={css.inputWrapper}>
              <span className={css.listPrice}>Listed Price £{price?.amount / 100}.00</span>
          </div>
          <FieldCurrencyInput
            id="offerPrice"
            name="offerPrice"
            className={css.input}
            label={intl.formatMessage({ id: 'MakeAnOfferForm.offerPrice' })}
            currencyConfig={appSettings.getCurrencyFormatting('GBP')}
            validate={priceValidators}
          />
          <div className={submitButtonWrapperClassName}>
            <div className={css.smallText}>
              *All offers are binding and expire in 24 hours. You will be automatically charged if
              the seller accepts your offer. Questions?
            </div>
            <PrimaryButton
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              className={css.submitButton}
            >
              {values?.offerPrice ? (
                <FormattedMessage
                  id="MakeAnOfferForm.submitButtonText"
                  values={{ price: parseInt(values?.offerPrice?.amount / 100) }}
                />
              ) : (
                <FormattedMessage id="MakeAnOfferForm.submitButtonTextNoPrice" />
              )}
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

MakeAnOfferFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  inProgress: false,
  sendEnquiryError: null,
};

MakeAnOfferFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  inProgress: bool,

  listingTitle: string.isRequired,
  sendEnquiryError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const MakeAnOfferForm = compose(injectIntl)(MakeAnOfferFormComponent);

MakeAnOfferForm.displayName = 'MakeAnOfferForm';

export default MakeAnOfferForm;
