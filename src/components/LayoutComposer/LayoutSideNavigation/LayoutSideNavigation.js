import React from 'react';
import { bool, node, string } from 'prop-types';
import classNames from 'classnames';

import LayoutComposer from '../LayoutComposer';
import LayoutWrapperAccountSettingsSideNav from './LayoutWrapperAccountSettingsSideNav';

import css from './LayoutSideNavigation.module.css';
import { useSelector } from 'react-redux';

// Commonly used layout
const LayoutSideNavigation = props => {
  const state = useSelector(state => state);
  const { currentUser } = state.user;
  const isUserAdmin = currentUser?.attributes?.profile?.publicData?.isUserAdmin || false;
  const {
    className,
    rootClassName,
    containerClassName,
    mainColumnClassName,
    sideNavClassName,
    children,
    topbar: topbarContent,
    footer: footerContent,
    sideNav: sideNavContent,
    useAccountSettingsNav,
    currentPage,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const containerClasses = containerClassName || css.container;

  // TODO: since responsiveAreas are still experimental,
  //       we don't separate "aside" through layoutComposer
  const layoutAreas = `
    topbar
    main
    footer
  `;

  return (
    <LayoutComposer areas={layoutAreas} className={classes} {...rest}>
      {layoutProps => {
        const { Topbar, Main, Footer } = layoutProps;
        return (
          <>
            <Topbar as="header" className={css.topbar}>
              {topbarContent}
            </Topbar>
            <Main as="div" className={containerClasses}>
              <aside className={classNames(css.sideNav, sideNavClassName)}>
                {useAccountSettingsNav ? (
                  <LayoutWrapperAccountSettingsSideNav currentPage={currentPage} isUserAdmin={isUserAdmin} />
                ) : null}
                {sideNavContent}
              </aside>
              <main className={classNames(css.main, mainColumnClassName)}>{children}</main>
            </Main>
            <Footer>{footerContent}</Footer>
          </>
        );
      }}
    </LayoutComposer>
  );
};

LayoutSideNavigation.displayName = 'LayoutSideNavigation';

LayoutSideNavigation.defaultProps = {
  className: null,
  rootClassName: null,
  sideNav: null,
  footer: null,
  useAccountSettingsNav: false,
  currentPage: null,
};

LayoutSideNavigation.propTypes = {
  className: string,
  rootClassName: string,
  children: node.isRequired,
  topbar: node.isRequired,
  sideNav: node,
  footer: node,
  useAccountSettingsNav: bool,
  currentPage: string,
};

export default LayoutSideNavigation;
