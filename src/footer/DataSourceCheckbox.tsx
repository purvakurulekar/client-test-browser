import React from "react";

interface IDataSourceCheckboxProps {
    source: string,
    label: string,
    isChecked: boolean,
    onChange: Function
}

//=============================================================================
export default function DataSourceCheckbox(props: IDataSourceCheckboxProps) {
    let inputId: string = `${props.source}-source`;

    return (
        <div className="centered-flex">
            <input id={inputId} type="checkbox" checked={props.isChecked || false} value="checked" onChange={(e) => props.onChange(e)} />
            <label htmlFor={inputId}>{props.label}</label>
        </div>
    );
}