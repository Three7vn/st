import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, Page, UserNav, LayoutSideNavigation } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { updateProfile, uploadImage } from './DiscountPage.duck';
import DiscountPageForm from './DiscountPageForm/DiscountPageForm';

import css from './DiscountPage.module.css';
import { addOrUpdateDiscounts, fetchDiscount } from '../../util/api';


const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

export const DiscountPageComponent = props => {
  const config = useConfiguration();
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
    intl,
  } = props;
  const [discounts, setDiscounts] = useState([]);
  const user = ensureCurrentUser(currentUser);
  const { privateData } = user.attributes.profile;

  useEffect(() => {
    fetchDiscounts();
  },[])

  const fetchDiscounts = async () => {
    try {
      const res = await fetchDiscount();

      const discounts = res?.result || [];
      setDiscounts(discounts);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const handleSubmit = (values, form) => {
    const { discountCode = "", durationStartDate, durationEndDate, cashOffOrder, percent } = values;
    const discountNewValue = {
      discountCode,
      durationStartDate: moment(durationStartDate.date).unix(),
      durationEndDate: moment(durationEndDate.date).unix(),
      ...(cashOffOrder && {cashOffOrder}),
      ...(percent && {percent})
    };
    const cashOffOrderAlreadyPresent = discounts && discounts.length ? discounts.findIndex((st) => st.cashOffOrder == cashOffOrder) : -1;
    const newDiscounts = cashOffOrderAlreadyPresent >= 0 ? discounts.map((st, index) => cashOffOrderAlreadyPresent == index ? discountNewValue : st) : [discountNewValue, ...discounts];

    addOrUpdateDiscounts({newDiscount: newDiscounts[0]})
      .then((response) => {
        fetchDiscounts();
      })
  };

  const onRemoveDiscount = (index, code) => {
    const newDiscounts = {
      newDiscounts: discounts.filter((st, i) => i != index),
      }
      
    return addOrUpdateDiscounts(newDiscounts, code);
  }

  const formInitilaValues = {};

  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };

  const profileSettingsForm = user.id ? (
    <DiscountPageForm
      className={css.form}
      currentUser={currentUser}
      initialValues={formInitilaValues}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={handleSubmit}
      marketplaceName={config.marketplaceName}
      marketplaceCurrency={config.currency}
      onRemoveDiscount={onRemoveDiscount}
      discounts={discounts}
      fetchDiscounts={fetchDiscounts}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'DiscountPage.title' });

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <UserNav currentPage="DiscountPage" />
          </>
        }
        useAccountSettingsNav
        currentPage="DiscountPage"
        sideNav={null}
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage id="DiscountPage.heading" />
            </H3>
          </div>
          {profileSettingsForm}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

DiscountPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
  config: null,
};

DiscountPageComponent.propTypes = {
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
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.DiscountPage;
  return {
    currentUser,
    image,
    scrollingDisabled: isScrollingDisabled(state),
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: (data, code) => dispatch(updateProfile(data, code)),
});

const DiscountPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(DiscountPageComponent);

export default DiscountPage;
