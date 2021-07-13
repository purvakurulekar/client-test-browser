import React, { useState, useEffect } from "react";
import Utils from "../../Utils";
import Logger, { LOG_TYPE_ENUM, ILogEntry, IAvgTimings } from "../../Logger";

export default function LoggerRequestList() {
    let [, forceUpdate] = useState(),
        logList: Array<ILogEntry> = Logger.getLogs() || [],
        redrawFunc = () => forceUpdate({} as any);

    useEffect(() => {
        Logger.registerToChanges(redrawFunc);
        return () => Logger.unregisterToChanges(redrawFunc);
    }, []);

    return (
        <div className="logger-requests-list-root">
            <div className="logger-requests-avg-container">
                <div> Average Timings go here with graphs ?! </div>
            </div>

            <div className="logger-request-list-header">
                <span>Type</span>
                <span>Time</span>
                <span>Log</span>
                <span className="logger-request-list-header-last">Data</span>
            </div>

            <div className="logger-requests-list">
                {logList.map((logEntry: ILogEntry) => {
                    return (
                        <div className="logger-request-entry">
                            <span className="logger-request-entry-centered">{logEntry.type}</span>
                            <span className="logger-request-entry-right-aligned">{Utils.millisToString(logEntry.time)}</span>
                            <span>{logEntry.msg}</span>
                            <span>{logEntry.data}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

}