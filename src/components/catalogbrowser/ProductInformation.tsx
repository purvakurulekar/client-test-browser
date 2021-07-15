import React from 'react';

interface Props {
    product: IPublicProduct
}

//=============================================================================
function ProductInformation(props: Props) {
    return (
        <div className="catalog-information">
            <div className="catalog-information-row">
                <span className="catalog-information-label">Location:</span>
                <span className="catalog-information-value">{props.product.id.split(":").slice(0, -1).join(" > ")}</span>
            </div>

            <div className="catalog-information-row">
                <span className="catalog-information-label">Order Code:</span>
                <span className="catalog-information-value">{props.product.orderCode}</span>
            </div>

            <div className="catalog-information-row">
                <span className="catalog-information-label">Dimensions:</span>
                <section>
                    {Object.entries(props.product.dimensions).map(i_aEntry => {
                        let l_sKey = i_aEntry[0].charAt(0);
                        return [<span key={l_sKey + "label"} className="catalog-information-label">{l_sKey}</span>, <span key={l_sKey + "value"} className="catalog-information-value">{i_aEntry[1]}</span>]
                    })}
                </section>
            </div>

            <div className="catalog-information-row">
                <span className="catalog-information-label">Price:</span>
                <span className="catalog-information-value">Variable</span>
            </div>

            <div className="catalog-information-row">
                <span className="catalog-information-label">Description:</span>
                <span className="catalog-information-value">{props.product.description}</span>
            </div>

        </div>
    );
}

export default ProductInformation;