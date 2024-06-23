import React, { useState, useEffect } from 'react';
import { func, object, string, bool } from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, STOCK_MULTIPLE_ITEMS } from '../../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingDeliveryForm from './EditListingDeliveryForm';
import css from './EditListingDeliveryPanel.module.css';
import { fetchCarrierAccounts } from '../../EditListingPage.duck';
import { validateAddress } from '../../../ProfileSettingsPage/ProfileSettingsPage.duck';

const { Money } = sdkTypes;

const getInitialValues = props => {
  const { listing, listingTypes, marketplaceCurrency } = props;
  const { geolocation, publicData, price } = listing?.attributes || {};

  const listingType = listing?.attributes?.publicData?.listingType;
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const displayMultipleDelivery = displayShipping && displayPickup;

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = publicData?.itemAddress?.address && geolocation;
  const location = publicData?.itemAddress || {};
  const { address, building } = location;
  const {
    shippingEnabled,
    pickupEnabled,
    shippingPriceInSubunitsOneItem,
    shippingPriceInSubunitsAdditionalItems,
    dispatchTime,
    returnProtection,
    listingPostalCode,
    listingcity,
    acceptedCouriers,
    length,
    width,
    height,
    weight,
  } = publicData;
  const deliveryOptions = [];

  if (shippingEnabled || (!displayMultipleDelivery && displayShipping)) {
    deliveryOptions.push('shipping');
  }
  if (pickupEnabled || (!displayMultipleDelivery && displayPickup)) {
    deliveryOptions.push('pickup');
  }

  const currency = price?.currency || marketplaceCurrency;
  const shippingOneItemAsMoney =
    shippingPriceInSubunitsOneItem != null
      ? new Money(shippingPriceInSubunitsOneItem, currency)
      : null;
  const shippingAdditionalItemsAsMoney =
    shippingPriceInSubunitsAdditionalItems != null
      ? new Money(shippingPriceInSubunitsAdditionalItems, currency)
      : null;

  // Initial values for the form
  return {
    building,
    itemAddress: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin: geolocation },
        }
      : { search: undefined, selectedPlace: undefined },
    deliveryOptions,
    shippingPriceInSubunitsOneItem: shippingOneItemAsMoney,
    shippingPriceInSubunitsAdditionalItems: shippingAdditionalItemsAsMoney,
    dispatchTime,
    returnProtection,
    listingPostalCode,
    listingcity,
    acceptedCouriers,
    length,
    width,
    height,
    weight,
  };
};

const EditListingDeliveryPanel = props => {
  // State is needed since LocationAutocompleteInput doesn't have internal state
  // and therefore re-rendering would overwrite the values during XHR call.
  const [state, setState] = useState({ initialValues: getInitialValues(props) });
  const [carrierAccounts, setCarrierAccounts] = useState([]);

  useEffect(() => {
    fetchCarrierAccounts().then(res => {
      res?.length > 0 && setCarrierAccounts(res);
    });
  }, []);

  const {
    className,
    rootClassName,
    listing,
    listingTypes,
    marketplaceCurrency,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    currentUser,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;
  const priceCurrencyValid = listing?.attributes?.price?.currency === marketplaceCurrency;
  const listingType = listing?.attributes?.publicData?.listingType;
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);
  const hasStockInUse = listingTypeConfig.stockType === STOCK_MULTIPLE_ITEMS;
  const { selectedCarrier: stroedData } = (!!listing?.id && listing.attributes.publicData) || {};

  const { userName } = (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};

  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingDeliveryPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingDeliveryPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
      {priceCurrencyValid ? (
        <EditListingDeliveryForm
          className={css.form}
          initialValues={state.initialValues}
          onSubmit={values => {
            const {
              dispatchTime,
              returnProtection,
              city,
              postalCode,
              itemAddress,
              selectedCarrier,
              length,
              width,
              height,
              weight,
              acceptedCouriers,
              address_line_1,
              state,
              listingPostalCode,
              listingcity,
            } = values;

            const address = itemAddress?.selectedPlace?.address || null;
            const origin = itemAddress?.selectedPlace?.origin || null;
            itemAddress &&
              validateAddress({ userName, city, state, postalCode, address_line_1 }).then(res => {
                const pickupDataMaybe = address
                  ? {
                      itemAddress: {
                        address,
                        city: city ? city : listingcity,
                        state,
                        postalCode: postalCode ? postalCode : listingPostalCode,
                        address_line_1,
                      },
                    }
                  : {};
                // New values for listing attributes
                const updateValues = {
                  geolocation: origin,
                  publicData: {
                    selectedCarrier: selectedCarrier ? selectedCarrier : stroedData,
                    length,
                    width,
                    height,
                    weight,
                    acceptedCouriers,
                    dispatchTime,
                    returnProtection,
                    listingPostalCode,
                    listingcity,
                    ...pickupDataMaybe,
                    shippingEnabled: true,
                  },
                };
                setState({
                  initialValues: {
                    itemAddress: { search: address, selectedPlace: { address, origin } },
                    dispatchTime,
                    returnProtection,
                    listingPostalCode,
                    listingcity,
                    selectedCarrier,
                    length,
                    width,
                    height,
                    weight,
                    acceptedCouriers,
                  },
                });
                onSubmit(updateValues);
              });
          }}
          listingTypeConfig={listingTypeConfig}
          marketplaceCurrency={marketplaceCurrency}
          hasStockInUse={hasStockInUse}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          carrierAccounts={carrierAccounts}
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage id="EditListingPricingPanel.listingPriceCurrencyInvalid" />
        </div>
      )}
    </div>
  );
};

EditListingDeliveryPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingDeliveryPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,
  marketplaceCurrency: string.isRequired,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingDeliveryPanel;
