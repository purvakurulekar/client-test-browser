import React, { useState, useEffect, useCallback } from "react";
import Logger, { LOG_TYPE_ENUM, ILogEntry, IAvgTimings } from "../../Logger";
import Utils from "../../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookDead, faEraser } from "@fortawesome/free-solid-svg-icons";

interface IRequestTimingPreviewProps {
    onFullRequestClicked: Function
}

export default function RequestTimingPreview(props: IRequestTimingPreviewProps) {
    let [nbRequests, setNbRequests] = useState(0),
        lastLogEntry: ILogEntry | null = Logger.getLastLog(LOG_TYPE_ENUM.network),
        lastLogTime: string,
        avgTiming: IAvgTimings = Logger.getAvgLogTimings(LOG_TYPE_ENUM.network);

    if (lastLogEntry !== null) {
        lastLogTime = Utils.millisToString(lastLogEntry.time);
    } else {
        lastLogTime = " -- ";
    }

    const onLogsChanged = useCallback(() => {
        console.log("Logs Changed");
        let logList = Logger.getLogs();
        setNbRequests(logList.length);
    }, []);

    useEffect(() => {
        // register to logger changes
        Logger.registerToChanges(onLogsChanged);

        return () => { // cleanup on onmount
            Logger.unregisterToChanges(onLogsChanged);
        }
    }, []);

    return (
        <div className="footer-timings centered-flex">
            <span className="footer-label">Requests Timing: </span>
            <div className="centered-flex">
                <span className="footer-label">nb requests:</span>
                <span>{nbRequests}</span>
                <span className="footer-label">last request: </span>
                <span>{lastLogTime}</span>
                <span className="footer-label">avg: </span>
                <span>{Utils.millisToString(avgTiming.min)} / {Utils.millisToString(avgTiming.avg)} / {Utils.millisToString(avgTiming.max)}</span>
                <button className="request-full-timings-btn" onClick={() => props.onFullRequestClicked()}><FontAwesomeIcon icon={faBookDead} /></button>
                <button className="request-timings-clear-btn" title="Clear Timings" onClick={() => Logger.reset()}><FontAwesomeIcon icon={faEraser} /></button>
            </div>
        </div>
    );
}