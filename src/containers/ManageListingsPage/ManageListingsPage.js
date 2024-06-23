import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { SUBSCRIPTION_MEMBER_PLAN, propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  PaginationLinks,
  UserNav,
  LayoutSingleColumn,
  NamedLink,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  InlineTextButton,
  OutsideClickHandler,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ManageListingCard from './ManageListingCard/ManageListingCard';

import {
  closeListing,
  openListing,
  getOwnListingsById,
  updateListing,
} from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';
import classNames from 'classnames';
import MenuIcon from './ManageListingCard/MenuIcon';
import { listingSubCategories } from '../../config/configListing';
import Checkbox from 'rc-checkbox';
import { types as sdkTypes } from '../../util/sdkLoader';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { fetchListings } from '../LandingPage/LandingPage.duck';
import IconCollection from '../../components/IconCollection/IconCollection';

const MENU_CONTENT_OFFSET = -12;
const { UUID } = sdkTypes;

export class ManageListingsPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listingMenuOpen: null,
      isSecondMenuOpen: false,
      LayoutType: 'grid',
      searchQuery: '',
      selectedSubCategory: '', // Initially no sub-category selected
      isCheckedListings: [],
      selectedOption: 'newest', // Default selected option
    };
    this.onToggleMenu = this.onToggleMenu.bind(this);
    this.onToggleLayout = this.onToggleLayout.bind(this);
    this.handleSecondMenuToggle = this.handleSecondMenuToggle.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSortOptionChange = this.handleSortOptionChange.bind(this);
  }

  handleSortOptionChange(event) {
    this.setState({ selectedOption: event.target.value });
  }
  handleCheckboxChange(listingId) {
    const { isCheckedListings } = this.state;
    // Check if the listingId is already in isCheckedListings
    const isChecked = isCheckedListings.includes(listingId);

    // If the listingId is checked and the checkbox is unchecked, remove it
    if (isChecked) {
      this.setState(prevState => ({
        isCheckedListings: prevState.isCheckedListings.filter(id => id !== listingId),
      }));
    } else {
      // If the listingId is unchecked and the checkbox is checked, add it
      this.setState(prevState => ({
        isCheckedListings: [...prevState.isCheckedListings, listingId],
      }));
    }
  }
  onToggleMenu(listing) {
    this.setState({ onToggleMenu: listing });
  }

  handleSecondMenuToggle(listing) {
    this.setState({ isSecondMenuOpen: listing !== null });
  }

  // Define a method to handle search input change
  handleSearchChange = event => {
    this.setState({ searchQuery: event.target.value });
  };

  // // Define a method to handle sub-category selection
  // handleSubCategoryChange = event => {
  //   this.setState({ selectedSubCategory: event.target.value });
  // };
  onToggleLayout(listing) {
    this.setState({ LayoutType: listing });
  }

  // Define the method to handle sub-category change// Define the method to handle sub-category change
  // Define the method to handle sub-category change
  handleSubCategoryChange = event => {
    const selectedSubCategory = event.target.value;
    // Check if "All" is selected, if so, reset selectedSubCategory to an empty string
    const updatedSubCategory = selectedSubCategory === 'All' ? '' : selectedSubCategory;
    // Update the state
    this.setState({ selectedSubCategory: updatedSubCategory });
  };

  // Define a method to handle the "All" button click
  handleAllButtonClick = () => {
    // Reset selectedSubCategory to an empty string
    this.setState({ selectedSubCategory: '' });
  };

  onToggleMenu(listing) {
    this.setState({ listingMenuOpen: listing });
  }
  render() {
    const {
      closingListing,
      closingListingError,
      listings,
      onCloseListing,
      onOpenListing,
      openingListing,
      openingListingError,
      pagination,
      queryInProgress,
      queryListingsError,
      queryParams,
      scrollingDisabled,
      intl,
      onUpdateListing,
      children,
      currentUser,
    } = this.props;

    const { isSecondMenuOpen } = this.state;
    const { isCheckedListings } = this.state;

    const { live, draft, unAvailable } = listings.reduce(
      (acc, elm) => {
        const state = elm.attributes.state;
        if (state === 'published') acc.live.push(elm);
        else if (state === 'draft') acc.draft.push(elm);
        else if (state === 'closed') acc.unAvailable.push(elm);
        return acc;
      },
      { live: [], draft: [], unAvailable: [] }
    );

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

    const { listingsSoldPrice, listingsSoldCount, currentPlanData, freePlanData } =
      (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};

    const loadingResults = (
      <div className={css.messagePanel}>
        <H3 as="h2" className={css.heading}>
          <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
        </H3>
      </div>
    );

    const queryError = (
      <div className={css.messagePanel}>
        <H3 as="h2" className={css.heading}>
          <FormattedMessage id="ManageListingsPage.queryError" />
        </H3>
      </div>
    );

    const noResults =
      listingsAreLoaded && pagination.totalItems === 0 ? (
        <div className={css.noResultsContainer}>
          <H3 as="h1" className={css.headingNoListings}>
            <FormattedMessage id="ManageListingsPage.noResults" />
          </H3>
          <p className={css.createListingParagraph}>
            <NamedLink className={css.createListingLink} name="NewListingPage">
              <FormattedMessage id="ManageListingsPage.createListing" />
            </NamedLink>
          </p>
        </div>
      ) : null;

    const heading =
      listingsAreLoaded && pagination.totalItems > 0 ? (
        <div className={css.heading}>
          <H3 as="h1">
            <FormattedMessage
              id="ManageListingsPage.manageOwnListing"
              // values={{ count: pagination.totalItems }}
            />
          </H3>
          <div className={css.layoutTypeWrapper}>
            <span>
              {live?.length} Live | {draft?.length} Drafts | {unAvailable?.length} Unavailable
            </span>
            <div className={css.layoutType}>
              <div
                className={classNames(
                  this.state.LayoutType == 'table' ? css.activeLayout : css.notActive
                )}
                onClick={() => this.onToggleLayout('table')}
              >
                <IconCollection icon="tableViewIcon" />
              </div>
              <div
                className={classNames(
                  css.lasItem,
                  this.state.LayoutType == 'grid' ? css.activeLayout : css.notActive
                )}
                onClick={() => this.onToggleLayout('grid')}
              >
                <span>
                  <IconCollection icon="gridViewIcon" />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        noResults
      );

    const page = queryParams ? queryParams.page : 1;
    const paginationLinks =
      listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
        <PaginationLinks
          className={css.pagination}
          pageName="ManageListingsPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError?.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError?.listingId;

    const title = intl.formatMessage({ id: 'ManageListingsPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');

    // Combine search query and sub-category filter
    const filteredListings = listings.filter(listing => {
      // Check if the listing title matches the search query
      const matchesSearchQuery = listing.attributes.title
        .toLowerCase()
        .includes(this.state.searchQuery.toLowerCase());
      // Check if the listing belongs to the selected sub-category
      const subCategory = listing?.attributes?.publicData?.subCategory || null;
      const matchesSubCategory =
        !this.state.selectedSubCategory || subCategory === this.state.selectedSubCategory;
      // Return true if the listing meets both conditions
      return matchesSearchQuery && matchesSubCategory;
    });

    const menuItemClasses = classNames(css.menuItem, {
      [css.menuItemDisabled]: !!(openingListing || closingListing),
    });

    // Sorting logic based on the selected option
    const sortedListings = [...filteredListings]; // Create a copy of the listings array

    const selectedOption = this.state.selectedOption; // Assuming you have a state variable for the selected sorting option

    if (selectedOption === 'newest') {
      sortedListings.sort(
        (a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
      );
    } else if (selectedOption === 'price') {
      sortedListings.sort(
        (a, b) => b.attributes.price?.amount / 100 - a.attributes.price?.amount / 100
      );
    }

    const newToOld = <FormattedMessage id="ManageListingCard.newToOld" />;
    const highToLow = <FormattedMessage id="ManageListingCard.highToLow" />;

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn
          topbar={
            <>
              <TopbarContainer />
              <UserNav currentPage="ManageListingsPage" />
            </>
          }
          footer={<FooterContainer />}
          mainColumnClassName={css.layoutSingleColumn}
        >
          {queryInProgress ? loadingResults : null}
          {queryListingsError ? queryError : null}
          <div className={css.listingPanel}>
          <h4 className={css.earnings}>  <b>
              <FormattedMessage id="ManageListingsPage.monthlyEarningText" />
            </b>
            <span>
              £{listingsSoldPrice ? parseFloat(listingsSoldPrice).toFixed(2) : 0} / £
              {freePlanData
                ? 500
                : currentPlanData?.planName === SUBSCRIPTION_MEMBER_PLAN
                ? '25,000'
                : 'No'}{' '}
              limit
            </span></h4>
            {heading}
            <div>
              <div className={css.filters}>
                <div className={css.selectFields}>
                  <button onClick={this.handleAllButtonClick} className={css.filter}>
                    All
                  </button>
                  {/* Render dropdown for sub-categories */}
                  <select onChange={this.handleSubCategoryChange}>
                    <option value="">All Sub-Categories</option>
                    {listingSubCategories.map((subCategory, index) => (
                      <option key={index} value={subCategory.option}>
                        {subCategory.label}
                      </option>
                    ))}
                  </select>
                  <select onChange={this.handleSortOptionChange}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="price">Price (High to Low)</option>
                  </select>
                </div>

                <div className={css.searchWrapper}>
                  <input
                    className={css.search}
                    placeholder="Search by title"
                    type="text"
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                  />
                </div>
              </div>
            </div>

            {this.state.LayoutType == 'grid' ? (
              <div className={css.listingCards}>
                {sortedListings.map(l => (
                  <ManageListingCard
                    className={css.listingCard}
                    key={l?.id?.uuid}
                    listing={l}
                    isMenuOpen={!!listingMenuOpen && listingMenuOpen?.id?.uuid === l?.id?.uuid}
                    actionsInProgressListingId={openingListing || closingListing}
                    onToggleMenu={this.onToggleMenu}
                    onCloseListing={onCloseListing}
                    onOpenListing={onOpenListing}
                    hasOpeningError={openingErrorListingId?.uuid === l?.id?.uuid}
                    hasClosingError={closingErrorListingId?.uuid === l?.id?.uuid}
                    renderSizes={renderSizes}
                    onUpdateListing={onUpdateListing}
                  />
                ))}
              </div>
            ) : listings && listings.length ? (
              <div className={css.listingCardsTableWrapper}>
                <div className={css.listingCardsTable}>
                  <table>
                    <thead>
                      <tr>
                        <td style={{ textAlign: 'left' }}>
                          <FormattedMessage id="ManageListingCard.itemName" />
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <FormattedMessage id="ManageListingCard.price" />
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <FormattedMessage id="ManageListingCard.qty" />
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <FormattedMessage id="ManageListingCard.subCategory" />
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <FormattedMessage id="ManageListingCard.status" />
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <OutsideClickHandler
                            className={css.outSideClick}
                            onOutsideClick={() => this.handleSecondMenuToggle(null)}
                          >
                            <Menu
                              contentPlacementOffset={MENU_CONTENT_OFFSET}
                              contentPosition="left"
                              useArrow={false}
                              onToggleActive={isOpen => {
                                this.handleSecondMenuToggle(isOpen);
                              }}
                              isOpen={isSecondMenuOpen}
                              className={css.menu}
                            >
                              <MenuLabel
                                className={css.menuLabel}
                                isOpenClassName={css.listingMenuIsOpen}
                              >
                                <div className={css.iconWrapper}>
                                  <MenuIcon
                                    className={css.menuIcon}
                                    isActive={isSecondMenuOpen}
                                    tableMenuIcon={true}
                                  />
                                </div>
                              </MenuLabel>
                              <MenuContent rootClassName={css.menuContent}>
                                <MenuItem key="open-listing">
                                  <InlineTextButton
                                    // rootClassName={menuItemClasses}
                                    onClick={event => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      if (!openingListing || closingListing) {
                                        isCheckedListings.forEach(itm =>
                                          onOpenListing(new UUID(itm))
                                        );
                                        this.handleSecondMenuToggle(false);
                                      }
                                    }}
                                  >
                                    <FormattedMessage id="ManageListingCard.openListing" />
                                  </InlineTextButton>
                                </MenuItem>
                                <MenuItem key="close-listing">
                                  <InlineTextButton
                                    // rootClassName={menuItemClasses}
                                    onClick={event => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      if (!closingListing || openingListing) {
                                        isCheckedListings.forEach(itm =>
                                          onCloseListing(new UUID(itm))
                                        );
                                        this.handleSecondMenuToggle(false);
                                      }
                                    }}
                                  >
                                    <FormattedMessage id="ManageListingCard.closeListing" />
                                  </InlineTextButton>
                                </MenuItem>
                                <MenuItem key="delete-listing">
                                  <InlineTextButton
                                    // rootClassName={menuItemClasses}
                                    onClick={event => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      isCheckedListings.forEach(itm => {
                                        onUpdateListing(new UUID(itm), {
                                          publicData: { isDeleted: true },
                                        });
                                      });
                                      isCheckedListings.forEach(itm =>
                                        onCloseListing(new UUID(itm))
                                      );
                                      this.handleSecondMenuToggle(false);
                                      fetchListings(); // Assuming fetchListings is a function to update listings
                                    }}
                                  >
                                    <FormattedMessage id="ManageListingCard.deleteListing" />
                                  </InlineTextButton>
                                </MenuItem>
                              </MenuContent>
                            </Menu>
                          </OutsideClickHandler>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedListings.map(l => (
                        <ManageListingCard
                          className={css.listingCard}
                          key={l?.id?.uuid}
                          listing={l}
                          isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                          actionsInProgressListingId={openingListing || closingListing}
                          onToggleMenu={this.onToggleMenu}
                          handleSecondMenuToggle={this.handleSecondMenuToggle}
                          isSecondMenuOpen={isSecondMenuOpen}
                          onCloseListing={onCloseListing}
                          onOpenListing={onOpenListing}
                          hasOpeningError={openingErrorListingId?.uuid === l?.id?.uuid}
                          hasClosingError={closingErrorListingId?.uuid === l?.id?.uuid}
                          renderSizes={renderSizes}
                          tableView={true}
                          handleCheckboxChange={this.handleCheckboxChange}
                          onUpdateListing={onUpdateListing}
                          isCheckedListings={isCheckedListings}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            {paginationLinks}
          </div>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

ManageListingsPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

const { arrayOf, bool, func, object, shape, string } = PropTypes;

ManageListingsPageComponent.propTypes = {
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.ownListing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.ManageListingsPage;
  const { currentUser } = state.user;
  const listings = getListingsById(state, currentPageResultIds);
  return {
    currentUser,
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
  onUpdateListing: (listingId, payload) => dispatch(updateListing(listingId, payload)),
});

const ManageListingsPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ManageListingsPageComponent);

export default ManageListingsPage;
