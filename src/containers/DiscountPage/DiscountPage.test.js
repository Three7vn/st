import React from 'react';
import '@testing-library/jest-dom';

import { createCurrentUser, fakeIntl } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { DiscountPageComponent } from './DiscountPage';

const { screen } = testingLibrary;

const noop = () => null;

describe('DiscountPage', () => {
  it('Check that there is a link to ProfilePage', () => {
    const props = {
      authInProgress: false,
      currentUser: createCurrentUser('userId'),
      currentUserHasListings: false,
      history: { push: noop },
      isAuthenticated: false,
      location: { search: '' },
      onChange: noop,
      onImageUpload: noop,
      onLogout: noop,
      onManageDisableScrolling: noop,
      onUpdateProfile: noop,
      params: { displayName: 'my-shop' },
      scrollingDisabled: false,
      updateInProgress: false,
      uploadInProgress: false,
      sendVerificationEmailInProgress: false,
      onResendVerificationEmail: noop,
      intl: fakeIntl,
    };

    render(<DiscountPageComponent {...props} />);

    const viewProfileLink = 'DiscountPage.viewProfileLink';
    expect(screen.getByText(viewProfileLink)).toBeInTheDocument();

    // TODO: ProfileSettingsForm should have a test of its own.
  });
});
