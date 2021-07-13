export interface IHelpAPIEntryObjArg {
    [key: string]: string | IHelpAPIEntryObjArg | number | Array<string>
}

export interface IHelpAPIEntry {
    apiEntry: string,
    apiDescription?: string,
    apiArgDetails?: string | IHelpAPIEntryObjArg | number | Array<string>,
    apiReturns: string
}
export interface IHelpData {
    apiNameSpace: string,
    footerNote?: string,
    apiEntrys: Array<IHelpAPIEntry>
}

export type IHelpType = IHelpData | IHelpAPIEntry | void;

//=============================================================================
export default function PrintHelp(helpData: IHelpData, specificApi?: string): IHelpData | IHelpAPIEntry | void {
    let allMsgs = [],
        allStyles = [],
        returnHelpData: IHelpData | IHelpAPIEntry | void,
        entry;

    allMsgs.push(`%c${helpData.apiNameSpace}%c`);
    allStyles.push(BIG_HEADER_CSS, "");

    if (specificApi) {
        // detailed view
        specificApi = specificApi.toLowerCase();
        returnHelpData = helpData.apiEntrys.find(possibleHelpInfo => possibleHelpInfo.apiEntry.toLowerCase().includes(specificApi!));
        if (returnHelpData) {
            // @ts-ignore
            entry = _genHelpSegment(...Object.values(returnHelpData));
            allMsgs.push(entry[0]);
            allStyles.push(...entry[1]);
        }
    } else {
        returnHelpData = helpData;
        // summary view
        returnHelpData.apiEntrys.forEach(helpInfo => {
            allMsgs.push("%c" + helpInfo.apiEntry);
            allStyles.push(API_NAME_CSS);
        });

        if (returnHelpData.footerNote) {
            allMsgs.push("%c" + returnHelpData.footerNote);
            allStyles.push(FOOTER_TEXT_CSS);
        }

    }

    console.log(allMsgs.join("\n"), ...allStyles);

    return returnHelpData;
}

//=============================================================================
function _genHelpSegment(apiMethodEntry: string, apiDescription: string, methodArgs: object, returnStructure: any) {
    let message: string,
        styles: Array<string> = [],
        argsList: Array<string> = _argsToString(methodArgs),
        noArgs: boolean = argsList.length === 0;

    if (noArgs) {
        argsList.push("%c- no arguments -");
    }
    message = `
%c Method: %c
%c${apiMethodEntry}
%c${apiDescription}
%c Arguments: %c
${argsList.join("\n")}
%c Returns: %c
%c${returnStructure}
    `;

    styles.push(METHOD_HEADER_CSS, "", API_NAME_CSS, API_DESCR_CSS, ARGS_HEADER_CSS, "");

    if (noArgs) {
        styles.push(SMALL_TEXT_CSS);
    } else {
        styles = styles.concat(...argsList.map(() => [ARG_NAME_CSS, SMALL_TEXT_CSS]));
    }

    styles.push(RETURNS_HEADER_CSS, "", SMALL_TEXT_CSS);

    return [message, styles];
}

//=============================================================================
function _argsToString(args: object) {
    let optionEntries: Array<string> = Object.entries(args)
        .map(entry => {
            let argLine: string = `%c ${entry[0]} %c\n`;

            if (Array.isArray(entry[1])) {
                argLine += `\t[${typeof (entry[1][0])}]`
            } else if (typeof (entry[1]) === "object") {
                argLine += Object.entries(entry[1])
                    .map(entry => `\t${entry[0]}: ${entry[1]}`)
                    .join("\n");
            } else {
                argLine += `\t${entry[1]}`;
            }
            return argLine;
        }) || [];

    return optionEntries;
}


export const
    HUGE_HEADER_CSS = `
    display:block;
font-size: 18px; 
background-color: #a3a3a3; 
color: #fff; 
border: 1px SOLID #d3d3d3; 
border-radius: 10px;
padding: 3px; 
font-weight: bold;
margin-bottom: 10px;
`,
    BIG_HEADER_CSS = `
    display:block;
font-size: 16px; 
background-color: #a3a3a3; 
color: #fff; 
border: 1px SOLID #d3d3d3; 
border-radius: 10px;
padding: 3px; 
font-weight: bold;
margin-bottom: 10px;
`,
    API_NAME_CSS = `
font-size: 14px; 
background-color: inherit; 
color: #000;
`,

API_DESCR_CSS = `
margin-top: 6px;
margin-bottom: 6px;
font-size: 11px; 
background-color: inherit; 
color: #000;
`,
    METHOD_HEADER_CSS = `
    display:block;
font-size: 12px; 
background-color: #ffa242; 
color: #464646; 
border: 1px SOLID #d3d3d3; 
font-weight: bold; 
padding: 3px; 
border-radius: 10px;
margin-bottom: 10px;
`,
    ARGS_HEADER_CSS = `
    display:block;
margin-top: 10px;
margin-bottom: 10px;
font-size: 12px; 
background-color: #30c6ff; 
color: #fff; 
border: 1px SOLID #d3d3d3; 
font-weight: bold; 
padding: 3px; 
border-radius: 10px;
`,
    ARG_NAME_CSS = `
font-size: 10px; 
font-weight: bold; 
color: #fff; 
background-color: inherit; 
color: #000;
`,
    SMALL_TEXT_CSS = `
font-size: 10px; 
background-color: inherit; 
color: #000;
`,
    RETURNS_HEADER_CSS = `
display:block;
margin-top: 10px;
margin-bottom: 10px;
font-size: 12px; 
background-color: #73ff62; 
color: #464646; 
border: 1px SOLID #d3d3d3; 
font-weight: bold; 
padding: 3px; 
border-radius: 10px;
`,
    FOOTER_TEXT_CSS = `
margin-top: 10px;
margin-bottom: 10px;
padding-top: 6px;
padding-bottom: 6px;
border-top: 2px DASHED #d3d3d3;
border-bottom: 2px DASHED #d3d3d3;
font-size: 9px; 
background-color: inherit; 
color: #000;
`;