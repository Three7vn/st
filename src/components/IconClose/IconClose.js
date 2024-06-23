import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconClose.module.css';
const SIZE_SMALL = 'small';

const IconClose = props => {
  const { className, rootClassName, size } = props;
  const classes = classNames(rootClassName || css.root, className);

  if (size === SIZE_SMALL) {
    return (
      <svg className={classes} width="26" height="23" viewBox="0 0 26 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.6573 4.11893L12.5008 10.2761L6.34428 4.11893C6.19621 3.98341 6.00157 3.91026 5.80091 3.91471C5.60024 3.91915 5.40903 4.00086 5.2671 4.1428C5.12518 4.28474 5.04348 4.47597 5.03904 4.67666C5.03459 4.87734 5.10774 5.07201 5.24324 5.22009L11.3966 11.3772L5.24168 17.5328C5.16648 17.6045 5.10637 17.6905 5.06488 17.7857C5.02338 17.881 5.00135 17.9835 5.00006 18.0874C4.99877 18.1913 5.01826 18.2944 5.05739 18.3906C5.09651 18.4868 5.15447 18.5743 5.22787 18.6478C5.30127 18.7213 5.38862 18.7794 5.48479 18.8187C5.58096 18.8579 5.684 18.8776 5.78787 18.8764C5.89174 18.8753 5.99433 18.8534 6.08961 18.812C6.1849 18.7707 6.27096 18.7107 6.34272 18.6356L12.5008 12.48L18.6573 18.6371C18.8054 18.7726 19 18.8458 19.2007 18.8413C19.4013 18.8369 19.5925 18.7552 19.7345 18.6133C19.8764 18.4713 19.9581 18.2801 19.9625 18.0794C19.967 17.8787 19.8938 17.684 19.7583 17.536L13.6018 11.3788L19.7583 5.22009C19.8335 5.14842 19.8936 5.06244 19.9351 4.96721C19.9766 4.87197 19.9987 4.7694 19.9999 4.66552C20.0012 4.56165 19.9817 4.45856 19.9426 4.36233C19.9035 4.26609 19.8455 4.17865 19.7721 4.10514C19.6987 4.03163 19.6114 3.97354 19.5152 3.93427C19.419 3.89501 19.316 3.87537 19.2121 3.87651C19.1083 3.87765 19.0057 3.89955 18.9104 3.94091C18.8151 3.98227 18.729 4.04226 18.6573 4.11737V4.11893Z" fill="black" />
      </svg>

    );
  }

  return (
    <svg
      className={classes}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-1 -1)" fillRule="evenodd">
        <rect transform="rotate(45 7 7)" x="-1" y="6" width="16" height="2" rx="1" />
        <rect transform="rotate(-45 7 7)" x="-1" y="6" width="16" height="2" rx="1" />
      </g>
    </svg>
  );
};

const { string } = PropTypes;

IconClose.defaultProps = {
  className: null,
  rootClassName: null,
};

IconClose.propTypes = {
  className: string,
  rootClassName: string,
};

export default IconClose;
