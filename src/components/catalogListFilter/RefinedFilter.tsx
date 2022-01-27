import React, { useState, useEffect } from 'react';


export interface IRefinedFilter {
    sortByCompany: boolean,
    sortByDate: boolean,
    filterSelectedOnly: boolean,
    filterLatestVersionOnly: boolean,
    filterActive: boolean,
    filterInProgress: boolean,
    filterDeactivated: boolean
}

interface IRefinedFilterProps {
    refinedFilters: IRefinedFilter,
    onFilterChanged: Function
}

export default function RefinedFilter(props: IRefinedFilterProps) {
    let [sortByCompany, setSortByCompany] = useState(props.refinedFilters.sortByCompany),
        [sortByDate, setSortByDate] = useState(props.refinedFilters.sortByDate),
        [filterSelectedOnly, setFilterSelectedOnly] = useState(props.refinedFilters.filterSelectedOnly),
        [filterLatestVersionOnly, setFilterLatestVersionOnly] = useState(props.refinedFilters.filterLatestVersionOnly),
        [filterActive, setFilterActive] = useState(props.refinedFilters.filterActive),
        [filterInProgress, setFilterInProgress] = useState(props.refinedFilters.filterInProgress),
        [filterDeactivated, setFilterDeactivated] = useState(props.refinedFilters.filterDeactivated);

    useEffect(() => {
        props.onFilterChanged({
            sortByCompany,
            sortByDate,
            filterLatestVersionOnly,
            filterSelectedOnly,
            filterActive,
            filterInProgress,
            filterDeactivated
        });
    });

    return (
        <div className="catalog-list-refined-filter">
            <div className="catalog-list-refined-filter-section">
                <div className="catalog-list-refined-filter-section-label">Sort By</div>
                <div className="catalog-list-refined-filter-sort-choices-container">
                    <div className="catalog-list-refined-filter-choice">
                        <input type="checkbox" checked={sortByCompany} onChange={() => setSortByCompany(!sortByCompany)} />
                        <span>Company</span>
                    </div>

                    <div className="catalog-list-refined-filter-choice">
                        <input type="checkbox" checked={sortByDate} onChange={() => setSortByDate(!sortByDate)} />
                        <span>Date</span>
                    </div>
                </div>
            </div>

            <div className="catalog-list-refined-filter-section">
                <div className="catalog-list-refined-filter-section-label">Filter By</div>
                <div className="catalog-list-refined-filter-choices-container">
                    <div className="catalog-list-refined-filter-choice">
                        <input type="checkbox" checked={filterSelectedOnly} onChange={() => setFilterSelectedOnly(!filterSelectedOnly)} />
                        <span>Selected Only</span>
                    </div>

                    <div className="catalog-list-refined-filter-choice">
                        <input type="checkbox" checked={filterLatestVersionOnly} onChange={() => setFilterLatestVersionOnly(!filterLatestVersionOnly)} />
                        <span>Latest version Only</span>
                    </div>

                    <div className="catalog-list-refined-filter-choice-option">
                        <input type="checkbox" checked={filterActive} onChange={() => setFilterActive(!filterActive)} />
                        <span>Activated</span>
                    </div>
                    <div className="catalog-list-refined-filter-choice-option">
                        <input type="checkbox" checked={filterInProgress} onChange={() => setFilterInProgress(!filterInProgress)} />
                        <span>InProgress</span>
                    </div>
                    <div className="catalog-list-refined-filter-choice-option">
                        <input type="checkbox" checked={filterDeactivated} onChange={() => setFilterDeactivated(!filterDeactivated)} />
                        <span>Deactivated</span>
                    </div>
                </div>
            </div>
        </div>
    )
}