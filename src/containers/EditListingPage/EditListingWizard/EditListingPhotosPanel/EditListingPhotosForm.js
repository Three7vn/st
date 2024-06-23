import React, { useEffect, useState } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { ARRAY_ERROR } from 'final-form';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, intlShape, injectIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { nonEmptyArray, composeValidators } from '../../../../util/validators';
import { isUploadImageOverLimitError } from '../../../../util/errors';

// Import shared components
import { Button, Form, AspectRatioWrapper, Modal } from '../../../../components';

// Import modules from this directory
import ListingImage from './ListingImage';
import css from './EditListingPhotosForm.module.css';
import { useDispatch } from 'react-redux';
import { uploadImagesToCloudinary } from '../../EditListingPage.duck';
import { deleteImageFromCloudinary } from '../../../../util/api';
import { getFileExtension } from '../../../../util/dataExtractor';
import IconCollection from '../../../../components/IconCollection/IconCollection';

const ACCEPT_IMAGES = 'image/*';

const ImageUploadError = props => {
  return props.uploadOverLimit ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
    </p>
  ) : props.uploadImageError ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
    </p>
  ) : null;
};

// NOTE: PublishListingError and ShowListingsError are here since Photos panel is the last visible panel
// before creating a new listing. If that order is changed, these should be changed too.
// Create and show listing errors are shown above submit button
const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.publishListingFailed" />
    </p>
  ) : null;
};

const ShowListingsError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
    </p>
  ) : null;
};

// Field component that uses file-input to allow user to select images.
export const FieldAddImage = props => {
  const {
    formApi,
    loader,
    onImageUploadHandler,
    aspectWidth = 1,
    aspectHeight = 1,
    ...rest
  } = props;
  const [imgUrl, setImgUrl] = useState('');
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        const onChange = e => {
          const file = e.target.files[0];
          const blobUrl = window.URL.createObjectURL(file);
          setImgUrl(blobUrl);
          formApi.change(`addImage`, file);
          formApi.blur(`addImage`);
          onImageUploadHandler(file, formApi);
        };
        const inputProps = { accept, id: name, name, onChange, type };
        return (
          <div className={css.addImageWrapper}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}
              <label htmlFor={name} className={css.addImage}>
                {loader && imgUrl ? (
                  <img src={imgUrl} className={css.image} />
                ) : (
                  <div className={css.addImgWrapper}>
                    <IconCollection icon="uploadIcon" />
                    {label}
                  </div>
                )}
                {loader ? (
                  <div className={css.fallbackWhileDownloading}>
                    <span className={css.loader}></span>
                    <span className={css.loading}>uploading</span>
                  </div>
                ) : null}
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};
// Component that shows listing images from "images" field array
const FieldListingImage = props => {
  const { name, intl, onRemoveImage, aspectWidth, aspectHeight, variantPrefix } = props;
  return (
    <Field name={name}>
      {fieldProps => {
        const { input } = fieldProps;
        const image = input.value;
        return image ? (
          <ListingImage
            image={image}
            key={image?.id?.uuid || image?.id}
            className={css.thumbnail}
            savedImageAltText={intl.formatMessage({
              id: 'EditListingPhotosForm.savedImageAltText',
            })}
            onRemoveImage={() => onRemoveImage(image?.id)}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
          />
        ) : null;
      }}
    </Field>
  );
};

