import React, { useMemo } from 'react';
import css from './AlgoliaSearchPage.module.css';
import IconCollection, { BACK_ICON, NEXT_ICON } from '../../components/IconCollection/IconCollection';
import { usePagination } from 'react-instantsearch';

const Pagination = () => {
  const { canRefine, currentRefinement, nbPages, refine, createURL } = usePagination();

  const getPageNumbers = useMemo(() => {
    const totalPages = nbPages;
    const currentPage = currentRefinement;
    const maxPageNumbers = 5;

    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + maxPageNumbers - 1);

    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(0, endPage - maxPageNumbers + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 0) {
      pageNumbers.unshift('...');
      pageNumbers.unshift(0);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
      pageNumbers.push(totalPages - 1);
    }

    return pageNumbers;
  }, [nbPages, currentRefinement]);

  return (
    <ul className={css.paginationWrapper}>
      {canRefine && nbPages > 1 ? (
        <>
          <li onClick={() => refine(currentRefinement - 1)} disabled={currentRefinement === 0} className={css.arrow}>
            <IconCollection icon={BACK_ICON} />
          </li>
          {getPageNumbers.map((page, i) => (
            <li
              key={i}
              onClick={() => refine(page)}
              className={page === currentRefinement ? css.activePage : ''}
            >
              {page === '...' ? (
                <span>...</span>
              ) : (
                <a
                  href={createURL(page)}
                  onClick={event => {
                    event.preventDefault();
                    refine(page);
                  }}
                >
                  {page + 1}
                </a>
              )}
            </li>
          ))}
          <li
            className={css.arrow}
            onClick={() => refine(currentRefinement + 1)}
            disabled={currentRefinement === nbPages - 1}
          >
            <IconCollection icon={NEXT_ICON} />
          </li>
        </>
      ) :
        null
      }
    </ul>
  );
};

export default Pagination;
