import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-regular-svg-icons";

interface ISettingsPanelProps {
    onClose: Function
}

interface ISettingsPanelGroupProps {
    label: string,
    configPath: string,
    configMap: ConfigMap
}

interface ISettingsEntryProps {
    label: string,
    path: string,
    value: string,
    onChange: Function
}

type configEntry = Array<string | number | boolean | void>;

//=============================================================================
export default function SettingsPanel(props: ISettingsPanelProps) {
    let [cic3Config, setCiC3Config] = useState(new Map(CiCAPI.getConfig("cic3") as ConfigMap)),
        [cic2Config, setCiC2Config] = useState(new Map(CiCAPI.getConfig("cic2") as ConfigMap)),
        [moobleConfig, setMoobleConfig] = useState(new Map(CiCAPI.getConfig("mooble") as ConfigMap));;

    async function handleResetConfigs() {
        await CiCAPI.resetConfigs(true);
        setCiC3Config(new Map(CiCAPI.getConfig("cic3") as ConfigMap));
        setCiC2Config(new Map(CiCAPI.getConfig("cic2") as ConfigMap));
        setMoobleConfig(new Map(CiCAPI.getConfig("mooble") as ConfigMap));
    }

    async function handleApplyConfigs() {
        CiCAPI.setConfig("cic3", cic3Config);
        CiCAPI.setConfig("cic2", cic2Config);
        CiCAPI.setConfig("mooble", moobleConfig);
        props.onClose();
    }

    return (
        <div className="settings-panel">
            <div className="settings-panel-label">
                <span>Settings</span>
            </div>
            <button className="settings-panel-close-btn" onClick={() => props.onClose()}><FontAwesomeIcon icon={faWindowClose} /></button>
            <div className="settings-panel-content">
                <SettingsPanelGroup label="CiC3" configPath="cic3" configMap={cic3Config} />
                <SettingsPanelGroup label="Mooble" configPath="mooble" configMap={moobleConfig} />
                <SettingsPanelGroup label="CiC2" configPath="cic2" configMap={cic2Config} />
            </div>
            <div className="settings-panel-btn-container">
                <button onClick={handleResetConfigs}>Reset</button>
                <button onClick={handleApplyConfigs}>Apply</button>
            </div>
        </div>
    );
}

//=============================================================================
function SettingsPanelGroup(props: ISettingsPanelGroupProps) {
    let [, forceUpdate] = useState(),
        configEntries: Array<configEntry> = Array.from(props.configMap.entries()) as Array<configEntry>;

    function handleChange(key: string, value: ConfigValue) {
        props.configMap.set(key, value);
        forceUpdate({} as any);
    }

    if (props.configPath === "mooble") {
        let priorityEntries: Array<configEntry> = [],
            noPriorityEntries: Array<configEntry> = [];

        configEntries.forEach((entry: configEntry) => {
            let entryName: string = entry[0] as string;
            if (entryName === "client") {
                priorityEntries[0] = entry;
            } else if (entryName === "region") {
                priorityEntries[1] = entry;
            } else if (entryName === "partnership") {
                priorityEntries[2] = entry;
            } else {
                noPriorityEntries.push(entry);
            }
        });

        configEntries = ([] as Array<configEntry>).concat(priorityEntries, noPriorityEntries);
    }
    // cic3 order first
    // client / region / parternership

    return (
        <div className="settings-panel-config-group">
            <div className="settings-panel-label">{props.label}</div>
            <div className="settings-panel-config-entries">
                {configEntries.map(entry => <SettingsEntry key={props.label + entry[0]} label={entry[0] as string} path={props.configPath} value={entry[1] as string} onChange={handleChange} />)}
            </div>
        </div>
    );
}

//=============================================================================
function SettingsEntry(props: ISettingsEntryProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.onChange(props.label, e.target.value);
    }

    return (
        <div className="settings-panel-config-entry">
            <div className="settings-panel-config-entry-label">{props.label}</div>
            <input className="settings-panel-config-entry-input" type="text" value={props.value} onChange={handleChange} />
        </div>
    );
}