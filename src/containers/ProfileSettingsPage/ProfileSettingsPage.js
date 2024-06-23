import React, { useState } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, Page, UserNav, LayoutSideNavigation } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ProfileSettingsForm from './ProfileSettingsForm/ProfileSettingsForm';

import { updateProfile, uploadImage, validateAddress } from './ProfileSettingsPage.duck';
import css from './ProfileSettingsPage.module.css';
import { types as sdkTypes } from '../../util/sdkLoader';

import { fetchRewardPoints, getRewardsPoint, updateRewardHistoryPoints } from '../../util/api';
import { fetchCurrentUser, updateCurrentUserOrUserListing } from '../../ducks/user.duck';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

const { LatLng } = sdkTypes;

export const ProfileSettingsPageComponent = props => {
  const config = useConfiguration();
  const [addressError, setAddressError] = useState(false);
  const [addressInProgress, setAddressInProgress] = useState(false);
  const {
    currentUser,
    image,
    onImageUpload,
    onUpdateProfile,
    scrollingDisabled,
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    isAuthenticated,
    intl,
    onUpdateCurrentUserOrUserListing,
  } = props;

  const createdAt = currentUser?.attributes?.createdAt;

  // Get the Unix timestamp in seconds for the user's creation date
  const userCreatedAt = createdAt ? Math.floor(new Date(createdAt).getTime() / 1000) : null;

  const stripeConnected = currentUser?.attributes?.stripeConnected || {};

  const planName =
    currentUser?.attributes?.profile?.publicData?.freePlanData?.planName ||
    currentUser?.attributes?.profile?.publicData?.currentPlanData?.planName;
  const userId = currentUser?.id?.uuid || '';
  const { email, userName } = currentUser?.attributes?.profile?.publicData || {};

  const accountCreationReward =
    currentUser?.attributes?.profile?.publicData?.accountCreationReward || false;

  const handleSubmit = async values => {
    setAddressInProgress(true);
    const {
      userName,
      firstName,
      lastName,
      storeName,
      location,
      regNumber,
      bio: rawBio,
      city,
      state,
      postalCode,
      address_line_1,
    } = values;

    const { address, origin } = location?.selectedPlace || {};

    // Ensure that the optional bio is a string
    const bio = rawBio || '';

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio,
      publicData: {
        userName: userName,
        storeName: storeName,
        regNumber: regNumber,
        location: { address, origin, city, state, postalCode, address_line_1 },
      },
    };
    const uploadedImage = props?.image;
    // Update profileImage only if file system has been accessed
    const updatedValues =
      uploadedImage && uploadedImage.imageId && uploadedImage.file
        ? { ...profile, profileImageId: uploadedImage.imageId }
        : profile;
    location &&
      validateAddress({ userName, city, state, postalCode, address_line_1 }).then(res => {
        onUpdateProfile({
          ...updatedValues,
        });
        setAddressError(false);
        setAddressInProgress(false);
      });

    if (stripeConnected && isAuthenticated && !accountCreationReward) {
      const spinRes = await fetchRewardPoints({
        rewardId: `${planName.toLowerCase()}-accountcreation-spin`,
      });

      // Fetch reward points for account creation points
      const pointRes = await fetchRewardPoints({
        rewardId: `${planName.toLowerCase()}-accountcreation-points`,
      });
      const rewardSpin = (spinRes?.rewardPoints?.length == 1 && spinRes?.rewardPoints?.[0]) || 0;
      const rewardPoints =
        (pointRes?.rewardPoints?.length == 1 && pointRes?.rewardPoints?.[0]) || 0;

      const action = `${planName.toLowerCase()}-accountcreation-points`;
      if (userCreatedAt) {
        // Get the current Unix timestamp in seconds
        const currentDate = Math.floor(Date.now() / 1000);

        // Check if the user was created within the last day (24 hours)
        if (currentDate - userCreatedAt <= 24 * 60 * 60) {
          getRewardsPoint({
            planName,
            type: 'add',
            userId: userId,
            rewardsPoint: rewardPoints,
            spin: rewardSpin,
            accountCreationReward: true,
          });
        }
      }
      updateRewardHistoryPoints({
        userId: userId,
        points: rewardPoints,
        spin: rewardSpin,
        userName: userName,
        userEmail: email,
        action: action,
      });
      const payload = { publicData: { accountCreationReward: true } };
      onUpdateCurrentUserOrUserListing(payload);
    }
  };

  const user = ensureCurrentUser(currentUser);
  const { firstName, lastName, bio } = user?.attributes.profile;
  // const {  location } = user?.attributes?.profile?.publicData || {};
  const initialValuesProfile = {
    firstName,
    lastName,
    bio,
    ...user?.attributes?.profile?.publicData,
  };
  if (
    user?.attributes?.profile?.publicData &&
    user?.attributes?.profile?.publicData.location &&
    user?.attributes?.profile?.publicData.location.origin &&
    user?.attributes?.profile?.publicData.location.address
  ) {
    const { address, origin } = user?.attributes?.profile?.publicData.location;
    const { lat, lng } = origin;
    const geolocation = new LatLng(lat, lng);
    Object.assign(initialValuesProfile, {
      location: {
        search: address,
        selectedPlace: { address, origin: geolocation },
      },
    });
  }

  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };

  const profileSettingsForm = user.id ? (
    <ProfileSettingsForm
      className={css.form}
      currentUser={currentUser}
      initialValues={initialValuesProfile}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={handleSubmit}
      marketplaceName={config.marketplaceName}
      addressError={addressError}
      addressInProgress={addressInProgress}
      isAuthenticated={isAuthenticated}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="ProfileSettingsPage" />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        currentPage="ProfileSettingsPage"
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage id="ProfileSettingsPage.heading" />
            </H3>
            {/* {user.id ? (
              <NamedLink
                className={css.profileLink}
                name="ProfilePage"
                params={{ id: user.id.uuid }}
              >
                <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
              </NamedLink>
            ) : null} */}
          </div>
          {profileSettingsForm}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

ProfileSettingsPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
  config: null,
};

ProfileSettingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  onImageUpload: func.isRequired,
  onUpdateProfile: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,

  // from useConfiguration()
  config: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { isAuthenticated } = state.auth;
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.ProfileSettingsPage;
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    isAuthenticated,
    uploadImageError,
    uploadInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
  onUpdateCurrentUserOrUserListing: data => dispatch(updateCurrentUserOrUserListing(data)),
});

const ProfileSettingsPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ProfileSettingsPageComponent);

export default ProfileSettingsPage;
