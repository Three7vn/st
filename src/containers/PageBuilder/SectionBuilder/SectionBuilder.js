import React, { useState } from 'react';
import { arrayOf, bool, func, node, oneOf, shape, string } from 'prop-types';
import classNames from 'classnames';

// Section components
import SectionArticle from './SectionArticle';
import SectionCarousel from './SectionCarousel';
import SectionColumns from './SectionColumns';
import SectionFeatures from './SectionFeatures';
import SectionHero from './SectionHero';
import Slider from 'react-slick';

// Styles
// Note: these contain
// - shared classes that are passed as defaultClasses
// - dark theme overrides
// TODO: alternatively, we could consider more in-place way of theming components
import css from './SectionBuilder.module.css';
import SectionFooter from './SectionFooter';
import { useDispatch, useSelector } from 'react-redux';
import { getListingsById } from '../../../ducks/marketplaceData.duck';
import { AvatarMedium, Button, ListingCard } from '../../../components';
import { setActiveListing } from '../../SearchPage/SearchPage.duck';
import { FormattedMessage } from 'react-intl';
import { createResourceLocatorString } from '../../../util/routes';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { popularCategories, popularSubCategories } from '../../../util/dataExtractor';
import SortBy from '../../SearchPage/SortBy/SortBy';
import { useConfiguration } from '../../../context/configurationContext';
import {
  searchParamsPicker,
  validFilterParams,
  validUrlQueryParamsFromProps,
} from '../../SearchPage/SearchPage.shared';
import { listingFields } from '../../../config/configListing';
import { isAnyFilterActive, isOriginInUse } from '../../../util/search';
import { CLOTHING, PHONES_ACCESSORIES } from '../../../util/types';

import banner1 from '../../../assets/banner1.png';
import banner2 from '../../../assets/banner2.png';
import { fetchDiscoverListings } from '../../LandingPage/LandingPage.duck';

const FILTER_DROPDOWN_OFFSET = -14;
// These are shared classes.
// Use these to have consistent styles between different section components
// E.g. share the same title styles
const DEFAULT_CLASSES = {
  sectionDetails: css.sectionDetails,
  title: css.title,
  description: css.description,
  ctaButton: css.ctaButton,
  blockContainer: css.blockContainer,
};

/////////////////////////////////////////////
// Mapping of section types and components //
/////////////////////////////////////////////

const defaultSectionComponents = {
  article: { component: SectionArticle },
  carousel: { component: SectionCarousel },
  columns: { component: SectionColumns },
  features: { component: SectionFeatures },
  footer: { component: SectionFooter },
  hero: { component: SectionHero },
};

//////////////////////
// Section builder //
//////////////////////

