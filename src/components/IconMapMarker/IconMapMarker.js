import React from 'react';
import { string } from 'prop-types';
import classNames from 'classnames';

import css from './IconMapMarker.module.css';

const FILTER = 'filter';
const MARKERONE = 'markerone';
const MARKERTWO = 'markertwo';

const IconMapMarker = props => {
  const { className, rootClassName, type } = props;
  const classes = classNames(rootClassName || css.root, className);

  switch (type) {
    case FILTER:
      return (
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="52" height="52" rx="4" fill="#212121" />
              <g clipPath="url(#clip0_10_238)">
                  <path d="M24.2452 37.6875H29.7545V34.7361H24.2452V37.6875ZM14.604 19.9792V22.9306H39.3957V19.9792H14.604ZM18.7359 30.309H35.2637V27.3577H18.7359V30.309Z" fill="white" />
              </g>
              <defs>
                  <clipPath id="clip0_10_238">
                      <rect width="34" height="34" fill="white" transform="translate(10 9)" />
                  </clipPath>
              </defs>
          </svg>
      );
    case MARKERONE:
      return (
        <svg className={classes} width="41" height="60" viewBox="0 0 41 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M41 20.6897C41 32.1162 21.1833 60 20.5 60C19.8167 60 0 32.1162 0 20.6897C0 9.26307 9.17816 0 20.5 0C31.8218 0 41 9.26307 41 20.6897Z" fill="#4661ED" />
          <ellipse cx="20.5" cy="19.3103" rx="12.3" ry="12.4138" fill="white" />
          <path d="M18.2676 14.4965V16.0565H19.9476V22.8965H21.8916V14.4965H18.2676Z" fill="#212121" />
        </svg>
      );
    case MARKERTWO:
      return (
        <svg className={classes} width="44" height="63" viewBox="0 0 44 63" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44 21.7241C44 33.722 22.7333 63 22 63C21.2667 63 0 33.722 0 21.7241C0 9.72623 9.84974 0 22 0C34.1503 0 44 9.72623 44 21.7241Z" fill="#212121" />
          <ellipse cx="22" cy="20.2759" rx="13.2" ry="13.0345" fill="white" />
          <path d="M21.5929 22.6574L23.5249 20.8334C24.7009 19.7414 24.9289 18.9974 24.9289 18.1814C24.9289 16.6574 23.6809 15.6974 21.8089 15.6974C20.2969 15.6974 19.1209 16.3094 18.4729 17.2574L19.8889 18.1694C20.2969 17.6054 20.9089 17.3294 21.6289 17.3294C22.5169 17.3294 22.9729 17.7134 22.9729 18.3734C22.9729 18.7814 22.8409 19.2134 22.0969 19.9214L18.8569 22.9814V24.2414H25.2049V22.6574H21.5929Z" fill="#23263B" />
        </svg>
      );
    default:
      return (
        <svg
          className={classes}
          width="29"
          height="19"
          viewBox="0 0 29 19"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" fillRule="evenodd">
            <path
              d="M26.58 19H2.42A2.4004 2.4004 0 0 1 0 16.62V2.38A2.4 2.4 0 0 1 2.42 0h24.16A2.4004 2.4004 0 0 1 29 2.38v14.25c-.0165 1.3216-1.0984 2.3811-2.42 2.37zM10 5.83c0-.46-.35-.83-.78-.83H3.78c-.43 0-.78.37-.78.83v3.34c0 .46.35.83.78.83h5.44c.43 0 .78-.37.78-.83V5.83z"
              fill="#DADDE2"
            />
            <path
              d="M25 15h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0h-3c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1zm-6 0H4c-.65 0-1-.3-1-1s.35-1 1-1h3c.65 0 1 .3 1 1s-.35 1-1 1z"
              fill="#B2B6C1"
            />
          </g>
        </svg>
      );
  }
};

IconMapMarker.defaultProps = {
  className: null,
  rootClassName: null,
  type: 'default',
};

IconMapMarker.propTypes = {
  className: string,
  rootClassName: string,
  type: string,
};

export default IconMapMarker;
