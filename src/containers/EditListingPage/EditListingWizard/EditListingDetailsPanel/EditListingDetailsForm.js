import React, { useState } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import {
  EXTENDED_DATA_SCHEMA_TYPES,
  SUBSCRIPTION_BUSINESSENTERPRISE,
  USER_PLAN_TYPE,
  USER_TYPE_BUSINESS,
  propTypes,
} from '../../../../util/types';
import { maxLength, required, composeValidators } from '../../../../util/validators';

// Import shared components
import { Form, Button, FieldSelect, FieldTextInput, Heading } from '../../../../components';
// Import modules from this directory
import CustomExtendedDataField from '../CustomExtendedDataField';
import css from './EditListingDetailsForm.module.css';
import {
  listingBatteryTypes,
  listingCapacities,
  listingCategories,
  listingColors,
  listingCompatible,
  listingConditions,
  listingConnectivity,
  listingDisplay,
  listingDisplayTechnology,
  listingDisplayType,
  listingMaterials,
  listingMaximumResolution,
  listingModels,
  listingOperatingSystem,
  listingOpticalZoom,
  listingRAMS,
  listingRefreshRate,
  listingRefurbishes,
  listingSizes,
  listingStorageType,
  listingSubCategories,
  listingSubCategoriesChild,
  listingVideoInputs,
} from '../../../../config/configListing';
import { useSelector } from 'react-redux';
import { listingBrands } from '../../../../config/configBrand';
import { getLabel } from '../../../../util/dataExtractor';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { listingFieldTypes } from '../../../../config/configTypes';

