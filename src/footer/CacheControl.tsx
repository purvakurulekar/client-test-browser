import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser } from "@fortawesome/free-solid-svg-icons"
import React, { useState, useCallback, useEffect } from "react";
import Logger from "../../Logger";

import CiCAPI from "../../api/CiCAPI";

const
    KIBIBYTES = 1024,
    MEBIBYTE_VALUE = KIBIBYTES * KIBIBYTES;

interface ICacheControlProps {

}

//=============================================================================
export default function CacheControl(props: ICacheControlProps) {
    let [isCacheDisabled, setCacheDisabled] = useState(!CiCAPI.cache.isCacheEnabled()),
        [, forceUpdateState] = useState(),
        label: string,
        renderedCachedData;

    const onLogsChanged = useCallback(() => {
        forceUpdateState({} as any);
    }, []);

    useEffect(() => {
        // register to logger changes
        Logger.registerToChanges(onLogsChanged);
        return () => { // cleanup on onmount
            Logger.unregisterToChanges(onLogsChanged);
        }
    }, []);


    function handleCacheToggle(e: React.ChangeEvent<HTMLInputElement>) {
        let isCacheDisabled = e.target.checked;
        setCacheDisabled(isCacheDisabled);
        CiCAPI.cache.setCacheEnabled(!isCacheDisabled);
    }

    label = "Disable Cache";

    if (!isCacheDisabled) {
        renderedCachedData = (<CachedData />);
    }

    return (
        <div className="footer-cache-control centered-flex">
            <div className="centered-flex">
                <input id="enable-cache-toggle" type="checkbox" checked={isCacheDisabled} onChange={handleCacheToggle} />
                <label htmlFor="enable-cache-toggle">{label}</label>
            </div>
            {renderedCachedData}
        </div>
    );
}

//=============================================================================
function CachedData() {
    let [, updateState] = useState(),
        cacheSize: number,
        cacheSizeLabel: string;

    function handleClick() {
        CiCAPI.cache.clearCache();
        updateState({} as any); // equivalent of force update
    }

    cacheSize = CiCAPI.cache.getCacheSize();
    if (cacheSize < 1024) {
        // bytes
        cacheSizeLabel = `${cacheSize} Bytes`;
    } else if (cacheSize < MEBIBYTE_VALUE) {
        // kilobytes
        cacheSizeLabel = `${Math.round((cacheSize / KIBIBYTES) * 100) / 100} KiB`;
    } else {
        // megabytes
        cacheSizeLabel = `${Math.round((cacheSize / MEBIBYTE_VALUE) * 100) / 100} MiB`;
    }

    return (
        <div className="centered-flex">
            <span className="footer-label">Nb requests cached:</span>
            <span>{CiCAPI.cache.getNbCachedEntries()}</span>
            <span className="footer-label">cache size:</span>
            <span>{cacheSizeLabel}</span>
            <button className="cache-control-clear-btn" title="Clear Cache" onClick={handleClick}><FontAwesomeIcon icon={faEraser} /></button>
        </div>
    )
}