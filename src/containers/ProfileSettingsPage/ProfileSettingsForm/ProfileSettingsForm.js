import React, { Component, useEffect } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { isUploadImageOverLimitError } from '../../../util/errors';

import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  H4,
  FieldLocationAutocompleteInput,
} from '../../../components';

import css from './ProfileSettingsForm.module.css';
import LocationAutocompleteInputImpl from '../../../components/LocationAutocompleteInput/LocationAutocompleteInputImpl';
import IconCollection from '../../../components/IconCollection/IconCollection';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset
const identity = v => v;
const STORE_MAX_LENGTH = 20;
const BIO_MAX_LENGTH = 300;

class ProfileSettingsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = { uploadDelay: false };
    this.submittedValues = {};
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  render() {
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
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            marketplaceName,
            autoFocus,
            values,
            addressError,
            addressInProgress,
          } = fieldRenderProps;

          const user = ensureCurrentUser(currentUser);

          // First name
          const userNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.userNameLabel',
          });
          const userNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.userNamePlaceholder',
          });
          const userNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.userNameRequired',
          });
          const userNameRequired = validators.required(userNameRequiredMessage);

          // Last name
          const lastNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);
          // Store name
          const storeNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.storeNameLabel',
          });
          const storeNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.storeNamePlaceholder',
          });
          const storeNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.storeNameRequired',
          });
          const storeNameRequired = validators.required(storeNameRequiredMessage);

          // Registration number
          const regNumberLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.regNumberLabel',
          });
          const regNumberPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.regNumberPlaceholder',
          });
          const regNumberRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.regNumberRequired',
          });
          const regNumberRequired = validators.required(regNumberRequiredMessage);

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.bioPlaceholder',
          });

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = profileImage.imageId && this.state.uploadDelay;
          const imageFromFile =
            fileExists && (fileUploadInProgress || delayAfterUpload) ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectWidth={1}
                aspectHeight={1}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !fileUploadInProgress && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const chooseAvatarLabel =
            profileImage.imageId || fileUploadInProgress ? (
              <div className={css.avatarContainer}>
                {imageFromFile}
                {avatarComponent}
                <div className={css.changeAvatar}>
                  <IconCollection icon="cameraIcon" />
                  {/* <FormattedMessage id="ProfileSettingsForm.changeAvatar" /> */}
                </div>
              </div>
            ) : (
              <div className={css.avatarPlaceholder}>
                <div className={css.avatarPlaceholderText}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePicture" />
                </div>
                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePictureMobile" />
                </div>
              </div>
            );

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
            </div>
          ) : null;

          // const addressRequiredMessage = intl.formatMessage({
          //   id: 'ProfileSettingsForm.addressRequired',
          // });
          // const addressNotRecognizedMessage = intl.formatMessage({
          //   id: 'EditListingLocationForm.addressNotRecognized',
          // });

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristine || pristineSinceLastSubmit || uploadInProgress || submitInProgress;

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
            const addressArray = parseUKAddress(values?.location?.search || '');
            if (addressArray.length >= 3) {
              // Ensure we have Address, City, State/County PostalCode, and Country
              const { stateOrCounty, postalCode } = extractUKPostalCode(
                addressArray[addressArray.length - 2]
              );

              // Assuming the structure is: Address, City, State/County PostalCode, Country
              form.change(
                'address_line_1',
                addressArray.slice(0, addressArray.length - 3).join(', ')
              );
              form.change('city', addressArray[addressArray.length - 3]);
              form.change('postalCode', postalCode);
              form.change('state', stateOrCounty);
            }
          }, [values?.location?.search, form]);
          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.PhotouploadContainer}>
                {/* <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourProfilePicture" />
                </H4> */}
                <Field
                  accept={ACCEPT_IMAGES}
                  id="profileImage"
                  name="profileImage"
                  label={chooseAvatarLabel}
                  type="file"
                  form={null}
                  uploadImageError={uploadImageError}
                  disabled={uploadInProgress}
                >
                  {fieldProps => {
                    const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      form.change(`profileImage`, file);
                      form.blur(`profileImage`);
                      if (file != null) {
                        const tempId = `${file.name}_${Date.now()}`;
                        onImageUpload({ id: tempId, file });
                      }
                    };

                    let error = null;

                    if (isUploadImageOverLimitError(uploadImageError)) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                        </div>
                      );
                    } else if (uploadImageError) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                        </div>
                      );
                    }

                    return (
                      <div className={css.uploadAvatarWrapper}>
                        <label className={css.label} htmlFor={id}>
                          {label}
                        </label>
                        <input
                          accept={accept}
                          id={id}
                          name={name}
                          className={css.uploadAvatarInput}
                          disabled={disabled}
                          onChange={onChange}
                          type={type}
                        />
                        {error}
                      </div>
                    );
                  }}
                </Field>
                {/* <div className={css.tip}>
                  <FormattedMessage id="ProfileSettingsForm.tip" />
                </div>
                <div className={css.fileInfo}>
                  <FormattedMessage id="ProfileSettingsForm.fileInfo" />
                </div> */}
                <div className={css.nameContainer}>
                  <FieldTextInput
                    className={css.firstName}
                    type="text"
                    id="userName"
                    name="userName"
                    label={userNameLabel}
                    // placeholder={userNamePlaceholder}
                    validate={userNameRequired}
                  />
                  {/* <FieldTextInput
                    className={css.lastName}
                    type="text"
                    id="lastName"
                    name="lastName"
                    label={lastNameLabel}
                    placeholder={lastNamePlaceholder}
                    validate={lastNameRequired}
                  /> */}
                  <FieldTextInput
                    className={css.lastName}
                    type="text"
                    id="storeName"
                    name="storeName"
                    label={storeNameLabel}
                    maxLength={STORE_MAX_LENGTH}
                    placeholder={storeNamePlaceholder}
                    validate={storeNameRequired}
                  />
                </div>
              </div>
              {/* <div className={css.sectionContainer}>
                <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourName" />
                </H4>
        
              </div> */}
              <div className={classNames(css.sectionContainer, css.lastSection)}>
                <FieldTextInput
                  type="textarea"
                  id="bio"
                  name="bio"
                  label={bioLabel}
                  maxLength={BIO_MAX_LENGTH}
                  placeholder={bioPlaceholder}
                  className={css.inputField}
                />

                <FieldTextInput
                  className={css.inputField}
                  type="text"
                  id="regNumber"
                  name="regNumber"
                  label={regNumberLabel}
                  placeholder={regNumberPlaceholder}
                  // validate={storeNameRequired}
                />

                <FieldLocationAutocompleteInput
                  rootClassName={css.input}
                  inputClassName={css.locationAutocompleteInput}
                  iconClassName={css.locationAutocompleteInputIcon}
                  predictionsClassName={css.predictionsRoot}
                  validClassName={css.validLocation}
                  autoFocus={autoFocus}
                  name="location"
                  label={intl.formatMessage({ id: 'EditListingDeliveryForm.itemAddress' })}
                  placeholder={intl.formatMessage({
                    id: 'EditListingDeliveryForm.itemAddressPlaceholder',
                  })}
                  useDefaultPredictions={false}
                  format={identity}
                  valueFromForm={values.location}
                  // validate={composeValidators(
                  //   autocompleteSearchRequired(addressRequiredMessage),
                  //   autocompletePlaceSelected(addressNotRecognizedMessage)
                  // )}
                  // Whatever parameters are being used to calculate
                  // the validation function need to be combined in such
                  // a way that, when they change, this key prop
                  // changes, thus reregistering this field (and its
                  // validation function) with Final Form.
                  // See example: https://codesandbox.io/s/changing-field-level-validators-zc8ei
                  key={'locationValidation'}
                />
                {addressError && (
                  <span className={css.error}>
                    <FormattedMessage id="ProfileSettingsForm.errorMessage" />
                  </span>
                )}
              </div>
              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress || addressInProgress}
                disabled={submitDisabled}
                ready={pristineSinceLastSubmit}
              >
                <FormattedMessage id="ProfileSettingsForm.saveChanges" />
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

ProfileSettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ProfileSettingsFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