const TITLE_MAX_LENGTH = 75;
const DESCRIPTION_MAX_LENGTH = 1000;
const MAX_LENGTH = 50;
// Show various error messages
const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  if (errorMessage) {
    return <p className={css.error}>{errorMessage}</p>;
  }
  return null;
};

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit
const FieldSelectListingType = props => {
  const { name, listingTypes, hasExistingListingType, onListingTypeChange, formApi, intl } = props;
  const hasMultipleListingTypes = listingTypes?.length > 1;

  const handleOnChange = value => {
    const selectedListingType = listingTypes.find(config => config.listingType === value);
    formApi.change('transactionProcessAlias', selectedListingType.transactionProcessAlias);
    formApi.change('unitType', selectedListingType.unitType);

    if (onListingTypeChange) {
      onListingTypeChange(selectedListingType);
    }
  };
  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(config => config.listingType === listingType);
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  return hasMultipleListingTypes && !hasExistingListingType ? (
    <>
      <FieldSelect
        id={name}
        name={name}
        className={css.listingTypeSelect}
        label={intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
        validate={required(
          intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeRequired' })
        )}
        onChange={handleOnChange}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypePlaceholder' })}
        </option>
        {listingTypes.map(config => {
          const type = config.listingType;
          return (
            <option key={type} value={type}>
              {config.label}
            </option>
          );
        })}
      </FieldSelect>
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  ) : hasMultipleListingTypes && hasExistingListingType ? (
    <div className={css.listingTypeSelect}>
      <Heading as="h5" rootClassName={css.selectedLabel}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
      </Heading>
      <p className={css.selectedValue}>{getListingTypeLabel(formApi.getFieldState(name)?.value)}</p>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </div>
  ) : (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

// Add collect data for listing fields (both publicData and privateData) based on configuration
const AddListingFields = props => {
  const { listingType, listingFieldsConfig, intl } = props;
  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const { key, includeForListingTypes, schemaType, scope } = fieldConfig || {};
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetListingType =
      includeForListingTypes == null || includeForListingTypes.includes(listingType);
    const isProviderScope = ['public', 'private'].includes(scope);

    return isKnownSchemaType && isTargetListingType && isProviderScope
      ? [
          ...pickedFields,
          <CustomExtendedDataField
            key={namespacedKey}
            name={namespacedKey}
            fieldConfig={fieldConfig}
            defaultRequiredMessage={intl.formatMessage({
              id: 'EditListingDetailsForm.defaultRequiredMessage',
            })}
          />,
        ]
      : pickedFields;
  }, []);

  return <>{fields}</>;
};

// Form that asks title, description, transaction process and unit type for pricing
// In addition, it asks about custom fields according to marketplace-custom-config.js
const EditListingDetailsFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        formId,
        form: formApi,
        handleSubmit,
        onListingTypeChange,
        intl,
        invalid,
        pristine,
        selectableListingTypes,
        hasExistingListingType,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig,
        values,
        publicData,
        form,
      } = formRenderProps;
      const [selectedCategory, setSelectedCategory] = useState(null);
      const [isFieldShow, setIsFieldShow] = useState(false);

      const state = useSelector(state => state);
      const { currentUser } = state.user;
      const { currentPlanData } =
        (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};
      const { planName } = currentPlanData || {};
      const { listingType } = values;
      const { subCategory } = publicData || {};

      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titleRequired',
      });

      const sizeRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.sizeRequired',
      });

      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const maxDescriptionLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: DESCRIPTION_MAX_LENGTH,
        }
      );

      const maxTextLength = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: MAX_LENGTH,
        }
      );
      const postalCodeRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.postalCodeRequiredMessage',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const maxLength1000Message = maxLength(maxDescriptionLengthMessage, DESCRIPTION_MAX_LENGTH);
      const maxLength50Message = maxLength(maxTextLength, MAX_LENGTH);

      // Show title and description only after listing type is selected
      const showTitle = listingType;
      const showDescription = listingType;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const filterSubCategories = listingSubCategories.filter(
        e => e.parentCollection === values?.category
      );
      const filterSubCategoriesChild = listingSubCategoriesChild.filter(
        e => e.parentCategory === values?.subCategory?.subCategory
      );
      const filterConditions = listingConditions.filter(e =>
        e.parentCollection.includes(values?.category)
      );
      const filterCapacities = listingCapacities.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterStorages = listingStorageType.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child || values?.subCategory?.subCategory)
      );
      const filterModels = listingModels.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterCompatible = listingCompatible.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterRefurbish = listingRefurbishes.filter(
        e =>
          e.parentSubCategory.includes(values?.subCategory?.child) ||
          e.parentCategory.includes(values?.subCategory?.subCategory)
      );
      const filterBrand = listingBrands.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child || values?.subCategory?.subCategory)
      );
      const filterMaterials = listingMaterials.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterTypes = listingFieldTypes.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child || values?.subCategory?.subCategory)
      );

      const filterRAMS = listingRAMS.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterOperatingSystem = listingOperatingSystem.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child || values?.subCategory?.subCategory)
      );
      const filterRefreshRates = listingRefreshRate.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterVideoInputs = listingVideoInputs.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterDisplayTypes = listingDisplayType.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterConnectivity = listingConnectivity.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterOpticalZoom = listingOpticalZoom.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterMaximumResolution = listingMaximumResolution.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterBatteryTypes = listingBatteryTypes.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterDisplayTechnology = listingDisplayTechnology.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.child)
      );
      const filterDisplay = listingDisplay.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.subCategory)
      );
      const filterSizes = listingSizes.filter(e =>
        e.parentSubCategory.includes(values?.subCategory?.subCategory)
      );

      const handleCategoryClick = category => {
        if (category !== values.category) {
          form.change('subCategory', '');
        }
        form.change('subCategory', { subCategory: category, child: '' });
        setSelectedCategory(category);
        const tet = listingSubCategoriesChild.filter(e => e.parentCategory === selectedCategory);
        if (values?.category !== 'electronics') {
          setIsFieldShow(false);
        }
      };

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <ErrorMessage fetchErrors={fetchErrors} />

          <FieldSelectListingType
            name="listingType"
            listingTypes={selectableListingTypes}
            hasExistingListingType={hasExistingListingType}
            onListingTypeChange={onListingTypeChange}
            formApi={formApi}
            intl={intl}
          />

          {showTitle ? (
            <FieldTextInput
              id={`${formId}title`}
              name="title"
              className={css.title}
              type="text"
              label={intl.formatMessage({ id: 'EditListingDetailsForm.title' })}
              placeholder={intl.formatMessage({ id: 'EditListingDetailsForm.titlePlaceholder' })}
              maxLength={TITLE_MAX_LENGTH}
              validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
              autoFocus={autoFocus}
            />
          ) : null}
          <div className={css.fieldsRow}>
            <FieldSelect
              name="category"
              id="category"
              className={css.description}
              label={intl.formatMessage({ id: 'EditListingDetailsForm.category' })}
              onChange={e => {
                if (e !== publicData?.category) {
                  form.change('subCategory', null);
                } else {
                  form.change('subCategory', subCategory);
                }
              }}
              validate={required(postalCodeRequiredMessage)}
            >
              <option value={''}>Select</option>
              {listingCategories.map(type => (
                <option key={type.option} value={type.option}>
                  {type.label}
                </option>
              ))}
            </FieldSelect>
            <div className={css.subCategoryWrapper}>
              <label>{'Sub Category'}</label>
              <div
                onClick={() => {
                  isFieldShow ? setIsFieldShow(false) : setIsFieldShow(true);
                }}
                className={css.categoryInput}
              >
                {values?.subCategory ? (
                  <>
                    {getLabel(filterSubCategories, values?.subCategory?.subCategory)}
                    {values?.subCategory?.child && (
                      <> | {getLabel(filterSubCategoriesChild, values?.subCategory?.child)} </>
                    )}
                    {/* {isFieldShow ? (
                      <span className={css.clearSearchButtons}>
                        <IconCollection icon="IconArrowUp" />
                      </span>
                    ) : (
                      <span className={css.clearSearchButtons}>
                        <IconCollection icon="IconArrowDown" />
                      </span>
                    )} */}
                  </>
                ) : (
                  <>Select One...</>
                )}
              </div>
              <div className={css.dropdown}>
                {isFieldShow ? (
                  <div className={css.customselect}>
                    <div className={css.customList}>
                      {filterSubCategories.map(category => (
                        <div
                          key={category.option}
                          className={`${css.category} ${
                            selectedCategory === category.option ||
                            values.category === category.option
                              ? css.active
                              : ''
                          }`}
                        >
                          <div onClick={() => handleCategoryClick(category.option)}>
                            <span>{category.label}</span>
                          </div>
                          {(selectedCategory
                            ? selectedCategory === category.option
                            : subCategory?.subCategory === category.option) &&
                            filterSubCategoriesChild?.length > 0 && (
                              <div className={css.subcategories}>
                                {filterSubCategoriesChild.map(subcategory => (
                                  <div
                                    key={subcategory.option}
                                    className={classNames(
                                      css.subcategory,
                                      values?.subCategory?.child === subcategory.option
                                        ? css.active
                                        : ''
                                    )}
                                    onClick={() => {
                                      setIsFieldShow(false),
                                        form.change('subCategory', {
                                          subCategory: selectedCategory,
                                          child: subcategory.option,
                                        });
                                    }}
                                  >
                                    <span>{subcategory.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className={css.fieldsRow}>
            <FieldSelect
              name="condition"
              id="condition"
              className={css.description}
              label={intl.formatMessage({ id: 'EditListingDetailsForm.condition' })}
              validate={required(postalCodeRequiredMessage)}
            >
              <option value={''}>Select </option>
              {filterConditions.map(type => {
                return (
                  <option key={type.option} value={type.option}>
                    {type.label}
                  </option>
                );
              })}
            </FieldSelect>

            {filterBrand?.length > 0 && (
              <FieldSelect
                name="brand"
                id="brand"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.brand' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterBrand.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterStorages?.length > 0 && (
              <FieldSelect
                name="storage"
                id="storage"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.storage' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterStorages.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}

            {filterModels?.length > 0 && (
              <FieldSelect
                name="model"
                id="model"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.model' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterModels.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterCompatible?.length > 0 && (
              <FieldSelect
                name="compatiblity"
                id="compatiblity"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.compatiblity' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterCompatible.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}

            {filterRefurbish?.length > 0 && planName === SUBSCRIPTION_BUSINESSENTERPRISE && (
              <FieldSelect
                name="refurbished"
                id="refurbished"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.refurbished' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterRefurbish.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterMaterials?.length > 0 && (
              <FieldSelect
                name="material"
                id="material"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.material' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterMaterials.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterTypes?.length > 0 && (
              <FieldSelect
                name="type"
                id="type"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.type' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterTypes.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterRAMS?.length > 0 && (
              <FieldSelect
                name="ram"
                id="ram"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.ram' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterRAMS.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterOperatingSystem?.length > 0 && (
              <FieldSelect
                name="operatingSystem"
                id="operatingSystem"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.operatingSystem' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterOperatingSystem.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterCapacities?.length > 0 && (
              <FieldSelect
                name="capacity"
                id="capacity"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.capacity' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterCapacities.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterRefreshRates?.length > 0 && (
              <FieldSelect
                name="refreshRate"
                id="refreshRate"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.refreshRate' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterRefreshRates.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterVideoInputs?.length > 0 && (
              <FieldSelect
                name="videoInput"
                id="videoInput"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.videoInput' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterVideoInputs.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterDisplayTypes?.length > 0 && (
              <FieldSelect
                name="displayType"
                id="displayType"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.displayType' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterDisplayTypes.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterConnectivity?.length > 0 && (
              <FieldSelect
                name="connectivity"
                id="connectivity"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.connectivity' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterConnectivity.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterOpticalZoom?.length > 0 && (
              <FieldSelect
                name="opticalZoom"
                id="opticalZoom"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.opticalZoom' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterOpticalZoom.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterMaximumResolution?.length > 0 && (
              <FieldSelect
                name="maximumResolution"
                id="maximumResolution"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.maximumResolution' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterMaximumResolution.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterBatteryTypes?.length > 0 && (
              <FieldSelect
                name="batteryType"
                id="batteryType"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.batteryType' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterBatteryTypes.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterDisplayTechnology?.length > 0 && (
              <FieldSelect
                name="displayTechnology"
                id="displayTechnology"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.displayTechnology' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterDisplayTechnology.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
            {filterDisplay?.length > 0 && (
              <FieldSelect
                name="display"
                id="display"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.display' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterDisplay.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            {filterSizes?.length > 0 && (
              <FieldSelect
                name="size"
                id="size"
                className={css.description}
                label={intl.formatMessage({ id: 'EditListingDetailsForm.size' })}
                validate={required(postalCodeRequiredMessage)}
              >
                <option value={''}>Select </option>
                {filterSizes.map(type => {
                  return (
                    <option key={type.option} value={type.option}>
                      {type.label}
                    </option>
                  );
                })}
              </FieldSelect>
            )}
          </div>
          <div className={css.fieldsRow}>
            <FieldSelect
              name="color"
              id="color"
              className={css.description}
              label={intl.formatMessage({ id: 'EditListingDetailsForm.color' })}
              validate={required(postalCodeRequiredMessage)}
            >
              <option value={''}>Select </option>
              {listingColors.map(type => {
                return (
                  <option key={type.option} value={type.option}>
                    {type.label}
                  </option>
                );
              })}
            </FieldSelect>
          </div>
          {showDescription ? (
            <FieldTextInput
              id={`${formId}description`}
              name="description"
              className={css.description}
              type="textarea"
              label={intl.formatMessage({ id: 'EditListingDetailsForm.description' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDetailsForm.descriptionPlaceholder',
              })}
              maxLength={DESCRIPTION_MAX_LENGTH}
              validate={composeValidators(
                required(
                  intl.formatMessage({
                    id: 'EditListingDetailsForm.descriptionRequired',
                  })
                ),
                maxLength1000Message
              )}
            />
          ) : null}

          {/* <AddListingFields
            listingType={listingType}
            listingFieldsConfig={listingFieldsConfig}
            intl={intl}
          /> */}

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

EditListingDetailsFormComponent.defaultProps = {
  className: null,
  formId: 'EditListingDetailsForm',
  fetchErrors: null,
  hasExistingListingType: false,
  listingFieldsConfig: [],
};

EditListingDetailsFormComponent.propTypes = {
  className: string,
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  onListingTypeChange: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  selectableListingTypes: arrayOf(
    shape({
      listingType: string.isRequired,
      transactionProcessAlias: string.isRequired,
      unitType: string.isRequired,
    })
  ).isRequired,
  hasExistingListingType: bool,
  listingFieldsConfig: propTypes.listingFieldsConfig,
};

export default compose(injectIntl)(EditListingDetailsFormComponent);
