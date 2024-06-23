import React, { Component } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import moment from 'moment';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import appSettings from '../../../config/settings';
import IconProfileCard from '../../../components/IconProfileCard/IconProfileCard';

import {
  Form,
  Button,
  FieldTextInput,
  FieldSelect,
  FieldDateInput,
  FieldDateRangeInput,
  IconSpinner,
} from '../../../components';

import css from './DiscountPageForm.module.css';
import { addOrUpdateDiscounts, fetchDiscount } from '../../../util/api';

const DISCOUNT_MAX_LENGTH = 20;
const DISCOUNT_MIN_LENGTH = 3;

class DiscountPageFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = {
      uploadDelay: false,
      startDate: null,
      endDate: null,
      focusedInput: null,
      cashOffOrder: '',
      percent: '',
    };
    this.submittedValues = {};
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  handleKeyUp(e) {
    const name = e?.target?.name || 'percent';
    const value = e?.target?.value || e;
    this.setState({ [name]: value }, () => {
      if (name === 'cashOffOrder' && value !== '') {
        this.setState({ percent: '' });
      } else if (name === 'percent' && value !== '') {
        this.setState({ cashOffOrder: '' });
      }
    });
  }

  onRemoveDiscount = (index, discounts , fetchDiscounts) => {
    const newDiscounts = discounts.filter((st, i) => i !== index);
  const deletedDiscount = discounts.find((st, i) => i === index);
    // Assuming addOrUpdateDiscounts returns a promise
    addOrUpdateDiscounts({ deletedDiscountCode: deletedDiscount?.discountCode })
      .then(response => {
        fetchDiscounts()
        // Update state after successfully updating the discounts
        this.setState({ discounts: newDiscounts });
      })
      .catch(error => {
        console.error('Error updating discounts:', error);
      });
  };

  render() {
    const { cashOffOrder, percent } = this.state;

    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            className,
            currentUser,
            handleSubmit,
            intl,
            invalid,
            pristine,
            form,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadInProgress,
            values,
            discounts,
            fetchDiscounts,
          } = fieldRenderProps;
          const { privateData } = currentUser?.attributes?.profile || {};

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="DiscountPageForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = typeof updateInProgress == 'string' ? false : updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristine || pristineSinceLastSubmit || uploadInProgress || submitInProgress;

          const disMaxKength = validators.maxLength(
            intl.formatMessage({ id: 'DiscountPage.addNewDiscountMaxLength' }),
            DISCOUNT_MAX_LENGTH
          );

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e, form);
              }}
            >
              <div className={css.sectionContainer}>
                {discounts && discounts.length ? (
                  <div>
                    <h2 className={css.liveHeading}>
                      {intl.formatMessage({ id: 'DiscountPageForm.liveDiscount' })}
                    </h2>
                    <div>
                      {discounts.map((st, index) => {
                        const {
                          discountCode = '',
                          durationStartDate,
                          durationEndDate,
                          cashOffOrder,
                          percent,
                        } = st;
                        return (
                          <div key={`variants${index}`} className={css.formRow}>
                            <div className={css.sizeColors}>
                              {' '}
                              <span className={css.point}></span>{' '}
                              <span className={css.varientSelected}>
                                {durationStartDate && durationEndDate
                                  ? `${moment(durationStartDate * 1000).format(
                                      'MMM DD, YY'
                                    )} - ${moment(durationEndDate * 1000).format('MMM DD, YY')}`
                                  : ''}{' '}
                                | {cashOffOrder} {' | '} {percent}
                              </span>{' '}
                            </div>
                            <div className={css.buttons}>
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  form.change('updateDiscount', 'update');
                                  form.change('discountCode', discountCode);
                                  form.change('durationStartDate', {
                                    date: moment(durationStartDate * 1000).toDate(),
                                  });
                                  form.change('durationEndDate', {
                                    date: moment(durationEndDate * 1000).toDate(),
                                  });
                                  form.change('cashOffOrder', cashOffOrder);
                                  form.change('percent', percent);
                                }}
                                className={css.trashButton}
                              >
                                <IconProfileCard type="bluedot" />
                              </button>

                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  this.onRemoveDiscount(index, discounts, fetchDiscounts);
                                }}
                                className={css.trashButton}
                              >
                                {updateInProgress && updateInProgress == cashOffOrder ? (
                                  <IconSpinner />
                                ) : (
                                  <IconProfileCard type="cross" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <h2 className={css.newDiscountHeading}>
                  {intl.formatMessage({ id: 'DiscountPage.addNewDiscountHeading' })}
                </h2>

                <FieldTextInput
                  id={`updateDiscount`}
                  name="updateDiscount"
                  className={css.field}
                  type="hidden"
                />

                <FieldTextInput
                  id={`discountCode`}
                  name="discountCode"
                  className={css.field}
                  type="text"
                  label={intl.formatMessage({ id: 'DiscountPageForm.discountTypeLabel' })}
                  placeholder={intl.formatMessage({
                    id: 'DiscountPageForm.discountTypePlaceHolder',
                  })}
                />

                <div className={css.rowFields}>
                  <FieldDateInput
                    id="durationStartDate"
                    name="durationStartDate"
                    className={css.inboxInput}
                    label={intl.formatMessage({ id: 'DiscountPageForm.durationLabel' })}
                    displayFormat="MMM DD, YY"
                    placeholderText={'MMM DD, YY'}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'DiscountPageForm.durationStartDateRequirted',
                      })
                    )}
                  />

                  <FieldDateInput
                    id="durationEndDate"
                    name="durationEndDate"
                    className={css.inboxInput}
                    label={intl.formatMessage({ id: 'DiscountPageForm.durationEndDateLabel' })}
                    displayFormat="MMM DD, YY"
                    placeholderText={'MMM DD, YY'}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'DiscountPageForm.durationEndDateRequired',
                      })
                    )}
                    isDayBlocked={day => {
                      if (values && values.durationStartDate && values.durationStartDate.date) {
                        return moment(day).unix() < moment(values.durationStartDate.date).unix();
                      } else {
                        return true;
                      }
                    }}
                  />

                  {/* <FieldTextInput
                id={`duration`}
                name="duration"
                className={css.field}
                type="text"
                label={intl.formatMessage({ id: 'DiscountPageForm.durationLabel' })}
                placeholder={intl.formatMessage({ id: 'DiscountPageForm.durationPlaceHolder' })}
                disabled
              /> */}
                </div>

                <div className={css.rowFields}>
                  <FieldTextInput
                    id="cashOffOrder"
                    name="cashOffOrder"
                    className={css.field}
                    type="number"
                    label={intl.formatMessage({ id: 'DiscountPageForm.cashOffOrderLabel' })}
                    placeholder={intl.formatMessage({
                      id: 'DiscountPageForm.cashOffOrderPlaceHolder',
                    })}
                    onKeyUp={this.handleKeyUp}
                    maxLength={DISCOUNT_MAX_LENGTH}
                    minLength={DISCOUNT_MIN_LENGTH}
                    value={cashOffOrder}
                    disabled={percent !== ''}
                    // validate={validators.composeValidators(
                    //   validators.required(
                    //     intl.formatMessage({ id: 'DiscountPageForm.cashOffOrderRequired' })
                    //   )
                    // )}
                  />

                  <FieldSelect
                    id="percent"
                    name="percent"
                    className={css.field}
                    label={intl.formatMessage({ id: 'DiscountPageForm.percentLabel' })}
                    // validate={validators.required(
                    //   intl.formatMessage({ id: 'DiscountPageForm.percentRequired' })
                    // )}
                    onChange={this.handleKeyUp}
                    value={percent}
                    disabled={cashOffOrder !== ''}
                  >
                    <option disabled value="">
                      {intl.formatMessage({ id: 'DiscountPageForm.percentPlaceHolder' })}
                    </option>
                    {Array(96)
                      .fill('_')
                      .map((item, index) => (
                        <option key={index + 'percent'} value={index + 5}>
                          {index + 5}%
                        </option>
                      ))}
                  </FieldSelect>
                </div>
              </div>

              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                // disabled={submitDisabled}
              >
                {values && values.updateDiscount && values.updateDiscount == 'update' ? (
                  <FormattedMessage id="DiscountPageForm.updateChanges" />
                ) : (
                  <FormattedMessage id="DiscountPageForm.saveChanges" />
                )}
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

DiscountPageFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

DiscountPageFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const DiscountPageForm = compose(injectIntl)(DiscountPageFormComponent);

DiscountPageForm.displayName = 'DiscountPageForm';

export default DiscountPageForm;
