import React from "react";
import ICollection from "src/interfaces/Mooble/ICollection.tsx";

interface CategorySelectorProps {
    categories: Array<ICollection>
}

export default function CategorySelector(props: CategorySelectorProps) {
    /**
     * if props.categories is [] ==> "Categories"
     * else props.categories.length > 0 ? ==> "all items"
     */
    let label: string;

    if (props.categories.length === 0) {
        label = "Categories";
    } else {
        label = "All Items";

    }
    return (
        <div className="catalog-categories-container">
            {label}
        </div>
    );
}