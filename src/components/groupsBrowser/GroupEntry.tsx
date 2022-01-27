import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare, faMinusSquare, IconDefinition, faBullseye, faCrown, faRuler } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "client-ui-toolkit";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import GroupNode from "./GroupNode";

interface IGroupEntryProps {
    catalog: ICatalog,
    isLargeMode: boolean,
    isCollapsed?: boolean,
    isSelected: boolean,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    onSelectionChanged: Function,
    onSelectOnlyCatalogSelected: Function
}

export default function GroupEntry(props: IGroupEntryProps) {
    let [loading, setLoading] = useState(false),
        [isCollapsed, setCollapsed] = useState(true),
        [showSelectOnly, setShowSelectOnly] = useState(false),
        [groups, setGroups] = useState<Array<ICatalogGroup>>([]),
        collapseIcon: IconDefinition,
        entryRef: MutableRefObject<HTMLDivElement | null> = useRef(null),
        mouseOverRef: MutableRefObject<boolean> = useRef(false),
        uomIcon: IconDefinition | undefined,
        uomClassName: string = "",
        groupEntryClassNames = ["group-entry"];

    function handleCheckboxChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        props.onSelectionChanged(props.catalog, ev.target.checked);
    }

    function handleMouseEnter(ev: React.MouseEvent) {
        mouseOverRef.current = true;
        setShowSelectOnly(true);
    }

    function handleSelectOnly() {
        props.onSelectOnlyCatalogSelected(props.catalog);
    }

    useEffect(() => {
        function handleMouseMove(ev: MouseEvent) {
            if (entryRef.current && mouseOverRef.current) {
                let rect: DOMRect = entryRef.current.getBoundingClientRect(),
                    mouseX: number = ev.clientX,
                    mouseY: number = ev.clientY;

                if (mouseX < rect.x || mouseX > (rect.x + rect.width) || mouseY < rect.y || mouseY > (rect.y + rect.height)) {
                    // set mouse over to false
                    setShowSelectOnly(false);
                    mouseOverRef.current = false;
                }
            }
        }

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    useEffect(() => {
        let fetchGroups = async () => {
            let groups: Array<ICatalogGroup>;

            setLoading(true);

            try {
                groups = await CiCAPI.content.getCatalogGroups(props.catalog.id);
            } catch (e) {
                // no groups for catalog
                groups = [];
            }

            setLoading(false);
            setGroups(groups);
        }

        if (isCollapsed !== undefined) {
            setCollapsed(isCollapsed);
        }

        if (!isCollapsed) {
            fetchGroups();
        }

    }, [isCollapsed]);

    if (isCollapsed) {
        collapseIcon = faPlusSquare;
    } else {
        collapseIcon = faMinusSquare;
    }

    if (props.catalog.measurementSystem) {
        if (props.catalog.measurementSystem.toLowerCase() === "imperial") {
            uomIcon = faCrown;
            uomClassName = "catalog-entry-uom-imperial";
        } else {
            uomIcon = faRuler;
            uomClassName = "catalog-entry-uom-metric";
        }
    }

    let isLargeEnough: boolean = props.isLargeMode;
    if (!isLargeEnough) {
        groupEntryClassNames.push("group-entry-small");
    }

    return (
        <div className={groupEntryClassNames.join(" ")}>
            <div className="group-entry-catalog-detail-container" ref={entryRef} onMouseEnter={handleMouseEnter}>
                {showSelectOnly &&
                    <button className="group-entry-select-only-btn" title="select only" onClick={handleSelectOnly}>
                        <FontAwesomeIcon icon={faBullseye} />
                    </button>
                }

                <div className="group-entry-catalog-selector">
                    <input type="checkbox" checked={props.isSelected} onChange={handleCheckboxChanged} />
                    <span className="group-entry-catalog-name">{props.catalog.name}{!isLargeEnough && ` (v${props.catalog.version.replace(/\.(\d{1,2}).*/, ".$1")})`}</span>
                    {
                        isLargeEnough &&
                        [
                            <span key="info" className="group-entry-catalog-info">v{props.catalog.version.replace(/\.(\d{1,2}).*/, ".$1")}</span>,
                            <span key="date" className="group-entry-catalog-date">{props.catalog.updatedDate.replace(/T.*/, "")}</span>
                        ]
                    }

                    <button className="group-collapse-btn" onClick={() => setCollapsed(!isCollapsed)}>
                        <FontAwesomeIcon icon={collapseIcon} />
                    </button>
                </div>

                {
                    isLargeEnough &&
                    [
                        <div key="details" className="catalog-entry-details">
                            <div className="catalog-id">
                                <span className="catalog-entry-details-label">id:</span>
                                <span>{props.catalog.id}</span>
                            </div>
                            <div className="catalog-version">
                                <span className="catalog-entry-details-label">version:</span>
                                <span>{props.catalog.version}</span>
                            </div>
                        </div>,
                        <div key="tstamp" className="catalog-entry-timestamp">
                            <span className="catalog-entry-details-label">updated:</span>
                            <span>{props.catalog.updatedDate.replace(/T|\.\d+$/g, " ").trim()}</span>
                            <span className="catalog-status">{props.catalog.status}</span>
                            {uomIcon && <span className={uomClassName}><FontAwesomeIcon title={props.catalog.measurementSystem} icon={uomIcon} /></span>}
                        </div>
                    ]
                }
            </div>
            {loading && <Loader />}
            {!isCollapsed &&
                <div className="group-node-children">
                    {groups.map((group: ICatalogGroup, idx: number) =>
                        <GroupNode
                            key={props.catalog.id + group.code}
                            catalog={props.catalog}
                            group={group}
                            selectedGroups={props.selectedGroups}
                            onGroupsSelected={props.onGroupsSelected}
                        />)}
                </div>
            }
        </div>
    );
}