import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './ManageListingCard.module.css';

const MenuIcon = props => {
  const { className, isActive, tableMenuIcon } = props;
  const classes = classNames(css.menuIcon, className);
  const filter = isActive ? '' : 'url(#a)';
  return (
    tableMenuIcon ?

      <svg width="32" height="7" viewBox="0 0 32 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7 3.5C7 5.433 5.433 7 3.5 7C1.567 7 0 5.433 0 3.5C0 1.567 1.567 0 3.5 0C5.433 0 7 1.567 7 3.5ZM19.25 3.5C19.25 5.433 17.683 7 15.75 7C13.817 7 12.25 5.433 12.25 3.5C12.25 1.567 13.817 0 15.75 0C17.683 0 19.25 1.567 19.25 3.5ZM28 7C29.933 7 31.5 5.433 31.5 3.5C31.5 1.567 29.933 0 28 0C26.067 0 24.5 1.567 24.5 3.5C24.5 5.433 26.067 7 28 7Z" fill="#383F52" />
      </svg>

      : <svg
        className={classes}
        width="26"
        height="12"
        viewBox="0 0 26 12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter x="-38.9%" y="-125%" width="177.8%" height="450%" filterUnits="objectBoundingBox">
            <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" in="shadowBlurOuter1" />
          </filter>
        </defs>
        <g transform="translate(-342 -18)" filter={filter}>
          <path d="M348 24c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm7 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm7 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
        </g>
        <g transform="translate(-342 -18)">
          <path d="M348 24c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm7 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm7 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
        </g>
      </svg>
  );
};

MenuIcon.defaultProps = {
  className: null,
  isActive: false,
};

const { bool, string } = PropTypes;

MenuIcon.propTypes = {
  className: string,
  isActive: bool,
};

export default MenuIcon;
