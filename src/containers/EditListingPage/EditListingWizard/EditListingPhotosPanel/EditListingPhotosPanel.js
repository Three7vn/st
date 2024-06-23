import React from 'react';
import { array, bool, func, object, string } from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPhotosForm from './EditListingPhotosForm';
import css from './EditListingPhotosPanel.module.css';

const getInitialValues = (params, listingImagesUrl) => {
  const { images } = params;
  return { images, listingImagesUrl };
};

const EditListingPhotosPanel = props => {
  const {
    className,
    rootClassName,
    errors,
    disabled,
    ready,
    listing,
    onImageUpload,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    onSubmit,
    onRemoveImage,
    listingImageConfig,
  } = props;

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;

  const { listingImagesUrl } = listing?.attributes?.publicData || {};

  return (
    <div className={classes}>
      <H3 as="h1" className={css.title}>
        {isPublished ? (
          <FormattedMessage
            id="EditListingPhotosPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingPhotosPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
      <EditListingPhotosForm
        className={css.form}
        disabled={disabled}
        ready={ready}
        fetchErrors={errors}
        initialValues={getInitialValues(props, listingImagesUrl)}
        onImageUpload={onImageUpload}
        listingImagesUrl={listingImagesUrl}
          onSubmit={values => {
            const { addImage, listingImagesUrl, ...updateValues } = values;
            Object.assign(updateValues, {
              publicData: {
                listingImagesUrl,
                updatedAt: Math.floor(Date.now() / 1000),
              },
            });
            onSubmit(updateValues);
          }}
        onRemoveImage={onRemoveImage}
        saveActionMsg={submitButtonText}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        listingImageConfig={listingImageConfig}
      />
    </div>
  );
};

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
  listingImageConfig: object.isRequired,
};

export default EditListingPhotosPanel;
