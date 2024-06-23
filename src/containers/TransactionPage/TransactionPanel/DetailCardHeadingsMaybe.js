import React from 'react';
import { H4 } from '../../../components';

import css from './TransactionPanel.module.css';
import { formatMoney } from '../../../util/currency';
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;


// Functional component as a helper to build detail card headings
const DetailCardHeadingsMaybe = props => {
  const { showDetailCardHeadings, listingTitle, subTitle, showPrice, price, intl, cartItems, condition } = props;

  return showDetailCardHeadings && cartItems?.length ? (
    <div className={css.detailCardHeadings}>
      {cartItems?.map(data => {
        const money = new Money(data?.price*100, "GBP")
        const formattedMoney = formatMoney(intl, money)
    
        return(
          <div key={data.id} className={css.itemRow}> {/* Assuming each item in cartItems has a unique identifier */}
            <H4 as="h2" className={css.detailCardTitle}>
              {data?.title}
            </H4>
            <span>{formattedMoney}</span>
            {subTitle ? <p className={css.detailCardSubtitle}>{subTitle}</p> : null}
            
          </div>
        )
      })}
    </div>
  ) : null;
}
export default DetailCardHeadingsMaybe;