const SectionBuilder = props => {
  const { sections, options, params } = props;
  const { subCategory } = params || {};

  const [tabName, setTabName] = useState('');
  const [selectedOption, setSelectedOption] = useState('newest');
  const config = useConfiguration();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const routeConfiguration = useRouteConfiguration();
  const state = useSelector(state => state);
  const { currentPageResultIds } = state.SearchPage;
  const {
    landingPageResultIds,
    discoverListingResultIds,
    searchParams,
    userData,
    beforeGoneListingResultIds,
    userProducts,
  } = state.LandingPage;
  const featuredSellers = userData?.filter(e => e?.attributes.profile.publicData.featuredSeller);
  const otherSellers = userData?.filter(e => !e?.attributes.profile.publicData.featuredSeller);
  const trendingListings = getListingsById(state, currentPageResultIds);
  const recentListings = getListingsById(state, landingPageResultIds);
  const discoverListings = getListingsById(state, discoverListingResultIds);
  const beforeGoneListings = getListingsById(state, beforeGoneListingResultIds);
  const isBeforeGoneListings =
    beforeGoneListings?.length > 0 &&
    beforeGoneListings?.filter(e => e?.attributes?.publicData?.beforeItsGone);
  const otherListings =
    beforeGoneListings?.length > 0 &&
    beforeGoneListings?.filter(e => !e?.attributes?.publicData?.beforeItsGone);

  const { sectionComponents = {}, isInsideContainer, ...otherOption } = options || {};

  // If there's no sections, we can't render the correct section component
  if (!sections || sections.length === 0) {
    return null;
  }

  const handleSortOptionChange = event => {
    setSelectedOption(event.target.value);
  };
  // Selection of Section components
  const components = { ...defaultSectionComponents, ...sectionComponents };
  const getComponent = sectionType => {
    const config = components[sectionType];
    return config?.component;
  };

  // Generate unique ids for sections if operator has managed to create duplicates
  // E.g. "foobar", "foobar1", and "foobar2"
  const sectionIds = [];
  const getUniqueSectionId = (sectionId, index) => {
    const candidate = sectionId || `section-${index + 1}`;
    if (sectionIds.includes(candidate)) {
      let sequentialCandidate = `${candidate}1`;
      for (let i = 2; sectionIds.includes(sequentialCandidate); i++) {
        sequentialCandidate = `${candidate}${i}`;
      }
      return getUniqueSectionId(sequentialCandidate, index);
    } else {
      sectionIds.push(candidate);
      return candidate;
    }
  };
  const isMapVariant = false;
  const cardRenderSizes = isMapVariant => {
    if (isMapVariant) {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 767px) 100vw',
        `(max-width: 1023px) ${panelMediumWidth}vw`,
        `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
        `${panelLargeWidth / 3}vw`,
      ].join(', ');
    } else {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 549px) 100vw',
        '(max-width: 767px) 50vw',
        `(max-width: 1439px) 26vw`,
        `(max-width: 1920px) 18vw`,
        `14vw`,
      ].join(', ');
    }
  };
  const listingFieldsConfig = listingFields || [];
  const { defaultFilters: defaultFiltersConfig, sortConfig } = config?.search || {};
  const { searchParamsInURL } = searchParamsPicker(
    location.search,
    searchParams,
    listingFieldsConfig,
    defaultFiltersConfig,
    sortConfig,
    isOriginInUse(config)
  );

  const validQueryParams = validFilterParams(
    searchParamsInURL,
    listingFieldsConfig,
    defaultFiltersConfig,
    false
  );
  // Selected aka active filters
  const selectedFilters = validFilterParams(
    validQueryParams,
    listingFieldsConfig,
    defaultFiltersConfig
  );
  const handleSortBy = (urlParam, values) => {
    const urlQueryParams = validUrlQueryParamsFromProps({ location, config });

    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);
    if (subCategory) {
      history.push(
        createResourceLocatorString(
          'LandingPageListing',
          routeConfiguration,
          { subCategory },
          queryParams
        )
      );
    } else {
      history.push(createResourceLocatorString('LandingPage', routeConfiguration, {}, queryParams));
    }
  };
  const conflictingFilterActive = isAnyFilterActive(
    sortConfig.conflictingFilters,
    validQueryParams,
    listingFieldsConfig,
    defaultFiltersConfig
  );
  const sortBy = mode => {
    return sortConfig.active ? (
      <SortBy
        sort={validQueryParams[sortConfig.queryParamName]}
        isConflictingFilterActive={!!conflictingFilterActive}
        hasConflictingFilters={!!(sortConfig.conflictingFilters?.length > 0)}
        selectedFilters={selectedFilters}
        onSelect={handleSortBy}
        showAsPopup
        mode={mode}
        contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
      />
    ) : null;
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5.4,
    slidesToScroll: 1,
    variableWidth: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1921,
        settings: {
          slidesToShow: 4.58,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1640,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const Discoversettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 3,
  };

  if (selectedOption === 'newest') {
    discoverListings.sort(
      (a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );
  } else if (selectedOption === 'price') {
    discoverListings.sort(
      (a, b) => a.attributes.price?.amount / 100 - b.attributes.price?.amount / 100
    );
  } else if (selectedOption === '-price') {
    discoverListings.sort(
      (a, b) => b.attributes.price?.amount / 100 - a.attributes.price?.amount / 100
    );
  }

  const onTabChange = tabName => {
    setTabName(prevTabName => {
      dispatch(fetchDiscoverListings({ tabName }, config));
      return tabName;
    });
  };

  return (
    <>
      {sections.map((section, index) => {
        const Section = getComponent(section.sectionType);
        // If the default "dark" theme should be applied (when text color is white).
        // By default, this information is stored to customAppearance field
        const isDarkTheme =
          section?.appearance?.fieldType === 'customAppearance' &&
          section?.appearance?.textColor === 'white';
        const classes = classNames({ [css.darkTheme]: isDarkTheme });
        const sectionId = getUniqueSectionId(section.sectionId, index);

        if (Section) {
          return (
            <div>
              <Section
                key={`${sectionId}_i${index}`}
                className={classes}
                defaultClasses={DEFAULT_CLASSES}
                isInsideContainer={isInsideContainer}
                options={otherOption}
                {...section}
                sectionId={sectionId}
              />
              {sectionId == 'home-hero' && (
                <div className={css.sectionTrending}>
                  <div className={css.sectionHeading}>
                    <h2 className={css.sectionTitle}>
                      <FormattedMessage id="LandingPage.trendingHeading" />
                    </h2>
                    <span
                      className={css.seeAllBtn}
                      onClick={() => {
                        history.push(
                          createResourceLocatorString('SearchPage', routeConfiguration, {}, {})
                        );
                      }}
                    >
                      <FormattedMessage id="LandingPage.seeAll" />
                    </span>
                  </div>
                 {(trendingListings?.length > 0 || recentListings?.length > 0) ? <Slider {...settings}>
                    {trendingListings?.length > 0 &&
                      trendingListings?.map(list => {
                        return (
                          <div style={{ width: 304 }}>
                            <ListingCard
                              className={css.listingCard}
                              key={list.id.uuid}
                              listing={list}
                              renderSizes={cardRenderSizes(isMapVariant)}
                              setActiveListing={() => dispatch(setActiveListing(list.id))}
                            />
                          </div>
                        );
                      })}
                    {trendingListings?.length < 5 &&
                      recentListings?.map(list => {
                        return (
                          <div>
                            <ListingCard
                              className={css.listingCard}
                              key={list.id.uuid}
                              listing={list}
                              renderSizes={cardRenderSizes(isMapVariant)}
                              setActiveListing={() => dispatch(setActiveListing(list.id))}
                            />
                          </div>
                        );
                      })}
                  </Slider> : null}
                </div>
              )}

              {sectionId == 'home-hero' && (
                <div className={classNames(css.sectionTrending, css.sectionPopular)}>
                  <div className={css.sectionHeading}>
                    <h2 className={css.sectionTitle}>
                      <FormattedMessage id="LandingPage.popularHeading" />
                    </h2>
                    <span
                      onClick={() => {
                        history.push(
                          createResourceLocatorString('SearchPage', routeConfiguration, {}, {})
                        );
                      }}
                    >
                      <FormattedMessage id="LandingPage.seeAll" />
                    </span>
                  </div>
                  <div className={css.categoriesCards}>
                    <Slider {...settings}>
                      {popularCategories?.map((type, id) => {
                        return (
                          <div key={id} className={css.categoryCard}>
                            <img src={type.icon} className={css.cardImg} />
                            <div className={css.cardInfo}>
                              <p className={css.cardLabel}> {type.label}</p>
                              <button
                                onClick={() => {
                                  history.push(`/s${type.search}`);
                                }}
                                className={css.seeAll}
                              >
                                <FormattedMessage id="LandingPage.seeAll" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </Slider>
                  </div>
                </div>
              )}
              {sectionId == 'home-hero' && (
                <section className={css.SectionBanner}>
                  <img src={banner1} alt="banner1" />
                  <div className={css.bannerInfo}>
                    <div>
                      {' '}
                      <h4>USE CODE: XXXWATCHES</h4>
                      <h2>Banner Headline Here</h2>
                    </div>
                    <Button
                      onClick={() => {
                        history.push('/s');
                      }}
                    >
                      Explore Now
                    </Button>
                  </div>
                </section>
              )}

              {sectionId == 'home-hero' && (
                <div className={css.sectionDiscover}>
                  <h2 className={css.sectionTitle}>
                    <FormattedMessage id="LandingPage.discoverMore" />
                  </h2>

                  <div className={css.filterWrappers}>
                    <div className={css.categoryWrapper}>
                      <div className={css.filterCategory}>
                        {popularSubCategories?.map((type, id) => {
                          return (
                            <div
                              className={
                                (!tabName
                                ? type.key === PHONES_ACCESSORIES
                                : tabName === type.key)
                                  ? css.selected
                                  : css.filters
                              }
                              key={id}
                              onClick={e => {
                                onTabChange(type.key);
                              }}
                            >
                              {type.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={css.selectFields}>
                      <select onChange={event => handleSortOptionChange(event)}>
                        <option value="newest">
                          {selectedOption === 'newest' && 'Sort By : '}New Listing
                        </option>
                        <option value="-price">
                          {selectedOption === '-price' && 'Sort By : '}High To Low{' '}
                        </option>
                        <option value="price">
                          {selectedOption === 'price' && 'Sort By : '}Low To High{' '}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className={css.listingCards}>
                      {discoverListings?.length > 0 &&
                        discoverListings?.slice(0, 8).map(list => {
                          return (
                            <ListingCard
                              key={list.id.uuid}
                              className={css.listingCard}
                              listing={list}
                              renderSizes={cardRenderSizes(isMapVariant)}
                              setActiveListing={() => dispatch(setActiveListing(list.id))}
                            />
                          );
                        })}
                    </div>
                    {discoverListings?.length > 8 && (
                      <span
                        className={css.seeAllBtnCenter}
                        onClick={() => {
                          history.push(
                            `/s?refinementList=${tabName ? tabName : 'phones-accessories'}`
                          );
                        }}
                      >
                        <FormattedMessage id="LandingPage.seeAll" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {sectionId == 'home-hero' && userData?.length > 0 && (
                <div className={css.featuredSellers}>
                  <div className={css.sectionHeading} style={{ padding: 0 }}>
                    <h2 className={css.sectionTitle}>
                      <FormattedMessage id="LandingPage.featuredSellers" />
                    </h2>
                    <span>
                      <FormattedMessage id="LandingPage.seeAll" />
                    </span>
                  </div>
                  <div className={css.featuredSellerList}>
                    {featuredSellers?.length > 0 &&
                      featuredSellers?.slice(0, 6)?.map((list, index) => {
                        const { userName } = list?.attributes?.profile?.publicData || {};
                        const { firstName, displayName } = list?.attributes?.profile || '';
                        const productCount = userProducts?.filter(
                          st => st?.relationships?.author?.data?.id.uuid === list.id.uuid
                        ).length;
                        return (
                          <div className={css.featuredSellerCard}>
                            <div className={css.count}>{index + 1}</div>
                            <AvatarMedium user={list} className={css.avatar} />
                            <p className={css.featuredCardTitle}>
                              <FormattedMessage
                                id="ListingCard.author"
                                values={{ authorName: displayName }}
                              />
                            </p>
                            <div className={css.featuredDetails}>
                              {`@${userName || firstName}`}
                              <br />
                              {`${productCount}`} {productCount < 2 ? 'Product' : 'Products'}
                            </div>
                          </div>
                        );
                      })}
                    {featuredSellers?.length < 6 &&
                      otherSellers?.slice(0, 6 - featuredSellers.length)?.map((list, index) => {
                        const { userName } = list?.attributes?.profile?.publicData || {};
                        const { firstName, displayName } = list?.attributes?.profile || '';
                        const productCount = userProducts?.filter(
                          st => st?.relationships?.author?.data?.id.uuid === list.id.uuid
                        ).length;
                        return (
                          <div className={css.featuredSellerCard}>
                            <div className={css.count}>{featuredSellers?.length + index + 1}</div>
                            <AvatarMedium user={list} />
                            <p className={css.featuredCardTitle}>
                              <FormattedMessage
                                id="ListingCard.author"
                                values={{ authorName: displayName }}
                              />
                            </p>
                            <div className={css.featuredDetails}>
                              {`@${userName || firstName}`}
                              <br />
                              {`${productCount}`} {productCount < 2 ? 'Product' : 'Products'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {sectionId == 'home-hero' && (
                <section className={css.SectionBanner2}>
                  <img src={banner2} alt="banner1" />
                  <div className={css.bannerInfo}>
                    <h4>USE CODE: XXXWATCHES</h4>
                    <h2>Banner Headline Here</h2>
                    <Button
                      onClick={() => {
                        history.push('/s');
                      }}
                    >
                      Shop All Watches
                    </Button>
                  </div>
                </section>
              )}

              {sectionId == 'home-hero' && beforeGoneListings?.length > 0 && (
                <div className={css.sectionTrending} style={{ marginBottom: 34 }}>
                  <div className={css.sectionHeading}>
                    <h2 className={css.sectionTitle}>
                      <FormattedMessage id="LandingPage.beforeGone" />
                    </h2>
                    <span
                      onClick={() => {
                        history.push('/s');
                      }}
                    >
                      <FormattedMessage id="LandingPage.seeAll" />
                    </span>
                  </div>
                  <Slider {...settings}>
                    {isBeforeGoneListings?.length > 0 &&
                      isBeforeGoneListings?.map((list, index) => {
                        return (
                          <div style={{ width: 304 }}>
                            <ListingCard
                              className={css.listingCard}
                              key={list.id.uuid}
                              listing={list}
                              renderSizes={cardRenderSizes(isMapVariant)}
                              setActiveListing={() => dispatch(setActiveListing(list.id))}
                            />
                          </div>
                        );
                      })}

                    {isBeforeGoneListings?.length < 10 &&
                      otherListings?.map((list, index) => {
                        return (
                          <div style={{ width: 326 }}>
                            <ListingCard
                              className={css.listingCard}
                              key={list.id.uuid}
                              listing={list}
                              renderSizes={cardRenderSizes(isMapVariant)}
                              setActiveListing={() => dispatch(setActiveListing(list.id))}
                            />
                          </div>
                        );
                      })}
                  </Slider>
                </div>
              )}
            </div>
          );
        } else {
          // If the section type is unknown, the app can't know what to render
          console.warn(
            `Unknown section type (${section.sectionType}) detected using sectionName (${section.sectionName}).`
          );
          return null;
        }
      })}
    </>
  );
};

const propTypeSection = shape({
  sectionId: string,
  sectionName: string,
  sectionType: oneOf(['article', 'carousel', 'columns', 'features', 'hero']).isRequired,
  // Plus all kind of unknown fields.
  // BlockBuilder doesn't really need to care about those
});

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
  blockComponents: shape({ component: node }),
  sectionComponents: shape({ component: node }),
  // isInsideContainer boolean means that the section is not taking
  // the full viewport width but is run inside some wrapper.
  isInsideContainer: bool,
});

const defaultSections = shape({
  sections: arrayOf(propTypeSection),
  options: propTypeOption,
});

const customSection = shape({
  sectionId: string.isRequired,
  sectionType: string.isRequired,
  // Plus all kind of unknown fields.
  // BlockBuilder doesn't really need to care about those
});
const propTypeOptionForCustomSections = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
  blockComponents: shape({ component: node }),
  sectionComponents: shape({ component: node }).isRequired,
  // isInsideContainer boolean means that the section is not taking
  // the full viewport width but is run inside some wrapper.
  isInsideContainer: bool,
});

const customSections = shape({
  sections: arrayOf(customSection),
  options: propTypeOptionForCustomSections.isRequired,
});

SectionBuilder.defaultProps = {
  sections: [],
  options: null,
};

SectionBuilder.propTypes = oneOf([defaultSections, customSections]).isRequired;

export default SectionBuilder;
