import React, { useState, useEffect } from 'react';
import { bool, arrayOf, number, shape } from 'prop-types';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { withViewport } from '../../util/uiHelpers';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Heading,
  H2,
  H4,
  Page,
  AvatarLarge,
  NamedLink,
  ListingCard,
  Reviews,
  ButtonTabNavHorizontal,
  LayoutSideNavigation,
  LayoutSingleColumn,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';

import BgLine from '../../assets/bgLine.png';

import css from './ProfilePage.module.css';
import { listingSubCategories } from '../../config/configListing';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import StarRatings from 'react-star-ratings';
import { fetchFollowUser, followStore } from './ProfilePage.duck';
import { getUserDetails } from '../../util/dataExtractor';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

const MAX_MOBILE_SCREEN_WIDTH = 768;
const MAX_LENGTH = 50;

const url = process.env.REACT_APP_MARKETPLACE_ROOT_URL;

export const AsideContent = props => {
  const { user, displayName, isCurrentUser, reviews, listings, currentUser } = props;

  const authorId = user?.id;
  // const reviewsLength = reviews[0]?.reviews?.length;

  const calculateAverage = (reviewsArray, authorId) => {
    const { reviews = [] } = reviewsArray.find(elm => elm?.userId?.id === authorId?.id) || {};
    if (reviews?.length === 0) {
      return 0;
    }
    const sum =
      reviews &&
      reviews?.reduce(
        (accumulator, currentValue) => accumulator + currentValue.attributes.rating,
        0
      );
    const average = sum / reviews?.length;
    return average;
  };

  const reviewsLength = (reviewsArray, authorId) => {
    // Find the user's reviews in the reviewsArray based on authorId
    const userReviews = reviewsArray.find(elm => elm.userId?.id === authorId?.id);

    // If userReviews is not found or it doesn't have a reviews array, return 0
    if (!userReviews || !userReviews.reviews) {
      return 0;
    }
    // Otherwise, return the length of the reviews array
    return userReviews.reviews.length;
  };

  const location = useLocation();
  const dispatch = useDispatch();
  const routeConfiguration = useRouteConfiguration();
  const history = useHistory();

  const [showFullBio, setShowFullBio] = useState(false);
  const { bio } = user?.attributes?.profile || {};
  const truncatedBio = bio?.length > MAX_LENGTH ? bio.slice(0, MAX_LENGTH) + '...' : bio;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isStoreFollowed, setIsStoreFollowed] = useState([]);

  const fetchUserData = async () => {
    try {
      const result = await dispatch(
        fetchFollowUser({ followerUserID: currentUser?.id?.uuid, authorId: user?.id?.uuid })
      );
      setIsStoreFollowed(result);
    } catch (error) {}
  };

  useEffect(() => {
    if (!!currentUser?.id && !!user?.id) {
      fetchUserData();
    }
  }, [!!currentUser?.id && !!user?.id]);

  const handleShareClick = async () => {
    try {
      const shareContent = url + location?.pathname; // Replace with actual content
      await navigator.clipboard.writeText(shareContent);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset copied state after 2 seconds
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Handle error if necessary
    }
  };

  const handleFollower = () => {
    if (!currentUser) {
      const state = { from: `${location.pathname}${location.search}${location.hash}` };
      history.push(createResourceLocatorString('SignupPage', routeConfiguration, {}, {}), state);
    } else {
      const userData = {
        followerUserID: currentUser?.id?.uuid,
        followerFirstName: !!currentUser?.id && getUserDetails(currentUser).firstName,
        followerEmailId: !!currentUser?.id && getUserDetails(currentUser).email,
        authorId: user?.id?.uuid,
      };
      dispatch(followStore(userData)).then(res => {
        fetchUserData();
      });
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleToggleBio = () => {
    setShowFullBio(!showFullBio);
  };
  const { storeName, userName, regNumber } = user?.attributes?.profile?.publicData || {};
  return (
    <div className={css.asideContent}>
      <img src={BgLine} alt="image" />
      <div className={css.asideContents}>
        <AvatarLarge className={css.avatar} user={user} disableProfileLink />
        <div className={css.infoDetails}>
          <h4 className={css.title}>
            Welcome To <b>{storeName || userName}</b>
          </h4>
          {regNumber && <p className={css.businessId}>Business id#{regNumber}</p>}
          <p className={css.businessDetails}>
            {showFullBio ? bio : truncatedBio}
            {bio?.length > MAX_LENGTH && (
              <b onClick={handleToggleBio}>{showFullBio ? 'READ LESS' : 'READ MORE'}</b>
            )}
          </p>
        </div>
        <div>
          <div className={css.shareButtons}>
            <button
              className={css.followButton}
              onClick={() => {
                handleFollower();
              }}
            >
              {isStoreFollowed.length > 0 ? 'Followed' : 'Follow'}
            </button>
            {/* Share button */}
            <button className={css.shareButton} onClick={() => setIsModalOpen(true)}>
              Share
            </button>

            {/* Modal */}
            {isModalOpen && (
              <div className={css.modalOverlay}>
                <div className={css.modal}>
                  <div className={css.modalContent}>
                    <AvatarLarge className={css.avatarModal} user={user} disableProfileLink />
                    <div className={css.shareContent}>
                      <p className={css.modalTitle}>StoreName</p>
                      <span className={css.close} onClick={closeModal}>
                        &times;
                      </span>
                      {isCopied ? (
                        <p className={css.linkCopied}>Link copied!</p>
                      ) : (
                        <div className={css.socialLinks}>
                          <button className={css.linkIconButton} onClick={handleShareClick}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="30"
                              height="30"
                              viewBox="0 0 30 30"
                              fill="none"
                            >
                              <path
                                d="M10.0381 14.0385C11.6339 12.4492 14.417 12.4492 16.0127 14.0385L17.0085 15.0303L19 13.0468L18.0042 12.055C16.6761 10.7308 14.9071 10 13.0254 10C11.1438 10 9.37476 10.7308 8.0466 12.055L5.0579 15.0303C3.74002 16.3471 3 18.1305 3 19.9897C3 21.849 3.74002 23.6324 5.0579 24.9492C5.71124 25.6008 6.48742 26.1174 7.34185 26.4694C8.19627 26.8213 9.1121 27.0016 10.0367 27C10.9616 27.0019 11.8777 26.8217 12.7324 26.4697C13.5871 26.1178 14.3635 25.601 15.0169 24.9492L16.0127 23.9574L14.0212 21.9739L13.0254 22.9657C12.2317 23.7526 11.1574 24.1944 10.0374 24.1944C8.91748 24.1944 7.84312 23.7526 7.04943 22.9657C6.2586 22.1755 5.81452 21.1054 5.81452 19.9897C5.81452 18.8741 6.2586 17.8039 7.04943 17.0138L10.0381 14.0385Z"
                                fill="white"
                              ></path>
                              <path
                                d="M14.9831 5.05077L13.9873 6.04252L15.9788 8.02603L16.9746 7.03427C17.7683 6.24731 18.8426 5.8055 19.9626 5.8055C21.0825 5.8055 22.1569 6.24731 22.9506 7.03427C23.7414 7.82441 24.1855 8.89457 24.1855 10.0102C24.1855 11.1259 23.7414 12.1961 22.9506 12.9862L19.9619 15.9614C18.3661 17.5508 15.583 17.5508 13.9873 15.9614L12.9915 14.9697L11 16.9532L11.9958 17.945C13.3239 19.2692 15.0929 20 16.9746 20C18.8562 20 20.6252 19.2692 21.9534 17.945L24.9421 14.9697C26.26 13.6529 27 11.8695 27 10.0102C27 8.15099 26.26 6.36756 24.9421 5.05077C23.6203 3.73751 21.8296 3 19.9626 3C18.0956 3 16.3048 3.73751 14.9831 5.05077Z"
                                fill="white"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* <button className={css.MessageButton}>Message</button> */}
          </div>
          <div className={css.reviewRattingContainer}>
            {/* <div className={css.authorName}>{userName}</div> */}
            <div className={css.ratings}>
              <StarRatings
                svgIconViewBox="0 0 40 37"
                svgIconPath="M20 0L26.113 11.5862L39.0211 13.8197L29.891 23.2138L31.7557 36.1803L20 30.4L8.2443 36.1803L10.109 23.2138L0.97887 13.8197L13.887 11.5862L20 0Z"
                starRatedColor="#ffb802"
                rating={reviews.length ? calculateAverage(reviews, authorId) : 0}
                starDimension="16px"
                starSpacing="2px"
              />
              &nbsp;
              <u>
                {' '}
                <FormattedMessage
                  id={listings.length > 1 ? 'OrderPanel.reviews' : 'OrderPanel.oneReview'}
                  values={{
                    reviews: reviews?.length ? reviewsLength(reviews, authorId) : 0,
                    listing: listings.length,
                  }}
                />
              </u>
            </div>
          </div>
        </div>
      </div>
      {/* <H2 as="h1" className={css.mobileHeading}>
        {displayName ? (
          <FormattedMessage id="ProfilePage.mobileHeading" values={{ name: displayName }} />
        ) : null}
      </H2> */}
      {/* {isCurrentUser ? (
        <>
          <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
            <FormattedMessage id="ProfilePage.editProfileLinkMobile" />
          </NamedLink>
          <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
            <FormattedMessage id="ProfilePage.editProfileLinkDesktop" />
          </NamedLink>
        </>
      ) : null} */}
    </div>
  );
};

export const ReviewsErrorMaybe = props => {
  const { queryReviewsError } = props;
  return queryReviewsError ? (
    <p className={css.error}>
      <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
    </p>
  ) : null;
};

export const MobileReviews = props => {
  const { reviews, queryReviewsError } = props;
  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  return (
    <div className={css.mobileReviews}>
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsFromMyCustomersTitle"
          values={{ count: reviewsOfProvider.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <Reviews reviews={reviewsOfProvider} />
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsAsACustomerTitle"
          values={{ count: reviewsOfCustomer.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <Reviews reviews={reviewsOfCustomer} />
    </div>
  );
};

export const DesktopReviews = props => {
  const [showReviewsType, setShowReviewsType] = useState(REVIEW_TYPE_OF_PROVIDER);
  const { reviews, queryReviewsError } = props;
  const reviewsOfProvider =
    reviews[0]?.reviews?.filter(r => r?.attributes?.type === REVIEW_TYPE_OF_PROVIDER) || [];
  const reviewsOfCustomer =
    reviews[0]?.reviews?.filter(r => r?.attributes?.type === REVIEW_TYPE_OF_CUSTOMER) || [];
  const isReviewTypeProviderSelected = showReviewsType === REVIEW_TYPE_OF_PROVIDER;
  const isReviewTypeCustomerSelected = showReviewsType === REVIEW_TYPE_OF_CUSTOMER;
  const desktopReviewTabs = [
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsFromMyCustomersTitle"
            values={{ count: reviewsOfProvider.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeProviderSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_PROVIDER),
    },
    {
      text: (
        <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsAsACustomerTitle"
            values={{ count: reviewsOfCustomer.length }}
          />
        </Heading>
      ),
      selected: isReviewTypeCustomerSelected,
      onClick: () => setShowReviewsType(REVIEW_TYPE_OF_CUSTOMER),
    },
  ];

  return (
    <div className={css.desktopReviews}>
      <div className={css.desktopReviewsWrapper}>
        <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={desktopReviewTabs} />

        <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />

        {isReviewTypeProviderSelected ? (
          <Reviews reviews={reviewsOfProvider} />
        ) : (
          <Reviews reviews={reviewsOfCustomer} />
        )}
      </div>
    </div>
  );
};

export const MainContent = props => {
  const {
    userShowError,
    bio,
    displayName,
    listings,
    queryListingsError,
    reviews,
    queryReviewsError,
    viewport,
    userName,
  } = props;

  const hasListings = listings.length > 0;
  const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
  const hasBio = !!bio;

  const listingsContainerClasses = classNames(css.listingsContainer, {
    [css.withBioMissingAbove]: !hasBio,
  });

  if (userShowError || queryListingsError) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingDataFailed" />
      </p>
    );
  }
  return (
    <div>
      <H2 as="h1" className={css.desktopHeading}>
        <FormattedMessage
          id="ProfilePage.desktopHeading"
          values={{ name: userName || displayName }}
        />
      </H2>
      {hasBio ? <p className={css.bio}>{bio}</p> : null}
      {hasListings ? (
        <div className={listingsContainerClasses}>
          <H4 as="h2" className={css.listingsTitle}>
            <FormattedMessage id="ProfilePage.listingsTitle" values={{ count: listings.length }} />
          </H4>
          <ul className={css.listings}>
            {listings.map(l => (
              <li className={css.listing} key={l.id.uuid}>
                <ListingCard listing={l} showAuthorInfo={false} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {isMobileLayout ? (
        <MobileReviews reviews={reviews} queryReviewsError={queryReviewsError} />
      ) : (
        <DesktopReviews reviews={reviews} queryReviewsError={queryReviewsError} />
      )}
    </div>
  );
};

const ProfilePageComponent = props => {
  const config = useConfiguration();
  const {
    scrollingDisabled,
    currentUser,
    userShowError,
    user,
    reviews,
    listings,
    intl,
    ...rest
  } = props;
  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const profileUser = ensureUser(user);
  const isCurrentUser =
    ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;

  const { bio, displayName, publicData } = profileUser?.attributes?.profile || {};
  const { userName } = publicData || {};
  const schemaTitleVars = { name: displayName, marketplaceName: config.marketplaceName };
  const schemaTitle = intl.formatMessage({ id: 'ProfilePage.schemaTitle' }, schemaTitleVars);

  if (userShowError && userShowError.status === 404) {
    return <NotFoundPage />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
  };

  const handleSubCategoryChange = event => {
    setSelectedSubCategory(event.target.value);
  };

  const handleSortOptionChange = event => {
    setSelectedSortOption(event.target.value);
  };

  const handleAllButtonClick = () => {
    setSelectedSubCategory('');
  };

  // Combine search query and sub-category filter
  const filteredListings = listings.filter(listing => {
    // Check if the listing title matches the search query
    const matchesSearchQuery = listing.attributes.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Check if the listing belongs to the selected sub-category
    const subCategory = listing?.attributes?.publicData?.subCategory || null;
    const matchesSubCategory = !selectedSubCategory || subCategory === selectedSubCategory;
    // Return true if the listing meets both conditions
    return matchesSearchQuery && matchesSubCategory;
  });

  const [selectedSortOption, setSelectedSortOption] = useState('newest');

  // Sorting logic based on the selected option
  const sortedListings = [...filteredListings]; // Create a copy of the listings array

  if (selectedSortOption === 'newest') {
    sortedListings.sort(
      (a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );
  } else if (selectedSortOption === 'price') {
    sortedListings.sort(
      (a, b) => (a.attributes.price?.amount || 0) - (b.attributes.price?.amount || 0)
    );
  }
  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      title={schemaTitle}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ProfilePage',
        name: schemaTitle,
      }}
    >
      {/* <LayoutSideNavigation
        sideNavClassName={css.aside}
        topbar={<TopbarContainer />}
        sideNav={
          <AsideContent user={user} isCurrentUser={isCurrentUser} displayName={displayName} />
        }
        footer={<FooterContainer />}
      >
        <MainContent bio={bio} displayName={displayName} userName={userName} userShowError={userShowError} {...rest} />
      </LayoutSideNavigation> */}
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            {/* <UserNav currentPage="ManageListingsPage" /> */}
          </>
        }
        footer={<FooterContainer />}
        className={css.layoutSingleColumn}
      >
        <div className={css.mainContentWrapper}>
          <AsideContent
            user={user}
            isCurrentUser={isCurrentUser}
            displayName={displayName}
            reviews={reviews}
            listings={listings}
            currentUser={currentUser}
          />
          {/* <MainContent bio={bio} displayName={displayName} userName={userName} userShowError={userShowError} {...rest} /> */}
        </div>
        <div className={css.Container}>
          <div>
            <div className={css.filters}>
              <div className={css.selectFields}>
                <button onClick={handleAllButtonClick} className={css.allCategory}>
                  All
                </button>
                {/* Render dropdown for sub-categories */}
                <select value={selectedSubCategory} onChange={handleSubCategoryChange}>
                  <option value="">All Sub-Categories</option>
                  {listingSubCategories.map((subCategory, index) => (
                    <option key={index} value={subCategory.option}>
                      {subCategory.label}
                    </option>
                  ))}
                </select>
                <select value={selectedSortOption} onChange={handleSortOptionChange}>
                  <option value="newest">Newest to Oldest</option>
                  <option value="price">Price (High to Low)</option>
                </select>
              </div>
              <div className={css.searchWrapper}>
                <input
                  className={css.search}
                  placeholder="Search by title"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <div>
            <ul className={css.listings}>
              {sortedListings.map(l => (
                <li className={css.listing} key={l.id.uuid}>
                  <ListingCard isProfile={true} listing={l} showAuthorInfo={false} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  queryListingsError: null,
  reviews: [],
  queryReviewsError: null,
};

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  queryListingsError: propTypes.error,
  listings: arrayOf(propTypes.listing).isRequired,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    userId,
    userShowError,
    queryListingsError,
    userListingRefs,
    reviews,
    queryReviewsError,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;
  const listings = getMarketplaceEntities(state, userListingRefs);
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    queryListingsError,
    listings,
    reviews,
    queryReviewsError,
  };
};

const ProfilePage = compose(
  connect(mapStateToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

export default ProfilePage;
