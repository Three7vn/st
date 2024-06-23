import React from 'react';
import { injectIntl } from '../../util/reactIntl';
import { useSelector } from 'react-redux';
import css from './ManageSubscriptionPage.module.css';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import { checkScrollingDisabled } from '../StripeSubscriptionPage/StripeSubscriptionPage.duck';
import { withViewport } from '../../util/uiHelpers';
import { LayoutSideNavigation, Page, UserNav } from '../../components';
import ManageSubscriptionPanel from './ManageSubscriptionPanel/ManageSubscriptionPanel';

export const ManageSubscriptionPage = props => {
  const { intl, location, history, viewport } = props;
  const isScrollingDisabled = useSelector(state => checkScrollingDisabled(state));

  return (
    <div>
      <Page
        className={css.root}
        title={'ManageSubscriptionPage'}
        scrollingDisabled={isScrollingDisabled}
      >
        <LayoutSideNavigation
          topbar={
            <>
              <TopbarContainer
                desktopClassName={css.desktopTopbar}
                mobileClassName={css.mobileTopbar}
              />
              <UserNav currentPage="ManageSubscriptionPage" />
            </>
          }
          sideNav={null}
          useAccountSettingsNav
          currentPage="ManageSubscriptionPage"
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            <ManageSubscriptionPanel />
          </div>
        </LayoutSideNavigation>
      </Page>
    </div>
  );
};

export default compose(
  withViewport,
  withRouter,
  injectIntl
)(ManageSubscriptionPage);
