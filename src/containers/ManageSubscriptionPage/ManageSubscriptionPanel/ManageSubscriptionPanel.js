import React, { useEffect, useState } from 'react';
import css from './ManageSubscriptionPanel.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, NamedLink } from '../../../components';
import { FormattedMessage } from '../../../util/reactIntl';
import {
  deleteAccount,
  getSubscriptions,
} from '../../StripeSubscriptionPage/StripeSubscriptionPage.duck';
import {
  additionalPlanDetails,
  businessPerks,
  businessPlanDetails,
  freePlanDetails,
  memberPerks,
  memberPlanDetails,
} from '../../../util/dataExtractor';
import IconCollection from '../../../components/IconCollection/IconCollection';
import {
  BUSINESS_MONTHLY,
  BUSINESS_YEARLY,
  MEMBER_MONTHLY,
  MEMBER_YEARLY,
  SUBSCRIPTION_STATUS_TRIAL,
} from '../../../util/types';
import {
  closeAllListings,
  openRefurbishedAllListings,
  stripeCustomerPortal,
} from '../../../util/api';
import moment from 'moment';
import { logout } from '../../../ducks/auth.duck';
import { fetchCurrentUser } from '../../../ducks/user.duck';

const SubscriptionDetails = ({ plan, planDetails, perks, number }) => (
  <>
    <div>
      <p className={css.planIncludes}>
        <FormattedMessage id="StripeSubscriptionCards.planIncludes" />
      </p>
      {planDetails.map((data, id) => (
        <div key={id} className={css.planInfo}>
          <IconCollection icon="checkIcon" />
          <span>{data}</span>
        </div>
      ))}
    </div>

    <div>
      <p className={css.planIncludes}>
        <FormattedMessage id="StripeSubscriptionCards.additionalPerks" />
      </p>
      {perks.map((data, id) => (
        <div key={id} className={css.planInfo}>
          {id === number ? (
            <IconCollection icon="infinityIcon" />
          ) : (
            <IconCollection icon="checkIcon" />
          )}
          <span>{data}</span>
        </div>
      ))}
    </div>
  </>
);

const SubscriptionPlans = ({ userSubscriptions }) => (
  <>
    {userSubscriptions?.map((subscription, id) => {
      const { plan, status, trial_end } = subscription || {};
      const timestamp = trial_end;
      const date = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
      const { nickname, amount, interval } = plan || {};
      return (
        <div key={id}>
          {nickname} | £{amount / 100}/{interval}{' '}
          {status === SUBSCRIPTION_STATUS_TRIAL && `(Trial ends ${moment(date).format('DD MMM')})`}
        </div>
      );
    })}
  </>
);

const ManageSubscriptionPanel = ({ history }) => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [sessionUrlMessage, setSessionUrlMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const { currentUser } = state.user;
  const { freePlanData, currentPlanData, previousPlanData } =
    (!!currentUser?.id && currentUser.attributes.profile.publicData) || {};

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptions = await dispatch(getSubscriptions());
        if (subscriptions?.length) {
          setUserSubscriptions(subscriptions);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscriptions();
    dispatch(fetchCurrentUser());
  }, [!!currentUser?.id]);

  const manageSubscription = async () => {
    try {
      const sessionUrl = await stripeCustomerPortal({});
      typeof window !== 'undefined' && window.open(sessionUrl);
    } catch (err) {
      setSessionUrlMessage(err?.response?.data?.message);
      // toast.error(err.response.data.message);
    }
  };
  const Subscription = ({ userSubscriptions, freePlanData }) => {
    const hasMemberPlan = userSubscriptions?.some(
      e => e?.plan?.nickname === MEMBER_MONTHLY || e?.plan?.nickname === MEMBER_YEARLY
    );
    const hasBusinessPlan = userSubscriptions?.some(
      e => e?.plan?.nickname === BUSINESS_MONTHLY || e?.plan?.nickname === BUSINESS_YEARLY
    );

    if (userSubscriptions?.length > 0) {
      return (
        <div>
          <SubscriptionPlans userSubscriptions={userSubscriptions} />

          {hasMemberPlan && (
            <SubscriptionDetails planDetails={memberPlanDetails} perks={memberPerks} />
          )}
          {hasBusinessPlan && (
            <SubscriptionDetails
              planDetails={businessPlanDetails}
              perks={businessPerks}
              number={2}
            />
          )}
        </div>
      );
    } else if (freePlanData) {
      return (
        <>
          <h4 className={css.title}>
            <FormattedMessage
              id="StripeSubscriptionCards.freeMember"
              values={{ Month: <span className={css.monthText}> £0/month</span> }}
            />
          </h4>

          <SubscriptionDetails planDetails={freePlanDetails} perks={additionalPlanDetails} />
        </>
      );
    } else {
      return (
        <>
          <h4 className={css.title}>
            <FormattedMessage id="StripeSubscriptionCards.noPlan" />
            <div></div>
          </h4>
        </>
      );
    }
  };
  const deleteUserAccount = (
    <Modal
      id="StripeSubscriptionPage.deleteUserModal"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onManageDisableScrolling={() => {}}
      usePortal
    >
      <div>
        <h4 className={css.reportUserTitle}>
          <FormattedMessage id="StripeSubscriptionCards.heading" />
        </h4>
        <label className={css.label}>
          <FormattedMessage id="StripeSubscriptionCards.label" />
        </label>
        <textarea onChange={e => setCurrentPassword(e.target.value)} value={currentPassword} />
        <br />
        <div className={css.reportText}>
          <FormattedMessage id="StripeSubscriptionCards.bottomText" />
        </div>
        <br />
        <Button
          className={css.ReportSubmitbutton}
          inProgress={inProgress}
          onClick={async () => {
            setInProgress(true);
            const result = await dispatch(
              deleteAccount({ userId: currentUser?.id?.uuid, deleteReason: currentPassword })
            );
            if (result) {
              setInProgress(false);
              setIsModalOpen(false);
            }
          }}
        >
          <FormattedMessage id="StripeSubscriptionCards.deleteButton" />
        </Button>
      </div>
    </Modal>
  );
  return (
    <div className={css.manageSubscriptionPanel}>
      {Subscription({ userSubscriptions, freePlanData })}
      <br />
      <div className={css.buttonWrapper}>
        {userSubscriptions?.length === 0 ? (
          <NamedLink name="StripeSubscriptionPage" className={css.btnLink}>
            <Button className={css.buttonRound}>
              {' '}
              <FormattedMessage id="StripeSubscriptionCards.addNewPlan" />
            </Button>
          </NamedLink>
        ) : (
          <Button
            onClick={() => {
              manageSubscription();
            }}
            className={css.buttonRound}
          >
            <FormattedMessage id="StripeSubscriptionCards.changePlan" />
          </Button>
        )}
        {deleteUserAccount}
        <div
          className={css.deleteAccount}
          onClick={async () => {
            setIsModalOpen(true);
          }}
        >
          {' '}
          <FormattedMessage id="StripeSubscriptionCards.deleteAccount" />
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptionPanel;
