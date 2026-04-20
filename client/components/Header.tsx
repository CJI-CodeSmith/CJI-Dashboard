import React from 'react';
import CsvDownloadButton from "./CsvDownloadButton"

//This is where we want to display the  Project name
//We also need  to house the button to handle CSV Download
//make sure to include props for csv button
//add a last refreshed display portion: Optional 

interface HeaderProps {
    csvData : string;
}

export default function Header({csvData}:HeaderProps) {
    return(
        <header>
        <h1>OSHA Data Center Inspection Dashboard</h1>
        <p>Cornell Climate Jobs Institute - NAICS 5181210</p>
        <CsvDownloadButton data={csvData} />
        </header>
    );
};