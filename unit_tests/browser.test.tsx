import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react"; // latest testing framework
import "@testing-library/jest-dom/extend-expect"; // add custom jest matchers from jest-dom
//import userEvent from '@testing-library/user-event';
import CatalogBrowser from "../src/components/catalogbrowser/CatalogBrowser";

const fetch = require("node-fetch");
global.fetch = fetch;
require("fake-indexeddb/auto");

const DEFAULT_CICAPI_SRC_URL = "http://localhost:2020/content-platform/client-api/dist/debug/cicapi.web.js";
// const DEFAULT_CICAPI_SRC_URL = "https://clientapi-dev.2020-contentplatform.net/cicapi.web.js";

//=============================================================================
async function _importCiCAPI(apiCodeUrl) {
    let response = await fetch(apiCodeUrl),
        code;

    code = await response.text();
    try {
        new Function(code)();
    } catch (e) {
        console.log("Error initializing CiCAPI...", e);
    }
}

//=============================================================================

function baseTests() {
    let { debug, container } = render(<CatalogBrowser includeDataSourceSwitcher={true} />);
    return {
        debug,
        container
    }
}

//=============================================================================
beforeAll(async () => {
    // stubb scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    // jest.setTimeout(6000);
    await _importCiCAPI(DEFAULT_CICAPI_SRC_URL);
    try {
        // @ts-ignore -- imported with _importCiCAPI
        await CiCAPI.init();
    } catch (e) {
        console.log("Error initializing CiCAPI....", e);
    }

    //console.log("Setup Complete, begining test...");
});


describe("CatalogBrowser Basic UI Checks", () => {
    it("No catalogs loaded check", async () => {
        let { debug, container } = baseTests(),
            selectedCat = container.getElementsByClassName("catalog-selector-toggle-label"),
            buttonsContainer = container.getElementsByClassName("catalog-browser-action-btn-container");
        expect(selectedCat[0].textContent).toEqual("No Catalogs Loaded.");

        expect(buttonsContainer).toBeDefined();
        let replaceBtn = screen.getByRole("button", { name: "Replace" }),
            addBtn = screen.getByRole("button", { name: "Add" });
        expect(replaceBtn).toBeDisabled();
        expect(addBtn).toBeDisabled();

        let cic2ChkBx = document.getElementById("CiC2-source"),
            cic3ChkBx = document.getElementById("CiC3-source");
        expect(cic2ChkBx).not.toBeChecked();
        expect(cic3ChkBx).not.toBeChecked();

    });

    it("Check CiC3 checkbox", async () => {
        let { debug, container } = baseTests(),
            cic3ChkBx,
            catalogToggleBtnLabel;
        cic3ChkBx = document.getElementById("CiC3-source")
        expect(cic3ChkBx).not.toBeChecked();
        catalogToggleBtnLabel = container.getElementsByClassName("catalog-selector-toggle-label")[0];
        expect(catalogToggleBtnLabel).toBeInTheDocument();
        expect(catalogToggleBtnLabel.textContent).toEqual("No Catalogs Loaded.");
        fireEvent.click(cic3ChkBx);

        expect(cic3ChkBx).toBeChecked();
        expect(catalogToggleBtnLabel.textContent).toEqual("No Catalogs Loaded."); // for now, no endpoint connected
        fireEvent.click(cic3ChkBx);
        await act(() => waitFor(() => { }));
        expect(cic3ChkBx).not.toBeChecked();
    });

    it("Check Mooble checkbox", async () => {
        let { debug, container } = baseTests(),
            moobleChkBx,
            catalogToggleBtnLabel;
        moobleChkBx = document.getElementById("Mooble-source")
        expect(moobleChkBx).not.toBeChecked();
        catalogToggleBtnLabel = container.getElementsByClassName("catalog-selector-toggle-label")[0];
        expect(catalogToggleBtnLabel).toBeInTheDocument();
        expect(catalogToggleBtnLabel.textContent).toEqual("No Catalogs Loaded.");
        fireEvent.click(moobleChkBx);
        await act(() => waitFor(() => expect(container.querySelector(".catalog-product-entry")).toBeTruthy(), {
            timeout: 10000,
            onTimeout: (error: Error) => { console.log("\n\n\n WAITING TIMED OUT !!!!! \n\n\n"); return error; }
        }));
        expect(moobleChkBx).toBeChecked();
        expect(catalogToggleBtnLabel.textContent).toEqual("All Selected"); // for now, no endpoint connected
        fireEvent.click(moobleChkBx);
        await act(() => waitFor(() => { }));
        expect(moobleChkBx).not.toBeChecked();
    });

    it("Check CiC2 checkbox", async () => {
        let { debug, container } = baseTests(),
            cic2ChkBx,
            catalogToggleBtnLabel;
        cic2ChkBx = document.getElementById("CiC2-source")
        expect(cic2ChkBx).not.toBeChecked();
        catalogToggleBtnLabel = container.getElementsByClassName("catalog-selector-toggle-label")[0];
        expect(catalogToggleBtnLabel).toBeInTheDocument();
        expect(catalogToggleBtnLabel.textContent).toEqual("No Catalogs Loaded.");
        fireEvent.click(cic2ChkBx);
        await act(() => waitFor(() => expect(container.querySelector(".catalog-product-entry")).toBeTruthy(), {
            timeout: 10000,
            onTimeout: (error: Error) => { console.log("\n\n\n WAITING TIMED OUT !!!!! \n\n\n"); return error; }
        }));
        expect(cic2ChkBx).toBeChecked();
        expect(catalogToggleBtnLabel.textContent).toEqual("All Selected");
        fireEvent.click(cic2ChkBx);
        await act(() => waitFor(() => { }));
        expect(cic2ChkBx).not.toBeChecked();
    });

});

