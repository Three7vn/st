import React, { useCallback, useEffect, useState } from 'react';
import { bool, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, intlShape } from '../../../util/reactIntl';

import {
  FieldLocationAutocompleteInput,
  FieldSelect,
  Heading,
  IconSpinner,
  NamedLink,
} from '../../../components';

import css from './ShippingDetails.module.css';
import { useDispatch } from 'react-redux';
import { fetchRedeemedVouchers } from '../../../util/api';
import { debounce } from 'lodash';
import { redeemedSellingVoucherSuccess, redeemedVoucherSuccess } from '../CheckoutPage.duck';

const identity = v => v;
const ShippingDetails = props => {
  const {
    rootClassName,
    className,
    intl,
    values,
    shipingRates,
    setSelectedRate,
    formId,
    onDiscountOffer,
    deliveryMethodMaybe,
    offerPrice,
    cartItems,
    planName,
    selectedRate,
    pageData,
    fetchSpeculatedTransaction,
    currentUser,
    isVerify,
    shippingMessage,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const dispatch = useDispatch();
  const userId = currentUser?.id?.uuid || '';
  const [selectedOption, setSelectedOption] = useState('');

  const [redeemedVouchers, setSetRedeemedVouchers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [fetchDiscount, setFetchDiscount] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRedeemedVouchers({ userId: userId }).then(res => {
      const filterRedeemedVouchers = res?.history?.filter(
        ({ isUsed, voucherType, isSellingFees }) =>
          voucherType === 'platform' && !isUsed && !isSellingFees
      );

      const filteredSellingRedeemedVouchers = res?.history?.filter(
        ({ isUsed, voucherType, isSellingFees }) =>
          voucherType === 'platform' && !isUsed && isSellingFees
      );
      console.log('filteredSellingRedeemedVouchers :>> ', filteredSellingRedeemedVouchers);
      // Sort the vouchers by date
      const sortedVouchers = filteredSellingRedeemedVouchers?.sort((a, b) => a.date - b.date);

      // Get the first voucher
      const firstVoucher = sortedVouchers?.[0];
      console.log('firstVoucher :>> ', firstVoucher);

      dispatch(redeemedSellingVoucherSuccess(firstVoucher));
      setSetRedeemedVouchers(filterRedeemedVouchers);
    });
  }, []);
  
  const handleDiscount = async discountCode => {
    try {
      if (discountCode) {
        const response = await onDiscountOffer({ discountCode });
        if (response?.count?.discountCode) {
          setMessage('Coupon applied');
          fetchSpeculatedTransaction({
            orderData: {
              stockReservationQuantity: 1,
              ...deliveryMethodMaybe,
              offerPrice,
              cartItems,
              planName,
              discount: response?.count,
              selectedRate,
            },
            listingId: pageData?.listing?.id,
            isOwnListing: false,
          });
        }
      }
    } catch (error) {
      setMessage(`Failed to apply coupon: ${error}`);
    } finally {
      setFetchDiscount(false);
    }
  };

  const handleRewards = async currentVoucher => {
    try {
      if (currentVoucher) {
        const { voucherValueType, voucherValue } = currentVoucher;
        fetchSpeculatedTransaction({
          orderData: {
            stockReservationQuantity: 1,
            ...deliveryMethodMaybe,
            offerPrice,
            cartItems,
            planName,
            selectedRate,
            voucherValue,
            voucherValueType,
          },
          listingId: pageData?.listing?.id,
          isOwnListing: false,
        });
      }
    } catch (error) {
      setMessage(`Failed to apply coupon: ${error}`);
    } finally {
      setFetchDiscount(false);
    }
  };

  // Create a debounced function using useCallback and lodash's debounce
  const debouncedSave = useCallback(
    debounce(nextValue => {
      handleDiscount(nextValue);
    }, 2000),
    [selectedRate]
  );

  const handleChange = event => {
    setFetchDiscount(true);
    const { value } = event.target;
    setInputValue(value);
    debouncedSave(value);
  };

  const { location } = (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};
  return (
    <div className={classes}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id="ShippingDetails.title" />
      </Heading>
      {location ? (
        <div>
          <span>{location?.address}</span>{' '}
          <NamedLink name="ProfileSettingsPage">
            <span>
              <FormattedMessage id="ShippingDetails.change" />
            </span>
          </NamedLink>
        </div>
      ) : (
        <div>
          <FieldLocationAutocompleteInput
            rootClassName={css.input}
            inputClassName={css.locationAutocompleteInput}
            iconClassName={css.locationAutocompleteInputIcon}
            predictionsClassName={css.predictionsRoot}
            validClassName={css.validLocation}
            name="location"
            useDefaultPredictions={false}
            format={identity}
            valueFromForm={values.location}
            // validate={validators.composeValidators(
            //   validators.autocompleteSearchRequired(addressRequiredMessage),
            //   validators.autocompletePlaceSelected(addressNotRecognizedMessage)
            // )}
            key={'shippinglocationValidation'}
          />
        </div>
      )}
      <FieldSelect
        id="shippingOptions"
        name="shippingOptions"
        className={css.fieldFullWidth}
        label={intl.formatMessage({ id: 'ShippingDetails.shippingOptionsLabel' })}
        onChange={event => {
          const selectedObjectId = event;
          if (selectedObjectId) {
            const selectedRate =
              shipingRates?.length &&
              shipingRates.find(rate => rate.object_id === selectedObjectId);
            setSelectedRate(selectedRate);
            const deliveryMethodMaybe = { deliveryMethod: 'shipping' };
            const { orderData } = pageData || {};
            const { cartItems } = orderData?.otherOrderData || {};
            const offerPrice = pageData?.orderData?.offerPrice?.amount / 100 || {};
            const planName =
              pageData?.listing?.author?.attributes?.profile?.publicData?.currentPlanData
                ?.planName || {};
            fetchSpeculatedTransaction({
              orderData: {
                stockReservationQuantity: 1,
                ...deliveryMethodMaybe,
                offerPrice,
                cartItems,
                planName,
                selectedRate,
                isVerify,
              },
              listingId: pageData?.listing?.id,
              isOwnListing: false,
            });
          }
        }}
      >
        <option value={''}>Select one..</option>
        {shipingRates?.length > 0 &&
          shipingRates.map(type => {
            return (
              <option value={type?.object_id} key={type?.object_id}>
                {type?.servicelevel?.name} ({type.amount}) {type?.estimated_days}
              </option>
            );
          })}
      </FieldSelect>
      {shippingMessage}

      <div className={css.fieldFullWidth}>
        <div>
          <label>Discount Code:</label>
          <input
            className={css.discountCode}
            type="text"
            id={`${formId}.discountCode`}
            name="discountCode"
            label="Discount Code:"
            value={inputValue}
            onChange={handleChange}
          />
          {fetchDiscount && <IconSpinner className={css.spinner} />}
        </div>
        {message && message}
        <br />
        <div >
          <label>Voucher Options</label>
          <select
            value={selectedOption}
            onChange={e => {
              const currentVoucher =
                (redeemedVouchers || []).find(elm => elm.voucherName === e.target.value) || null;
              setSelectedOption(currentVoucher);
              dispatch(redeemedVoucherSuccess(currentVoucher));
              handleRewards(currentVoucher);
            }}
          >
            <option value={''}>Select Option</option>
            {(redeemedVouchers || [])?.map(({ voucherName }) => (
              <option value={voucherName}>{voucherName}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

ShippingDetails.defaultProps = {
  rootClassName: null,
  className: null,
  disabled: false,
  fieldId: null,
};

ShippingDetails.propTypes = {
  rootClassName: string,
  className: string,
  disabled: bool,
  formApi: object.isRequired,
  fieldId: string,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default ShippingDetails;
