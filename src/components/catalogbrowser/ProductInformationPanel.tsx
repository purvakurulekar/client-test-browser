import React, { useState } from 'react';
import ICommonProduct from '../../interfaces/ICommonProduct';
import ProductInformation from "./ProductInformation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faCaretDown } from "@fortawesome/free-solid-svg-icons";

interface Props {
    product: ICommonProduct | null
}

//=============================================================================
function ProductInformationPanel(props: Props) {
    let [l_bIsOpened, l_fnSetOpened] = useState(false),
        l_oIcon,
        l_oRenderedIcon,
        l_oProductInfos;

    if (props.product) {
        if (l_bIsOpened) {
            l_oIcon = faCaretDown;
            l_oProductInfos = <ProductInformation product={props.product} />
        } else {
            l_oIcon = faCaretRight;
        }
        l_oRenderedIcon = (<div className="information-panel-toggle-logo"><FontAwesomeIcon icon={l_oIcon} /></div>);
    } else {
        l_oProductInfos = null;
        l_oRenderedIcon = null;
    }

    return (
        <div className="catalog-information-panel">
            <button className="catalog-information-panel-toggle-btn" onClick={() => l_fnSetOpened(!l_bIsOpened)}>
                <span>Information</span>
                {l_oRenderedIcon}
            </button>
            {l_oProductInfos}
        </div>
    );
}

export default ProductInformationPanel;