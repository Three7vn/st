import React from 'react';

import css from './TopbarSearchForm.module.css';

const IconSearchDesktop = ({ isSearchPage }) =>
  isSearchPage ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path
        fill="none"
        d="M21.6667 21.6667L27 27M3 13.6667C3 16.4956 4.12381 19.2088 6.12419 21.2091C8.12458 23.2095 10.8377 24.3333 13.6667 24.3333C16.4956 24.3333 19.2088 23.2095 21.2091 21.2091C23.2095 19.2088 24.3333 16.4956 24.3333 13.6667C24.3333 10.8377 23.2095 8.12458 21.2091 6.12419C19.2088 4.12381 16.4956 3 13.6667 3C10.8377 3 8.12458 4.12381 6.12419 6.12419C4.12381 8.12458 3 10.8377 3 13.6667Z"
        stroke="#383F52"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.6667 19.6667L25 25M1 11.6667C1 14.4956 2.12381 17.2088 4.12419 19.2091C6.12458 21.2095 8.83769 22.3333 11.6667 22.3333C14.4956 22.3333 17.2088 21.2095 19.2091 19.2091C21.2095 17.2088 22.3333 14.4956 22.3333 11.6667C22.3333 8.83769 21.2095 6.12458 19.2091 4.12419C17.2088 2.12381 14.4956 1 11.6667 1C8.83769 1 6.12458 2.12381 4.12419 4.12419C2.12381 6.12458 1 8.83769 1 11.6667Z"
        stroke="white"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

export default IconSearchDesktop;
