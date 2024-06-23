import React, { useState } from 'react';
import { Menu, RefinementList } from 'react-instantsearch';
import css from './AlgoliaSearchPage.module.css';

const AlgoliaFilterPanel = ({ searchState, Panel }) => {
  const [popup, setPopup] = useState(false);

  const filterPanels = [
    {
      title: 'Category',
      component: 'RefinementList',
      attribute: 'category',
      searchablePlaceholder: 'category',
    },

    {
      title: 'Sub-Category',
      component: 'RefinementList',
      attribute: 'subCategory',
      searchablePlaceholder: 'SubCategory',
    },
    {
      title: 'Type',
      component: 'RefinementList',
      attribute: 'subCategoryChild',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Condition',
      component: 'RefinementList',
      attribute: 'condition',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Color',
      component: 'RefinementList',
      attribute: 'color',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Operating System',
      component: 'RefinementList',
      attribute: 'operatingSystem',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Brand',
      component: 'RefinementList',
      attribute: 'brand',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Dispatch Time',
      component: 'RefinementList',
      attribute: 'dispatchTime',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Recieve Offers',
      component: 'RefinementList',
      attribute: 'receiveOffers',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Return Protection',
      component: 'RefinementList',
      attribute: 'returnProtection',
      searchablePlaceholder: 'SubCategoryChild',
    },
    {
      title: 'Shipping Enable',
      component: 'RefinementList',
      attribute: 'shippingEnabled',
      searchablePlaceholder: 'SubCategoryChild',
    },
  ];

  return (
    <>
      {filterPanels.map((item, index) => (
        <div key={index} className={css.categoryWrapper}>
          <div>
            <button
              className={css.category}
              onClick={() => setPopup(popup == item.title ? '' : item.title)}
            >
              {item.title}
            </button>
          </div>
          {popup == item.title && (
            <div className={css.popupWrapper}>
              <Panel>
                {item.component === 'RefinementList' && (
                  <RefinementList
                    attribute={item.attribute}
                    searchablePlaceholder={item.searchablePlaceholder}
                    showMore={false}
                  />
                )}
                {item.component === 'Menu' && <Menu attribute={item.attribute} showMore={true} />}
              </Panel>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default AlgoliaFilterPanel;
