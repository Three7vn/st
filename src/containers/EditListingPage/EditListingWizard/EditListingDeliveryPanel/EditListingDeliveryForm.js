import React, { useEffect } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
  required,
} from '../../../../util/validators';

// Import shared components
import {
  Form,
  FieldLocationAutocompleteInput,
  Button,
  FieldCurrencyInput,
  FieldTextInput,
  FieldCheckbox,
  FieldSelect,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingDeliveryForm.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { dispatchTimes } from '../../../../config/configListing';

const identity = v => v;

export const EditListingDeliveryFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        formId,
        form,
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        pristine,
        invalid,
        listingTypeConfig,
        marketplaceCurrency,
        hasStockInUse,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
        carrierAccounts,
      } = formRenderProps;
      // This is a bug fix for Final Form.
      // Without this, React will return a warning:
      //   "Cannot update a component (`ForwardRef(Field)`)
      //   while rendering a different component (`ForwardRef(Field)`)"
      // This seems to happen because validation calls listeneres and
      // that causes state to change inside final-form.
      // https://github.com/final-form/react-final-form/issues/751
      //
      // TODO: it might not be worth the trouble to show these fields as disabled,
      // if this fix causes trouble in future dependency updates.
      const { pauseValidation, resumeValidation } = form;
      pauseValidation(false);
      useEffect(() => resumeValidation(), [values]);

      const displayShipping = displayDeliveryShipping(listingTypeConfig);
      const displayPickup = displayDeliveryPickup(listingTypeConfig);
      const displayMultipleDelivery = displayShipping && displayPickup;
      const shippingEnabled = displayShipping && values.deliveryOptions?.includes('shipping');
      const pickupEnabled = displayPickup && values.deliveryOptions?.includes('pickup');

      const addressRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.addressRequired',
      });
      const addressNotRecognizedMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.addressNotRecognized',
      });

      const optionalText = intl.formatMessage({
        id: 'EditListingDeliveryForm.optionalText',
      });

      const postalCodeRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.postalCodeRequiredMessage',
      });

      const lengthRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.lengthRequiredMessage',
      });

      const widthRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.widthRequiredMessage',
      });

      const heightRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.heightRequiredMessage',
      });

      const weightRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.weightRequiredMessage',
      });

      const { updateListingError, showListingsError } = fetchErrors || {};

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress || !values?.returnProtection;

      const shippingLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.shippingLabel' });
      const pickupLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.pickupLabel' });

      const pickupClasses = classNames({
        [css.deliveryOption]: displayMultipleDelivery,
        [css.disabled]: !pickupEnabled,
        [css.hidden]: !displayPickup,
      });
      const shippingClasses = classNames({
        [css.deliveryOption]: displayMultipleDelivery,
        [css.disabled]: !shippingEnabled,
        [css.hidden]: !displayShipping,
      });
      const currencyConfig = appSettings.getCurrencyFormatting(marketplaceCurrency);

      const infoIcon = (
        <span>
          <IconCollection icon="infoIcon" />
        </span>
      );

      const parseUKAddress = address => {
        // Split and trim each part to avoid issues with extra spaces
        const parts = address.split(',').map(part => part.trim());
        return parts; // Return all parts of the address
      };

      const extractUKPostalCode = countyPostal => {
        // UK postal codes can vary greatly, but generally have a space between parts
        const match = countyPostal.match(/(.*?)([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i);
        if (!match) return {}; // In case the regex does not match
        const [_, stateOrCounty, postalCode] = match;
        return { stateOrCounty: stateOrCounty.trim(), postalCode: postalCode.trim() };
      };

      useEffect(() => {
        const addressArray = parseUKAddress(values?.itemAddress?.search || '');
        if (addressArray.length >= 3) {
          // Ensure we have Address, City, State/County PostalCode, and Country
          const { stateOrCounty, postalCode } = extractUKPostalCode(
            addressArray[addressArray.length - 2]
          );

          // Assuming the structure is: Address, City, State/County PostalCode, Country
          form.change('address_line_1', addressArray.slice(0, addressArray.length - 3).join(', '));
          form.change('city', addressArray[addressArray.length - 3]);
          form.change('postalCode', postalCode);
          form.change('state', stateOrCounty);
        }
      }, [values?.itemAddress?.search, form]);

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div className={pickupClasses}>
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingDeliveryForm.updateFailed" />
              </p>
            ) : null}

            {showListingsError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingDeliveryForm.showListingFailed" />
              </p>
            ) : null}

            <FieldLocationAutocompleteInput
              rootClassName={css.input}
              inputClassName={css.locationAutocompleteInput}
              iconClassName={css.locationAutocompleteInputIcon}
              predictionsClassName={css.predictionsRoot}
              validClassName={css.validLocation}
              autoFocus={autoFocus}
              name="itemAddress"
              label={intl.formatMessage({ id: 'EditListingDeliveryForm.itemAddress' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.itemAddressPlaceholder',
              })}
              useDefaultPredictions={false}
              format={identity}
              valueFromForm={values.itemAddress}
              validate={composeValidators(
                autocompleteSearchRequired(addressRequiredMessage),
                autocompletePlaceSelected(addressNotRecognizedMessage)
              )}
              // Whatever parameters are being used to calculate
              // the validation function need to be combined in such
              // a way that, when they change, this key prop
              // changes, thus reregistering this field (and its
              // validation function) with Final Form.
              // See example: https://codesandbox.io/s/changing-field-level-validators-zc8ei
              key={'locationValidation'}
            />

            {/* <FieldTextInput
              className={css.input}
              type="text"
              name="itemAddress"
              id={`${formId}itemAddress`}
              label={intl.formatMessage({ id: 'EditListingDeliveryForm.itemAddress' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.itemAddressPlaceholder',
              })}
            /> */}
            <div className={css.fieldsRow}>
              <FieldTextInput
                className={css.input}
                type="text"
                name="listingPostalCode"
                id={`${formId}postalCode`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.postalCode' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDeliveryForm.postalCodePlaceholder',
                })}
                validate={required(postalCodeRequiredMessage)}
              />

              <FieldTextInput
                className={css.input}
                type="text"
                name="listingcity"
                id={`${formId}city`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.city' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDeliveryForm.cityPlaceholder',
                })}
                validate={required(postalCodeRequiredMessage)}
              />
            </div>
            <FieldSelect
              className={css.input}
              id={`${formId}.returnProtection`}
              name="returnProtection"
              label={intl.formatMessage(
                {
                  id: 'EditListingPricingAndStockForm.returnProtectionLabel',
                },
                { infoIcon }
              )}
              validate={required(postalCodeRequiredMessage)}
            >
              <option value={''}>Select one...</option>
              <option value={'yes'}>Yes</option>
              <option value={'no'}>No</option>
            </FieldSelect>

            <FieldSelect
              className={css.input}
              id={`${formId}.dispatchTime`}
              name="dispatchTime"
              label={intl.formatMessage(
                {
                  id: 'EditListingPricingAndStockForm.dispatchTimeLabel',
                },
                { infoIcon }
              )}
              validate={required(postalCodeRequiredMessage)}
            >
              <option value={''}>Select one...</option>
              {dispatchTimes.map(type => {
                return (
                  <option key={type.option} value={type.option}>
                    {type.label}
                  </option>
                );
              })}
            </FieldSelect>
          </div>

          <div className={shippingClasses}></div>

          <div>
            <h3>
              <FormattedMessage id="EditListingDeliveryForm.shippingHeader" />
            </h3>

            <div>
              <FieldSelect
                className={css.input}
                id={`${formId}.acceptedCouriers`}
                name="acceptedCouriers"
                label={intl.formatMessage({
                  id: 'EditListingPricingAndStockForm.acceptedCouriersLabel',
                })}
                validate={required(postalCodeRequiredMessage)}
                onChange={f => {
                  const selectedCarrier =
                    carrierAccounts?.length && carrierAccounts.find(e => e.object_id === f);
                  const { carrier_name, carrier, object_id } = selectedCarrier || {};
                  const data = {
                    carrier_name,
                    carrier_id: carrier,
                    carrier_object_id: object_id,
                  };
                  form.change('selectedCarrier', data);
                }}
              >
                <option value={''}>Select couriers to make available for buyer</option>
                {carrierAccounts?.length &&
                  carrierAccounts.map(type => {
                    const { carrier_name, object_id } = type || {};
                    return (
                      <option key={type?.object_id} value={object_id}>
                        {carrier_name}
                      </option>
                    );
                  })}
              </FieldSelect>
            </div>
            <div className={css.fieldsRow}>
              <FieldTextInput
                className={css.input}
                type="text"
                name="length"
                id={`${formId}length`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.length' })}
                // placeholder={intl.formatMessage({
                //   id: 'EditListingDeliveryForm.lengthPlaceholder',
                // })}
                validate={required(lengthRequiredMessage)}
              />

              <FieldTextInput
                className={css.input}
                type="text"
                name="width"
                id={`${formId}width`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.width' })}
                // placeholder={intl.formatMessage({
                //   id: 'EditListingDeliveryForm.widthPlaceholder',
                // })}
                validate={required(widthRequiredMessage)}
              />
            </div>
            <div className={css.fieldsRow}>
              <FieldTextInput
                className={css.input}
                type="text"
                name="height"
                id={`${formId}height`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.height' })}
                // placeholder={intl.formatMessage({
                //   id: 'EditListingDeliveryForm.heightPlaceholder',
                // })}
                validate={required(heightRequiredMessage)}
              />

              <FieldTextInput
                className={css.input}
                type="text"
                name="weight"
                id={`${formId}weight`}
                label={intl.formatMessage({ id: 'EditListingDeliveryForm.weight' })}
                // placeholder={intl.formatMessage({
                //   id: 'EditListingDeliveryForm.weightPlaceholder',
                // })}
                validate={required(weightRequiredMessage)}
              />
            </div>
          </div>

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingDeliveryFormComponent.defaultProps = {
  selectedPlace: null,
  fetchErrors: null,
  formId: 'EditListingDeliveryForm',
  hasStockInUse: true,
};

EditListingDeliveryFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  selectedPlace: propTypes.place,
  marketplaceCurrency: string.isRequired,
  hasStockInUse: bool,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingDeliveryFormComponent);
