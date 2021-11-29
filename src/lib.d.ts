export declare interface ICatalogBrowserProps {
    onItemAdd?: Function,
    includeSettings?: boolean,
    width?: number,
    height?: number
}

export declare const SELECT_ALL_CATALOG: ICatalog;

export function CatalogBrowser(props: ICatalogBrowserProps): JSX.Element;