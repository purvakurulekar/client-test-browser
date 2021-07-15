export declare interface ICatalogBrowserProps {
    onProductAdd?: Function,
    includeDataSourceSwitcher?: boolean,
    includeSettings?: boolean
}

export declare const SELECT_ALL_CATALOG: IPublicCatalog;

export function CatalogBrowser(props: ICatalogBrowserProps): JSX.Element;