export const EditListingPhotosFormComponent = props => {
  const dispatch = useDispatch();

  const [state, setState] = useState({ imageUploadRequested: false });
  const [submittedImages, setSubmittedImages] = useState([]);
  const [uploadImageInProgress, setUploadImageInProgress] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(null);
  const [uploadImages, setUploadImages] = useState(
    props.listingImagesUrl ? props.listingImagesUrl : []
  );

  const onImageUploadHandler = async (file, formApi) => {
    const { listingImageConfig, onImageUpload } = props;
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert('File size exceeds the maximum allowed (20 MB)');
      return;
    }

    if (file) {
      setState({ imageUploadRequested: true });
      setUploadImageInProgress(true);
      try {
        const extension = getFileExtension(file.name);
        const isValidExtension = ['jpg', 'jpeg', 'png'].includes(extension);
        if (isValidExtension) {
          await onImageUpload({ id: `${file.name}_${Date.now()}`, file }, listingImageConfig);
        }
        const cloudinaryResponse = await dispatch(uploadImagesToCloudinary(file));
        let listingImageUrls = [];

        if (cloudinaryResponse?.secure_url) {
          // If secure_urls is a single URL
          if (typeof cloudinaryResponse?.secure_url === 'string') {
            listingImageUrls.push(cloudinaryResponse?.secure_url);
          }
          // If cloudinaryResponse?.secure_urls is an array of URLs
          else if (Array.isArray(cloudinaryResponse?.secure_url)) {
            listingImageUrls.push(...cloudinaryResponse?.secure_url);
          }
        }
        if (cloudinaryResponse) {
          setUploadImageInProgress(false);
          setUploadImages(prevImages => [
            ...prevImages,
            {
              url: cloudinaryResponse?.secure_url,
              type: file.type,
              fileName: 'listing',
              public_id: cloudinaryResponse?.public_id,
              resource_type: cloudinaryResponse?.resource_type,
            },
          ]);
        }
        formApi.change('listingImagesUrl', uploadImages);
      } catch (error) {
        setUploadImageInProgress(false);
      } finally {
        setUploadImageInProgress(false);
        setState({ imageUploadRequested: false });
      }
    }
  };

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          form,
          className,
          fetchErrors,
          handleSubmit,
          intl,
          invalid,
          onRemoveImage,
          disabled,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          touched,
          errors,
          values,
          listingImageConfig,
        } = formRenderProps;

        const images = values.images;
        const { aspectWidth = 1, aspectHeight = 1, variantPrefix } = listingImageConfig;

        const { publishListingError, showListingsError, updateListingError, uploadImageError } =
          fetchErrors || {};
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        // imgs can contain added images (with temp ids) and submitted images with uniq ids.
        const arrayOfImgIds = imgs => imgs.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
        const imageIdsFromProps = arrayOfImgIds(images);
        const imageIdsFromPreviousSubmit = arrayOfImgIds(submittedImages);
        const imageArrayHasSameImages = isEqual(imageIdsFromProps, imageIdsFromPreviousSubmit);
        const submittedOnce = submittedImages.length > 0;
        const pristineSinceLastSubmit = submittedOnce && imageArrayHasSameImages;

        const submitReady = (updated && pristineSinceLastSubmit) || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled =
          invalid || disabled || submitInProgress || state.imageUploadRequested || ready;
        const imagesError = touched.images && errors?.images && errors.images[ARRAY_ERROR];

        const classes = classNames(css.root, className);

        useEffect(() => {
          if (uploadImages) {
            form.change('listingImagesUrl', uploadImages);
          }
        }, [uploadImages?.length]);

        const handleDeleteImage = async val => {
          setUploadImageInProgress(true);
          const index = uploadImages.findIndex(e => e.url === val.url);
          try {
            const updatedUrl = [...uploadImages];
            updatedUrl.splice(index, 1); // Remove the URL at the specified index
            setUploadImages(updatedUrl);
            form.change('listingImagesUrl', updatedUrl);
            setUploadImageInProgress(false);
            setIsDeleteModalOpen(null);
            await deleteImageFromCloudinary({
              public_id: val.public_id,
              resource_type: val.resource_type,
            });
          } catch (error) {
            setUploadImageInProgress(false);
          }
        };

        const deleteImageModal = (
          <Modal
            id="imagesDeleteModal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(null);
            }}
            usePortal
            contentClassName={css.modalContent}
            onManageDisableScrolling={() => {}}
            className={css.modalDelete}
          >
            <div className={css.deleteModalContent}>
              <h3>
                <FormattedMessage id="EditlistingPhotosForm.deleteHeading" />
              </h3>
              <p>
                <FormattedMessage id="DraftListingsCard.deleteText" />
              </p>
              <div className={css.modalButton}>
                <Button className={css.cancelBtn} onClick={() => setIsDeleteModalOpen(null)}>
                  <FormattedMessage id="DraftListingsCard.cancel" />
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteImage(isDeleteModalOpen);
                  }}
                  inProgress={false}
                >
                  <FormattedMessage id="DraftListingsCard.delete" />
                </Button>
              </div>
            </div>
          </Modal>
        );

        const handleRemoveClick = image => {
          setIsDeleteModalOpen(image);
        };
        return (
          <Form
            className={classes}
            onSubmit={e => {
              setSubmittedImages(images);
              handleSubmit(e);
            }}
          >
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.updateFailed" />
              </p>
            ) : null}
            {deleteImageModal}
            <div
              className={classNames(
                css.imagesFieldArray,
                (uploadImages.length > 0 || uploadImageInProgress) && css.UploadedField
              )}
            >
              <FieldAddImage
                id="addImage"
                name="addImage"
                accept={ACCEPT_IMAGES}
                label={
                  <span className={css.chooseImageText}>
                    <span className={css.chooseImage}>
                      <FormattedMessage id="EditListingPhotosForm.chooseImage" />
                    </span>
                    <span className={css.imageTypes}>
                      <FormattedMessage id="EditListingPhotosForm.imageTypes" />
                    </span>
                  </span>
                }
                type="file"
                disabled={state.imageUploadRequested}
                formApi={form}
                onImageUploadHandler={onImageUploadHandler}
                aspectWidth={aspectWidth}
                aspectHeight={aspectHeight}
                loader={uploadImageInProgress}
              />
              {uploadImages.length > 0 &&
                uploadImages.map((image, index) => {
                  return (
                    <div className={css.aspectRoot} key={image?.url}>
                      <img className={css.rootForImage} src={image.url} />
                      <div className={css.closeBtn}>
                        <span
                          type="button"
                          onClick={() => {
                            handleRemoveClick(image);
                          }}
                        >
                          <IconCollection icon="crossIcon" />
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {imagesError ? <div className={css.arrayError}>{imagesError}</div> : null}

            <ImageUploadError
              uploadOverLimit={uploadOverLimit}
              uploadImageError={uploadImageError}
            />

            <p className={css.tip}>
              <FormattedMessage id="EditListingPhotosForm.addImagesTip" />
            </p>

            <PublishListingError error={publishListingError} />
            <ShowListingsError error={showListingsError} />
            {/* {uploadImages && (
              <span className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.errorText" values={{ TabName: <b>Photos</b> }} />
              </span>
            )} */}
            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled || uploadImages?.length < 3}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

EditListingPhotosFormComponent.defaultProps = { fetchErrors: null };

EditListingPhotosFormComponent.propTypes = {
  fetchErrors: shape({
    publishListingError: propTypes.error,
    showListingsError: propTypes.error,
    uploadImageError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  intl: intlShape.isRequired,
  onImageUpload: func.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
  listingImageConfig: object.isRequired,
};

export default compose(injectIntl)(EditListingPhotosFormComponent);
