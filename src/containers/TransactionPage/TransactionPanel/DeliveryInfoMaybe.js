import React from 'react';
import classNames from 'classnames';

import getCountryCodes from '../../../translations/countryCodes';
import { FormattedMessage } from '../../../util/reactIntl';
import { Heading } from '../../../components';

import AddressLinkMaybe from './AddressLinkMaybe';

import css from './TransactionPanel.module.css';

// Functional component as a helper to build ActivityFeed section
const DeliveryInfoMaybe = props => {
  const { className, rootClassName, protectedData, listing, locale } = props;
  const classes = classNames(rootClassName || css.deliveryInfoContainer, className);
  const deliveryMethod = protectedData?.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';

  if (isPickup) {
    const pickupLocation = listing?.attributes?.publicData?.location || {};
    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.pickupInfoHeading" />
        </Heading>
        <div className={css.pickupInfoContent}>
          <AddressLinkMaybe
            linkRootClassName={css.pickupAddress}
            location={pickupLocation}
            geolocation={listing?.attributes?.geolocation}
            showAddress={true}
          />
        </div>
      </div>
    );
  } else if (isShipping) {
    const { name, phoneNumber, location, buyerAddress } = protectedData || {};
    const { address } = location || buyerAddress || {};
    // const phoneMaybe = !!phoneNumber ? (
    //   <>
    //     {phoneNumber}
    //     <br />
    //   </>
    // ) : null;

    // const countryCodes = getCountryCodes(locale);
    // const countryInfo = countryCodes.find(c => c.code === country_code);
    // const country = countryInfo?.name;

    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.shippingInfoHeading" />
        </Heading>
        <div className={css.shippingInfoContent}>
          {address}
          {/* <br />
          {phoneMaybe}
          {address_line_1}
          {city_locality}
          <br />
          {postal_code}, {state_province}
          <br />
          {state_province ? `${state_province} ` : ''}
          {country}
          <br /> */}
        </div>
      </div>
    );
  }
  return null;
};

export default DeliveryInfoMaybe;
