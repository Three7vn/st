import React from 'react';
import css from '../../styles/autocomplete-theme-classic.css';

export function AlgoliaAutoItem({  hit, components, redirectTo }) {
    require('@algolia/autocomplete-theme-classic');

    return (
        <div onClick={() => redirectTo (hit.title) } className={css["aa-ItemLink"]}>
            <div className={css["aa-ItemContent"]}>
                <div className={css["aa-ItemTitle"]}>
                    <components.Highlight hit={hit} attribute="name" />
                    {hit.title}
                </div>
            </div>
        </div>
    );
}