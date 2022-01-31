import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface Props {
    searchQuery: string,
    setSearchQuery: Function,
    searchFunc: Function
}

export default function CatalogSearch(props: Props) {
    let [inputSearchQuery, setinputSearchQuery] = useState(props.searchQuery);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            props.setSearchQuery(inputSearchQuery);
            if (inputSearchQuery === props.searchQuery) {
                props.searchFunc();
            }
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function handleClick() {
        props.setSearchQuery(inputSearchQuery);
        if (inputSearchQuery === props.searchQuery) {
            props.searchFunc();
        }
    }

    return (
        <div className="catalog-search-container">
            <input
                className="catalog-search-input"
                type="text"
                placeholder="All Fields (Contain)"
                value={inputSearchQuery}
                onKeyDown={handleKeyDown}
                onChange={(i_oSynthEvent: React.ChangeEvent<HTMLInputElement>) => setinputSearchQuery(i_oSynthEvent.target.value)} />

            <button className="catalog-search-btn" onClick={handleClick}><FontAwesomeIcon icon={faSearch} /><span>Search</span></button>
        </div>
    );
}