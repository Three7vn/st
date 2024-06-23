import React, { useState, useEffect, useRef, createElement, Fragment } from 'react';
import { render } from 'react-dom';
import { autocomplete } from '@algolia/autocomplete-js';
import { debounce } from '@algolia/autocomplete-shared';
import { usePagination, useSearchBox } from 'react-instantsearch';
import '@algolia/autocomplete-theme-classic';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';
import { AlgoliaAutoItem } from './AlgoliaAutoItem';

const Autocomplete = ({ searchClient, searchState = '', className, ...autocompleteProps }) => {
  const autocompleteContainer = useRef(null);
  const { query, refine: setQuery } = useSearchBox();
  const { refine: setPage } = usePagination();
  const [instantSearchUiState, setInstantSearchUiState] = useState({ query: searchState });
  const debouncedSetInstantSearchUiState = debounce(setInstantSearchUiState, 500);

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    setPage(0);
  }, [instantSearchUiState]);

  const redirectTo = link => {};

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return;
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      insights: true,
      // plugins,
      getSources: ({ query }) => [
        {
          sourceId: 'hits',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'Stoado-DEV',
                  query,
                },
              ],
              transformResponse({ hits }) {
                const queryId = hits?.[0]?.[0]?.__autocomplete_queryID;

                typeof window !== 'undefined' && window.localStorage.setItem('queryId', queryId);
                return hits;
              },
            });
          },
          templates: {
            item({ item, components }) {
              return <AlgoliaAutoItem hit={item} redirectTo={redirectTo} components={components} />;
            },
          },
          getItemInputValue({ item }) {
            return item.title;
          },
        },
      ],
      onSubmit({ state }) {
        // Set the query state only when the user selects an item from the dropdown
        if (state.query) {
          setInstantSearchUiState({ query: state.query });
        }
      },
      onStateChange({ prevState, state }) {
        // Check if the query has changed
        if (prevState.query !== state.query) {
          // If the query has changed, update the UI state after debouncing
          debouncedSetInstantSearchUiState({ query: state.query });
        }
        // Check if the user has selected an item from the dropdown
        if (prevState.query !== state.query && state.query === '') {
          // If the user has selected an item from the dropdown, redirect
          // redirectToProduct(state.query);
        }
      },
      renderer: { createElement, Fragment, render: render },
    });
    return () => autocompleteInstance.destroy();
  }, []);

  return <div className={className} ref={autocompleteContainer} />;
};

export default Autocomplete;
