import React, { useState } from "react";
import DataSourceCheckbox from "./DataSourceCheckbox";

interface IDataSourceControlProps {
    // onChange: Function
}

//=============================================================================
export default function DataSourceControl(props: IDataSourceControlProps) {
    let cic3Source = useDataSourceCheckbox(CiCAPI.content.constants.DATA_SOURCES.cic3, "CiC3", _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3)),
        moobleSource = useDataSourceCheckbox(CiCAPI.content.constants.DATA_SOURCES.mooble, "Mooble", _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble)),
        cic2Source = useDataSourceCheckbox(CiCAPI.content.constants.DATA_SOURCES.cic2, "CiC2", _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2));

    return (
        <div className="footer-data-source centered-flex">
            <span className="footer-label">Data Source: </span>
            <DataSourceCheckbox {...cic3Source} />
            <DataSourceCheckbox {...moobleSource} />
            <DataSourceCheckbox {...cic2Source} />
        </div>
    );
}

//=============================================================================
function useDataSourceCheckbox(source: string, label: string, defaultState: boolean) {
    let [isSourceChecked, setSourceChecked] = useState(defaultState);

    function _toggleSource(e: React.ChangeEvent<HTMLInputElement>) {
        let isChecked: boolean = e.target.checked;
        setSourceChecked(isChecked);
        // data manager.setUseSource(source, e.target.checked);
        CiCAPI.setConfig(`sources.${source.toLowerCase()}_enabled`, isChecked);
    }

    return {
        source: source,
        label: label,
        isChecked: isSourceChecked,
        onChange: _toggleSource
    };
}


// move to utils ?
//=============================================================================
function _isSourceEnabled(src: DATA_SOURCES): boolean {
    return CiCAPI.getConfig(`sources.${src.toLowerCase()}_enabled`) as boolean;
}