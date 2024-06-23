import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './Topbar.module.css';

const SearchIcon = props => {
  const { className, rootClassName } = props;
  const classes = classNames(rootClassName || css.rootSearchIcon, className);

  return (
    <svg
      className={classes}
      width="27"
      height="26"
      viewBox="0 0 27 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.0735 19.6667L25.4615 25M1.21539 11.6667C1.21539 14.4956 2.35073 17.2088 4.37163 19.2091C6.39254 21.2095 9.13347 22.3333 11.9915 22.3333C14.8495 22.3333 17.5904 21.2095 19.6113 19.2091C21.6322 17.2088 22.7675 14.4956 22.7675 11.6667C22.7675 8.83769 21.6322 6.12458 19.6113 4.12419C17.5904 2.12381 14.8495 1 11.9915 1C9.13347 1 6.39254 2.12381 4.37163 4.12419C2.35073 6.12458 1.21539 8.83769 1.21539 11.6667Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const { string } = PropTypes;

SearchIcon.defaultProps = {
  className: null,
  rootClassName: null,
};

SearchIcon.propTypes = {
  className: string,
  rootClassName: string,
};

export default SearchIcon;
