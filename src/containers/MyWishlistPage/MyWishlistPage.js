import React from 'react';
import { ensureCurrentUser } from '../../util/data';
import { H3, H5, LayoutSingleColumn, ListingCard, Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import { FormattedMessage } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { useDispatch, useSelector } from 'react-redux';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import css from './MyWishlistPage.module.css';

const MyWishlistPage = () => {
  const state = useSelector(state => state);
  const { wishlistListingIds } = state.MyWishlistPage;
  const wishlistListings = getListingsById(state, wishlistListingIds);

  const listingToShow = wishlistListings.filter((item) => (item?.currentStock?.attributes?.quantity != 0))
  
  return (
    <Page className={css.root} title={'wishlist'} scrollingDisabled={isScrollingDisabled(state)}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer currentPage="MyWishlistPage" />
          </>
        }
        footer={<FooterContainer />}
        className={css.layoutMain}
      >
        <div className={css.content}>
          <div className={css.headingContainer}>
            <H3 as="h1" className={css.heading}>
              <FormattedMessage id="MyWishlistPage.heading" />
            </H3>
            <div className={css.listingCards}>
              {listingToShow?.length > 0 
                ? listingToShow?.map(l => (
                    <ListingCard
                      isWhishlist={true}
                      className={css.listingCard}
                      key={l.id.uuid}
                      listing={l}
                      isFavoritesPage={true}
                    />
                  ))
                  
                : <H5><FormattedMessage id="MyWishlistPage.emptyWishlist" /></H5>}
            </div>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};
export default MyWishlistPage;
