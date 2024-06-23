import React, { useState } from 'react';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { useDispatch, useSelector } from 'react-redux';
import css from './StripeSubscriptionPage.module.css';
import { withRouter } from 'react-router-dom';
import { withViewport } from '../../util/uiHelpers';
import { compose } from 'redux';
import { checkScrollingDisabled, createSubscription } from './StripeSubscriptionPage.duck';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import { Button, LayoutSingleColumn, Modal, Page } from '../../components';
import StripeSubscriptionCards from './StripeSubscriptionCards/StripeSubscriptionCards';
import {
  BUSINESS_MONTHLY,
  BUSINESS_YEARLY,
  FREE_PLAN,
  MEMBER_MONTHLY,
  MEMBER_YEARLY,
  USER_TYPE_BUSINESS,
} from '../../util/types';
import { additionalPlanDetails, freePlanDetails, getUserDetails } from '../../util/dataExtractor';
import IconCollection from '../../components/IconCollection/IconCollection';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { createResourceLocatorString } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { sendVerificationEmail } from '../../ducks/user.duck';

export const StripeSubscriptionPage = props => {
  const { intl, location, history, viewport } = props;
  const [infoDetails, setInfoDetails] = useState(-1);
  const [inProgress, setInProgress] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState('');
  const [dataId, setDataId] = useState(null);
  const dispatch = useDispatch();
  const routes = useRouteConfiguration();
  const state = useSelector(state => state);
  const isScrollingDisabled = useSelector(state => checkScrollingDisabled(state));
  const { subscriptionPlan } = state.StripeSubscriptionPage;
  const { currentUser } = state.user;
  const emailVerified = (!!currentUser?.id && currentUser.attributes.emailVerified) || '';
  const { userType } = (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};
  const { updateInProgress } = state.ProfileSettingsPage;
  const filteredPlans = subscriptionPlan?.filter(e => !e?.product?.metadata?.isArchive);
  const handleModal = name => {
    setIsModalOpen(name);
  };

  const handlePlans = data => {
    setDataId(data);
  };

  // HandleSubscription
  const handleSubscription = async () => {
    setInProgress(true);
    const params = {
      userName: !!currentUser?.id && getUserDetails(currentUser).fullName,
      userEmail: !!currentUser?.id && getUserDetails(currentUser).email,
      priceID: dataId?.id,
    };
    const result = await dispatch(createSubscription(params));
    if (result) {
      setInProgress(false);
      window.open(result);
    }
  };

  const infoModal = (
    <Modal
      id="StripeSubscriptionPage.payoutModal"
      isOpen={!!(infoDetails > -1)}
      onClose={() => setInfoDetails(-1)}
      onManageDisableScrolling={() => {}}
      usePortal
    >
      <div>{infoDetails}</div>
    </Modal>
  );

  const planModal = (
    <Modal
      id="StripeSubscriptionPage.payoutModal"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen('')}
      onManageDisableScrolling={() => {}}
      usePortal
    >
      <div>
        <h3>
          <FormattedMessage id="StripeSubscriptionPage.modalHeading" />
        </h3>
        <div>
          {filteredPlans
            ?.filter(e => e.nickname?.split('-')[0] === isModalOpen)
            .map((data, index) => {
              const { recurring } = data || {};
              return (
                <div
                  key={index}
                  onClick={() => {
                    handlePlans(data);
                  }}
                  className={css.selectBox}
                >
                  <span className={css.selectBorder}>
                    {data.id === dataId?.id && <IconCollection icon="checkIcon" />}
                  </span>
                  {data.nickname} - £{data.unit_amount / 100}{' '}
                  {recurring?.interval === 'month' ? '(billed monthly)' : '(billed annually)'}
                </div>
              );
            })}
        </div>
        <br />
        <Button
          onClick={() => {
            handleSubscription();
          }}
          disabled={!dataId?.id}
          inProgress={inProgress}
        >
          <FormattedMessage id="StripeSubscriptionPage.selectButton" />
        </Button>
      </div>
    </Modal>
  );

  const resendEmail = (
    <>
      {inProgress ? (
        <FormattedMessage id="StripeSubscriptionPage.sent" />
      ) : (
        <span
          onClick={() => {
            setInProgress(true);
            dispatch(sendVerificationEmail());
            setTimeout(() => {
              setInProgress(false);
            }, 1000);
          }}
        >
          <b>
            <FormattedMessage id="StripeSubscriptionPage.sendAgain" />
          </b>
        </span>
      )}
    </>
  );

  return (
    <div>
      <Page className={css.root} title={'title'} scrollingDisabled={isScrollingDisabled}>
        <LayoutSingleColumn
          mainColumnClassName={css.layoutWrapperMain}
          topbar={<TopbarContainer className={css.test} />}
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            {!emailVerified && (
              <div className={css.verifyEmail}>
                <span>
                  <FormattedMessage
                    id="StripeSubscriptionPage.verifyText"
                    values={{ resendEmail }}
                  />
                </span>
              </div>
            )}
            <div className={css.cardWrapper}>
              <div className={css.starterCard}>
                <h3 className={css.cardTitle}>
                  <FormattedMessage id="StripeSubscriptionCards.stater" />
                </h3>
                <h4 className={css.cardFee}>
                  <FormattedMessage id="StripeSubscriptionCards.staterFree" />
                </h4>
                <Button
                  disabled={userType === USER_TYPE_BUSINESS}
                  inProgress={updateInProgress}
                  onClick={async () => {
                    const startDate = new Date(); // Get the current date and time

                    // Add 30 days to the current date
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 30);

                    // Convert the start date to a string format
                    const startDateString = startDate.toISOString().slice(0, 10);

                    // Convert the end date to a string format and extract only the date part
                    const endDateString = endDate.toISOString().slice(0, 10);
                    const result = dispatch(
                      updateProfile({
                        publicData: {
                          endDate: endDateString,
                          freePlanData: {
                            isFreePlanActive: true,
                            planName: FREE_PLAN,
                            startDate: startDateString,
                            endDate: endDateString,
                          },
                        },
                      })
                    );
                    if (result) {
                      history.push(
                        createResourceLocatorString('ManageSubscriptionPage', routes, {}, {})
                      );
                    }
                  }}
                  className={css.buttonWhiteRound}
                >
                  <FormattedMessage id="StripeSubscriptionCards.FreeSelect" />
                </Button>
                <div>
                  <p className={css.planIncludes}>
                    <FormattedMessage id="StripeSubscriptionCards.planIncludes" />
                  </p>
                  {freePlanDetails.map((data, id) => {
                    return (
                      <div key={id} className={css.planInfo}>
                        <IconCollection icon="checkIcon" />
                        <span>{data}</span>
                        <span>
                          {id !== 0 && (
                            <a href=" ">
                              <IconCollection icon="infoIcon" />
                            </a>
                          )}
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
                  {additionalPlanDetails.map((data, id) => {
                    return (
                      <div key={id} className={css.planInfo}>
                        <IconCollection icon="checkIcon" />
                        <span>{data}</span>
                        <span>
                          {id === 0 && (
                            <a href=" ">
                              <IconCollection icon="infoIcon" />
                            </a>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={css.memberCard}>
                <div className={css.recommendedText}>
                  <FormattedMessage id="StripeSubscriptionCards.recommended" />
                </div>
                <h3 className={css.cardTitle}>
                  <FormattedMessage id="StripeSubscriptionCards.member" />
                </h3>
                {filteredPlans?.length > 0 &&
                  filteredPlans.map((plan, id) => {
                    if (plan?.nickname === MEMBER_MONTHLY || plan?.nickname === MEMBER_YEARLY) {
                      return (
                        <div key={id}>
                          <StripeSubscriptionCards
                            subscriptionPlanData={plan}
                            handleModal={handleModal}
                          />
                        </div>
                      );
                    }
                  })}
              </div>
              <div className={css.businessCard}>
                <h3 className={css.cardTitle}>
                  <FormattedMessage id="StripeSubscriptionCards.business" />
                </h3>
                {filteredPlans?.length > 0 &&
                  filteredPlans.map((plan, id) => {
                    if (plan?.nickname === BUSINESS_MONTHLY || plan?.nickname === BUSINESS_YEARLY) {
                      return (
                        <div key={id}>
                          <StripeSubscriptionCards
                            subscriptionPlanData={plan}
                            handleModal={handleModal}
                          />
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
            {infoModal}
            {planModal}
          </div>
        </LayoutSingleColumn>
      </Page>
    </div>
  );
};

export default compose(withViewport, withRouter, injectIntl)(StripeSubscriptionPage);
