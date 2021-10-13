export declare interface ICatalogBrowserProps {
    onItemAdd?: Function,
    includeSettings?: boolean
}

export declare const SELECT_ALL_CATALOG: ICatalog;

export function CatalogBrowser(props: ICatalogBrowserProps): JSX.Element;