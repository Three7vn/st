import React, { useState, useEffect } from 'react';
import { bool, func, oneOf, shape } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../util/routes';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { ensureCurrentUser } from '../../util/data';
import { PAYOUT_WITH_CRYPTO, PAYOUT_WITH_STRIPE, propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import {
  stripeAccountClearError,
  getStripeConnectAccountLink,
} from '../../ducks/stripeConnectAccount.duck';

import {
  H3,
  NamedRedirect,
  Page,
  StripeConnectAccountStatusBox,
  StripeConnectAccountForm,
  UserNav,
  LayoutSideNavigation,
  Button,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import { savePayoutDetails } from './StripePayoutPage.duck';

import css from './StripePayoutPage.module.css';
import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { decryptWalletAddress, encryptWalletAddress } from '../../util/api';
import IconCollection from '../../components/IconCollection/IconCollection';

const STRIPE_ONBOARDING_RETURN_URL_SUCCESS = 'success';
const STRIPE_ONBOARDING_RETURN_URL_FAILURE = 'failure';
const STRIPE_ONBOARDING_RETURN_URL_TYPES = [
  STRIPE_ONBOARDING_RETURN_URL_SUCCESS,
  STRIPE_ONBOARDING_RETURN_URL_FAILURE,
];

import CryptoJS from 'crypto-js';

const secretKey = 'PBKDF2WithHmacSHA1'; // Use a secure key and manage it properly

// const encryptWalletAddress = walletAddress => {
//   return CryptoJS.AES.encrypt(walletAddress, secretKey).toString();
// };

const validCurrencies = ['BTC', 'ETH', 'USDT', 'USDT_TRC20', 'USDC'];
const addressPatterns = {
  BTC: /^(bc1|[13]|tb1)[a-zA-HJ-NP-Z0-9]{25,39}$/, // Added tb1 prefix for Bitcoin testnet addresses
  ETH: /^0x[a-fA-F0-9]{40}$/,
  USDT: /^(1[a-zA-HJ-NP-Z0-9]{25,34}|3[a-zA-HJ-NP-Z0-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39}|0x[a-fA-F0-9]{40})$/,
  USDT_TRC20: /^T[a-zA-Z0-9]{33}$/,
  USDC: /^0x[a-fA-F0-9]{40}$/,
};

const validateWalletAddress = input => {
  for (const currency of validCurrencies) {
    const pattern = addressPatterns[currency];
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
};

// Create return URL for the Stripe onboarding form
const createReturnURL = (returnURLType, rootURL, routes) => {
  const path = createResourceLocatorString(
    'StripePayoutOnboardingPage',
    routes,
    { returnURLType },
    {}
  );
  const root = rootURL.replace(/\/$/, '');
  return `${root}${path}`;
};

// Get attribute: stripeAccountData
const getStripeAccountData = stripeAccount => stripeAccount.attributes.stripeAccountData || null;

// Get last 4 digits of bank account returned in Stripe account
const getBankAccountLast4Digits = stripeAccountData =>
  stripeAccountData && stripeAccountData.external_accounts.data.length > 0
    ? stripeAccountData.external_accounts.data[0].last4
    : null;

// Check if there's requirements on selected type: 'past_due', 'currently_due' etc.
const hasRequirements = (stripeAccountData, requirementType) =>
  stripeAccountData != null &&
  stripeAccountData.requirements &&
  Array.isArray(stripeAccountData.requirements[requirementType]) &&
  stripeAccountData.requirements[requirementType].length > 0;

// Redirect user to Stripe's hosted Connect account onboarding form
const handleGetStripeConnectAccountLinkFn = (getLinkFn, commonParams) => type => () => {
  getLinkFn({ type, ...commonParams })
    .then(url => {
      window.location.href = url;
    })
    .catch(err => console.error(err));
};

export const StripePayoutPageComponent = props => {
  const config = useConfiguration();
  const routes = useRouteConfiguration();
  const [walletAddress, setWalletAddress] = useState('');
  const [savedWalletAddress, setSavedWalletAddress] = useState('');
  const [error, setError] = useState('');
  const {
    currentUser,
    scrollingDisabled,
    getAccountLinkInProgress,
    getAccountLinkError,
    createStripeAccountError,
    updateStripeAccountError,
    fetchStripeAccountError,
    stripeAccountFetched,
    stripeAccount,
    onPayoutDetailsChange,
    onPayoutDetailsSubmit,
    onGetStripeConnectAccountLink,
    payoutDetailsSaveInProgress,
    payoutDetailsSaved,
    params,
    intl,
    onUpdateProfile,
    updateInProgress,
    pendingTransactions,
  } = props;
  const freePlan = currentUser?.attributes?.profile?.publicData?.freePlanData?.planName || '';
  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const { cryptoWalletAddress, selectedMethod: selectedMethods } =
    (!!ensuredCurrentUser.id && ensuredCurrentUser.attributes.profile.protectedData) || {};
  const { rewardsWallet } =
    (!!ensuredCurrentUser.id && ensuredCurrentUser.attributes.profile.publicData) || {};
  const [selectedMethod, setSelectMethod] = useState(selectedMethods ? selectedMethods : []);

  const maskWalletAddress = address => {
    const visibleChars = 6; // Number of characters to show at the beginning and end
    const maskedSection = '***'; // Characters to replace the middle part

    if (address.length <= 2 * visibleChars) {
      return address; // If the address is too short to mask, return it as is
    }

    const start = address.slice(0, visibleChars);
    const end = address.slice(-visibleChars);
    setWalletAddress(`${start}${maskedSection}${end}`);
    setSavedWalletAddress(`${start}${maskedSection}${end}`);
  };

  const fetchWalletAddress = async () => {
    try {
      const decryptId = CryptoJS.AES.decrypt(cryptoWalletAddress, secretKey);
      maskWalletAddress(decryptId.toString(CryptoJS.enc.Utf8));
    } catch (error) {}
  };

  useEffect(() => {
    if (cryptoWalletAddress) {
      fetchWalletAddress();
    }
  }, [!!cryptoWalletAddress]);

  const { returnURLType } = params;
  const currentUserLoaded = !!ensuredCurrentUser.id;
  const stripeConnected = currentUserLoaded && !!stripeAccount && !!stripeAccount.id;

  const title = intl.formatMessage({ id: 'StripePayoutPage.title' });

  const formDisabled = getAccountLinkInProgress;

  const rootURL = config.marketplaceRootURL;
  const successURL = createReturnURL(STRIPE_ONBOARDING_RETURN_URL_SUCCESS, rootURL, routes);
  const failureURL = createReturnURL(STRIPE_ONBOARDING_RETURN_URL_FAILURE, rootURL, routes);

  const accountId = stripeConnected ? stripeAccount.id : null;
  const stripeAccountData = stripeConnected ? getStripeAccountData(stripeAccount) : null;
  const requirementsMissing =
    stripeAccount &&
    (hasRequirements(stripeAccountData, 'past_due') ||
      hasRequirements(stripeAccountData, 'currently_due'));

  const savedCountry = stripeAccountData ? stripeAccountData.country : null;

  const handleGetStripeConnectAccountLink = handleGetStripeConnectAccountLinkFn(
    onGetStripeConnectAccountLink,
    {
      accountId,
      successURL,
      failureURL,
    }
  );

  const returnedNormallyFromStripe = returnURLType === STRIPE_ONBOARDING_RETURN_URL_SUCCESS;
  const returnedAbnormallyFromStripe = returnURLType === STRIPE_ONBOARDING_RETURN_URL_FAILURE;
  const showVerificationNeeded = stripeConnected && requirementsMissing;

  // Redirect from success URL to basic path for StripePayoutPage
  if (returnedNormallyFromStripe && stripeConnected && !requirementsMissing) {
    return <NamedRedirect name="StripePayoutPage" />;
  }

  // Failure url should redirect back to Stripe since it's most likely due to page reload
  // Account link creation will fail if the account is the reason
  if (returnedAbnormallyFromStripe && !getAccountLinkError) {
    handleGetStripeConnectAccountLink('custom_account_verification')();
  }

  const handlePayoutMethod = selectedValue => {
    if (selectedMethod.includes(selectedValue)) {
      setSelectMethod(prevMethod => prevMethod.filter(method => method !== selectedValue));
    } else {
      setSelectMethod(prevMethod => [...prevMethod, selectedValue]);
    }
  };

  const totalPendingPayment =
    pendingTransactions?.length > 0 &&
    pendingTransactions.reduce(
      (accumulator, obj) => accumulator + obj.attributes.payoutTotal.amount / 100,
      0
    );
  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <UserNav currentPage="StripePayoutPage" />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        currentPage="StripePayoutPage"
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <H3 as="h1" className={css.heading}>
            <FormattedMessage id="StripePayoutPage.heading" />
          </H3>
          <div className={css.accountBalance}>
            <span className={css.balance}>
              <FormattedMessage
                id="StripePayoutPage.accountBalance"
                values={{ accountBalance: <b>£{totalPendingPayment}</b> }}
              />
            </span>
            <span className={css.pending}>
              <FormattedMessage id="StripePayoutPage.pendingBalance" />
            </span>
          </div>
          <div className={css.points}>
            <span>
              <FormattedMessage id="StripePayoutPage.points" values={{ points: rewardsWallet }} />
            </span>
          </div>
          <div>
            <h4 className={css.subTitle}>
              <FormattedMessage id="StripePayoutPage.selectmethod" />
            </h4>
            {/* <div className={css.checkBox} onClick={() => handlePayoutMethod(PAYOUT_WITH_STRIPE)}> */}
            {/* <span>{selectedMethod.includes(PAYOUT_WITH_STRIPE) && <IconCollection icon="checkIcon" />}</span> <span >
              <FormattedMessage id="StripePayoutPage.withStripe" />
            </span>{' '} */}
            {/* </div> */}
          </div>
          {!currentUserLoaded ? (
            <FormattedMessage id="StripePayoutPage.loadingData" />
          ) : returnedAbnormallyFromStripe && !getAccountLinkError ? (
            <FormattedMessage id="StripePayoutPage.redirectingToStripe" />
          ) : (
            <>
              <StripeConnectAccountForm
                rootClassName={css.stripeConnectAccountForm}
                disabled={formDisabled}
                inProgress={payoutDetailsSaveInProgress}
                ready={payoutDetailsSaved}
                currentUser={ensuredCurrentUser}
                stripeBankAccountLastDigits={getBankAccountLast4Digits(stripeAccountData)}
                savedCountry={savedCountry}
                submitButtonText={intl.formatMessage({
                  id: 'StripePayoutPage.submitButtonText',
                })}
                stripeAccountError={
                  createStripeAccountError || updateStripeAccountError || fetchStripeAccountError
                }
                stripeAccountLinkError={getAccountLinkError}
                stripeAccountFetched={stripeAccountFetched}
                selectedMethod={selectedMethod}
                onUpdateProfile={onUpdateProfile}
                onChange={onPayoutDetailsChange}
                onSubmit={onPayoutDetailsSubmit}
                onGetStripeConnectAccountLink={handleGetStripeConnectAccountLink}
                stripeConnected={stripeConnected}
                showVerificationNeeded={showVerificationNeeded}
              >
                {stripeConnected && !returnedAbnormallyFromStripe && showVerificationNeeded ? (
                  <StripeConnectAccountStatusBox
                    type="verificationNeeded"
                    inProgress={getAccountLinkInProgress}
                    onGetStripeConnectAccountLink={handleGetStripeConnectAccountLink(
                      'custom_account_verification'
                    )}
                  />
                ) : stripeConnected && savedCountry && !returnedAbnormallyFromStripe ? (
                  <StripeConnectAccountStatusBox
                    type="verificationSuccess"
                    inProgress={getAccountLinkInProgress}
                    disabled={payoutDetailsSaveInProgress}
                    onGetStripeConnectAccountLink={handleGetStripeConnectAccountLink(
                      'custom_account_update'
                    )}
                  />
                ) : null}
              </StripeConnectAccountForm>
            </>
          )}
          {freePlan !== 'Free-Plan' && stripeAccount && !showVerificationNeeded ? (
            <div>
              <h4 as="h1" className={css.heading}>
                <FormattedMessage id="StripePayoutPage.cryptoHeading" />
              </h4>
              <div className={css.checkBox}>
                <span onClick={() => handlePayoutMethod(PAYOUT_WITH_CRYPTO)}>
                  {selectedMethod.includes(PAYOUT_WITH_CRYPTO) ? (
                    <IconCollection icon="ICON_RADIO_SELECT" />
                  ) : (
                    <IconCollection icon="ICON_RADIO_UNSELECT" />
                  )}
                </span>
                <span onClick={() => handlePayoutMethod(PAYOUT_WITH_CRYPTO)}>
                  <FormattedMessage id="StripePayoutPage.withCrypto" />
                </span>
                {(selectedMethod.includes(PAYOUT_WITH_CRYPTO) || walletAddress) && (
                  <div>
                    <input
                      name="walletAddress"
                      value={walletAddress}
                      required
                      onChange={e => {
                        setWalletAddress(e.target.value);
                      }}
                    />

                    {error}
                  </div>
                )}
              </div>
              <Button
                inProgress={updateInProgress}
                disabled={!walletAddress || savedWalletAddress === walletAddress}
                onClick={async () => {
                  try {
                    if (validateWalletAddress(walletAddress)) {
                      setError('');
                      if (walletAddress) {
                        const token = CryptoJS.AES.encrypt(walletAddress, secretKey).toString();
                        const params = {
                          protectedData: {
                            cryptoWalletAddress: token,
                            selectedMethod:
                              selectedMethods?.length === 2
                                ? selectedMethods
                                : [...selectedMethods, PAYOUT_WITH_CRYPTO],
                          },
                        };
                        onUpdateProfile(params);
                      }
                    } else {
                      setError(
                        'Invalid wallet address. Please input a valid address for one of the following: BTC, ETH, USDT, USDT_TRC20, USDC.'
                      );
                    }
                  } catch (error) {}
                }}
                className={css.addWalet}
              >
                Add wallet address
              </Button>
            </div>
          ) : null}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

StripePayoutPageComponent.defaultProps = {
  currentUser: null,
  createStripeAccountError: null,
  updateStripeAccountError: null,
  fetchStripeAccountError: null,
  getAccountLinkError: null,
  stripeAccount: null,
  params: {
    returnURLType: null,
  },
};

StripePayoutPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  scrollingDisabled: bool.isRequired,
  getAccountLinkInProgress: bool.isRequired,
  payoutDetailsSaveInProgress: bool.isRequired,
  createStripeAccountError: propTypes.error,
  getAccountLinkError: propTypes.error,
  updateStripeAccountError: propTypes.error,
  fetchStripeAccountError: propTypes.error,
  stripeAccount: propTypes.stripeAccount,
  stripeAccountFetched: bool.isRequired,
  payoutDetailsSaved: bool.isRequired,

  onPayoutDetailsChange: func.isRequired,
  onPayoutDetailsSubmit: func.isRequired,
  onGetStripeConnectAccountLink: func.isRequired,
  params: shape({
    returnURLType: oneOf(STRIPE_ONBOARDING_RETURN_URL_TYPES),
  }),

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    getAccountLinkInProgress,
    getAccountLinkError,
    createStripeAccountError,
    updateStripeAccountError,
    fetchStripeAccountError,
    stripeAccount,
    stripeAccountFetched,
  } = state.stripeConnectAccount;
  const { updateInProgress, updateProfileError } = state.ProfileSettingsPage;
  const { currentUser } = state.user;
  const {
    payoutDetailsSaveInProgress,
    payoutDetailsSaved,
    pendingTransactions,
  } = state.StripePayoutPage;
  return {
    updateInProgress,
    currentUser,
    getAccountLinkInProgress,
    getAccountLinkError,
    createStripeAccountError,
    updateStripeAccountError,
    fetchStripeAccountError,
    stripeAccount,
    stripeAccountFetched,
    payoutDetailsSaveInProgress,
    payoutDetailsSaved,
    scrollingDisabled: isScrollingDisabled(state),
    pendingTransactions,
  };
};

const mapDispatchToProps = dispatch => ({
  onPayoutDetailsChange: () => dispatch(stripeAccountClearError()),
  onPayoutDetailsSubmit: (values, isUpdateCall) =>
    dispatch(savePayoutDetails(values, isUpdateCall)),
  onGetStripeConnectAccountLink: params => dispatch(getStripeConnectAccountLink(params)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
});

const StripePayoutPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(StripePayoutPageComponent);

export default StripePayoutPage;
