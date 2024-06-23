import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { Heading } from '../../components';

import css from './ListingPage.module.css';
import {
  listingBatteryTypes,
  listingCapacities,
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
  listingTypes,
  listingVideoInputs,
} from '../../config/configListing';
import { getLabel } from '../../util/dataExtractor';
import { listingBrands } from '../../config/configBrand';
import { listingFieldTypes } from '../../config/configTypes';

const SectionDetailsMaybe = props => {
  const { publicData, metadata = {}, listingConfig, intl } = props;
  const { listingFields } = listingConfig || {};

  if (!publicData || !listingConfig) {
    return null;
  }

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, includeForListingTypes, showConfig = {} } = config;
    const listingType = publicData.listingType;
    const isTargetListingType =
      includeForListingTypes == null || includeForListingTypes.includes(listingType);

    const { isDetail, label } = showConfig;
    const publicDataValue = publicData[key];
    const metadataValue = metadata[key];
    const value = publicDataValue || metadataValue;

    if (isDetail && isTargetListingType && typeof value !== 'undefined') {
      const findSelectedOption = enumValue => enumOptions?.find(o => enumValue === `${o.option}`);
      const getBooleanMessage = value =>
        value
          ? intl.formatMessage({ id: 'SearchPage.detailYes' })
          : intl.formatMessage({ id: 'SearchPage.detailNo' });
      const optionConfig = findSelectedOption(value);

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
        : schemaType === 'boolean'
        ? filteredConfigs.concat({ key, value: getBooleanMessage(value), label })
        : schemaType === 'long'
        ? filteredConfigs.concat({ key, value, label })
        : filteredConfigs;
    }
    return filteredConfigs;
  };

  const existingListingFields = listingFields.reduce(pickListingFields, []);
  const {
    condition,
    capacity,
    storage,
    model,
    compatiblity,
    refurbished,
    brand,
    material,
    type,
    ram,
    operatingSystem,
    refreshRate,
    videoInput,
    displayType,
    connectivity,
    opticalZoom,
    maximumResolution,
    batteryType,
    displayTechnology,
    display,
    size,
    color,
  } = publicData || {};

  return (
    <div className={css.sectionDetails}>
      <Heading as="h2" rootClassName={css.sectionHeading}>
        <FormattedMessage id="ListingPage.detailsTitle" />
      </Heading>
      {condition && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Condition</span>{' '}
          <span className={css.property}>{getLabel(listingConditions, condition)}</span>
          <br />
        </div>
      )}
      {capacity && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Capacity</span>{' '}
          <span className={css.property}>{getLabel(listingCapacities, capacity)}</span>
          <br />
        </div>
      )}
      {storage && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Storage</span>{' '}
          <span className={css.property}>{getLabel(listingStorageType, storage)}</span>
          <br />
        </div>
      )}
      {model && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Model</span>{' '}
          <span className={css.property}>{getLabel(listingModels, model)}</span>
          <br />
        </div>
      )}
      {compatiblity && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Compatiblity</span>{' '}
          <span className={css.property}>{getLabel(listingCompatible, compatiblity)}</span>
          <br />
        </div>
      )}
      {refurbished && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Refurbished</span>{' '}
          <span className={css.property}>{getLabel(listingRefurbishes, refurbished)}</span>
          <br />
        </div>
      )}
      {brand && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Brands</span>{' '}
          <span className={css.property}>{getLabel(listingBrands, brand)}</span>
          <br />
        </div>
      )}
      {material && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Material</span>{' '}
          <span className={css.property}>{getLabel(listingMaterials, material)}</span>
          <br />
        </div>
      )}
      {type && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Type</span>{' '}
          <span className={css.property}>{getLabel(listingFieldTypes, type)}</span>
          <br />
        </div>
      )}
      {ram && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>RAM</span>{' '}
          <span className={css.property}>{getLabel(listingRAMS, ram)}</span>
          <br />
        </div>
      )}
      {operatingSystem && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Operating System</span>{' '}
          <span className={css.property}>{getLabel(listingOperatingSystem, operatingSystem)}</span>
          <br />
        </div>
      )}
      {refreshRate && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Refresh Rate</span>{' '}
          <span className={css.property}>{getLabel(listingRefreshRate, refreshRate)}</span>
          <br />
        </div>
      )}
      {videoInput && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Video Input</span>{' '}
          <span className={css.property}>{getLabel(listingVideoInputs, videoInput)}</span>
          <br />
        </div>
      )}
      {displayType && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Display Type</span>{' '}
          <span className={css.property}>{getLabel(listingDisplayType, displayType)}</span>
          <br />
        </div>
      )}
      {connectivity && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Connectivity </span>{' '}
          <span className={css.property}>{getLabel(listingConnectivity, connectivity)}</span>
          <br />
        </div>
      )}
      {opticalZoom && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Optical Zoom </span>{' '}
          <span className={css.property}>{getLabel(listingOpticalZoom, opticalZoom)}</span>
          <br />
        </div>
      )}
      {maximumResolution && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Maximum Resolution </span>{' '}
          <span className={css.property}>{getLabel(listingOpticalZoom, opticalZoom)}</span>
          <br />
        </div>
      )}
      {batteryType && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Optical Zoom </span>{' '}
          <span className={css.property}>
            {getLabel(listingMaximumResolution, maximumResolution)}
          </span>
          <br />
        </div>
      )}
      {displayTechnology && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Display Technology </span>{' '}
          <span className={css.property}>
            {getLabel(listingDisplayTechnology, displayTechnology)}
          </span>
          <br />
        </div>
      )}
      {display && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Display </span>{' '}
          <span className={css.property}>{getLabel(listingDisplay, display)}</span>
          <br />
        </div>
      )}
      {size && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Size </span>{' '}
          <span className={css.property}>{getLabel(listingSizes, size)}</span>
          <br />
        </div>
      )}
      {color && (
        <div className={css.sectionDetailsProperty}>
          <span className={css.propertyTitle}>Color</span>{' '}
          <span className={css.property}>{getLabel(listingColors, color)}</span>
          <br />
        </div>
      )}

      {/* <ul className={css.details}>
        {existingListingFields.map(detail => (
          <li key={detail.key} className={css.detailsRow}>
            <span className={css.detailLabel}>{detail.label}</span>
            <span>{detail.value}</span>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default SectionDetailsMaybe;
