import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  BUSINESS_YEARLY,
  MEMBER_MONTHLY,
  MEMBER_YEARLY,
  USER_TYPE_INDIVIDUAL,
} from '../../../util/types';
import { Button } from '../../../components';
import {
  businessPerks,
  businessPlanDetails,
  memberPerks,
  memberPlanDetails,
} from '../../../util/dataExtractor';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { useDispatch, useSelector } from 'react-redux';
import css from "./StripeSubscriptionCards.module.css";
import classNames from 'classnames';
import { updateProfile } from '../../ProfileSettingsPage/ProfileSettingsPage.duck';

const StripeSubscriptionCards = props => {
  const { subscriptionPlanData, handleModal } = props;
  const { unit_amount, nickname } = subscriptionPlanData || {};
    const state = useSelector(state => state);
  const { currentUser } = state.user;
  const { userType } = (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};

  const dispatch = useDispatch();
  return (
    <div>
      {nickname === MEMBER_YEARLY || nickname === MEMBER_MONTHLY ? (
        <div>
          {nickname === MEMBER_YEARLY ? (
            <h4 className={css.cardFee}><span className={css.largeText}>£{unit_amount / 12 / 100}</span>
            <span className={classNames(css.mediumText,css.yellow)}>/month </span><span className={css.smallText}>(billed annually)</span></h4>
          ) : (
            <>
              <span><span className={css.mediumText}>Or £{unit_amount / 100}/month</span> <span className={css.smallText}>(billed monthly)</span></span>
              <Button
                onClick={() => {
                  handleModal(nickname.split('-')[0]);
                }}
                className={classNames(css.buttonWhiteRound,css.btnYellow)}
              >
                <FormattedMessage id="StripeSubscriptionCards.FreeTry" />
              </Button>
              <div>
                <p className={css.planIncludes}>
                  <FormattedMessage id="StripeSubscriptionCards.planIncludes" />
                </p>
                {memberPlanDetails.map((data, id) => {
                  return (
                    <div key={id} className={css.planInfo}>
                      <IconCollection icon="checkIcon" />
                      <span>{data}</span>
                      <span onClick={() => {}}>
                        {[2, 5].includes(id) && <a href=' '><IconCollection icon="infoIcon" /></a>}
                      </span>
                  
                    </div>
                  );
                })}
              </div>
              <br />
              <div>
                <p className={css.planIncludes}>
                  <FormattedMessage id="StripeSubscriptionCards.additionalPerks" />
                </p>
                {memberPerks.map((data, id) => {
                  return (
                    <div key={id} className={css.planInfo}>
                      <IconCollection icon="checkIcon" />
                      <span>{data}</span>
                      <span onClick={() => {}}>
                        {[2, 3].includes(id) && <a href=' '><IconCollection icon="infoIcon" /></a>}
                      </span>
                     
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {nickname === BUSINESS_YEARLY ? (
            <h4 className={css.cardFee}><span className={css.largeText}>£{unit_amount / 12 / 100}</span><span className={classNames(css.mediumText,css.yellow)}>/month</span> <span className={css.smallText}>(billed annually)</span></h4>
          ) : (
            <>
              <span><span className={css.mediumText}>Or £{unit_amount / 100}/month</span> <span className={css.smallText}>(billed monthly)</span></span>
              <Button
                disabled={userType === USER_TYPE_INDIVIDUAL}
                onClick={() => {
                  handleModal(nickname.split('-')[0]);
                }}
                className={classNames(css.buttonWhiteRound)}
              >
                <FormattedMessage id="StripeSubscriptionCards.FreeTry" />
              </Button>
              <div>
                <p className={css.planIncludes}>
                  <FormattedMessage id="StripeSubscriptionCards.planIncludes" />
                </p>
                {businessPlanDetails.map((data, id) => {
                  return (
                    <div key={id} className={css.planInfo}>
                      <IconCollection icon="checkIcon" />
                      <span>{data}</span>
                     
                    </div>
                  );
                })}
              </div>
              <br />
              <div>
                <p className={css.planIncludes}>
                  <FormattedMessage id="StripeSubscriptionCards.additionalPerks" />
                </p>
                {businessPerks.map((data, id) => {
                  return (
                    <div key={id} className={css.planInfo}>
                      {id === 2 ? (
                        <IconCollection icon="infinityIcon" />
                      ) : (
                        <IconCollection icon="checkIcon" />
                      )}
                      <span>{data}</span>
                      <span onClick={() => {}}>
                        {[0, 1].includes(id) && <IconCollection icon="infoIcon" />}
                      </span>
                     
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StripeSubscriptionCards;
