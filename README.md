# Cornell Climate Jobs Institute - OSHA Data Dashboard

> **Disclaimer:** This prototype was built as part of a client-student partnership through Codesmith’s Future Code program. It explores solutions to a real-world case study provided by an external partner. This work does not represent employment or contracting with the partner. All intellectual property belongs to the partner. This is a time-boxed MVP and not a production system.

## Project Overview

The OSHA Data Dashboard is a prototype web application and data pipeline designed to support research for the **Cornell Climate Jobs Institute**. Its primary objective is to analyze and surface patterns in workplace safety, union status, and inspection activity within the United States data center industry. 

This project serves as an MVP to validate a programmatic data-to-visualization workflow. It automates the extraction of inspection records from the Department of Labor API, specifically targeting data centers (NAICS code 518210). The pipeline cleans and transforms raw data before utilizing the Datawrapper API to dynamically generate charts. These visualizations are then presented through a React-based frontend dashboard.

**Key Objectives:**

* **Automated Ingestion:** Programmatically fetch and filter 5 years of historical OSHA inspection data.
* **Data Transformation:** Clean and aggregate raw government data into structured formats suitable for charting.
* **Insight Generation:** Visualize critical industry metrics, including safety versus health inspection breakdowns and comparisons of inspection patterns across union and non-union facilities.

## Tech Stack

**Languages**

* **TypeScript / JavaScript:** Core programming languages utilized across both the frontend client and backend server.

**Frontend**

* **React:** UI construction utilizing core state hooks and `useEffect` for data synchronization.
* **Vite:** Frontend build tool and bundler used for rapid development and optimized production builds.
* **CSS:** Styling language for designing Dashboard user interface.

**Backend & Data Processing**

* **Node.js:** Server environment handling secure external API requests, data cleaning, and pipeline orchestration.
* **json-2-csv:** Data transformation utility used to convert processed JSON inspection data into the CSV format required by datawrapper

**APIs & Visualization**

* **Department of Labor (DOL) API:** Primary data source for fetching raw OSHA inspection records.
* **Datawrapper API:** Utilized on the backend for programmatic dataset uploading, chart generation, and publishing.

## Setup Instructions

To run this project locally, you will need to configure your environment variables. Create a `.env` file inside the `server/` directory and add the following keys:

```env
# Department of Labor API Key (from data.dol.gov)
DOL_API_KEY=your_dol_api_key_here

# Datawrapper Personal Access Token
DWAPI_KEY=your_datawrapper_token_here

# Local Server Port (server defaults to 8888 if unset)
PORT=5000
```

## Project Structure

```
CJI-Dashboard/
├── client/   # React + Vite frontend (dashboard UI)
└── server/   # Node.js + TypeScript backend (DOL fetch, transform, Datawrapper publishing)
```

## How to Run

```
Add Npm run concurrently to simulaneously start front & back end
```


## Architecture Summary

> **Status (WIP):** The flow below describes the target design. Today, the 30-day cache refresh path and the dynamic handoff of chart IDs to the frontend are still being wired up — the React app currently renders hardcoded Datawrapper embeds rather than IDs returned by the backend.

The application utilizes a time-based caching  to minimize unnecessary external API calls, executing data transformations and chart generation only when required.

**Data Flow:**

1.  **Initialization & Cache Check:** On server startup, the backend checks for the existence of `chartsInfo.json`, a local file containing chart metadata and the last data fetch timestamp. If the file exists and the last fetch occurred within the last 30 days, the server bypasses the data pipeline and serves the existing charts to the frontend.
2.  **Data Extraction (DOL API):** If `chartsInfo.json` is missing, or if the 30-day cache has expired, the Node.js server queries the Department of Labor (DOL) API for the latest inspection dataset.
3.  **Cleaning & Transformation:** The raw JSON payload is processed to decode internal letter codes into human-readable language.
4.  **Aggregation:** The transformed JSON is mapped and tallied to calculate specific metrics, resulting in three distinct datasets:
    * Union vs. Non-Union facilities
    * Safety vs. Health inspection focus
    * Inspection type breakdowns
5.  **CSV Generation & Formatting:** The three aggregated datasets are converted into individual CSV files. These files are programmatically flattened to match Datawrapper's strict formatting requirements.
6.  **Chart Creation & Publishing (Datawrapper API):** A single function sequentially transmits the three CSV files to the Datawrapper API. The API generates and publishes them.
7.  **Metadata Storage:** Upon successful publishing, the chart IDs and the new fetch timestamp are saved into the `chartsInfo.json` array. This metadata is then passed to the React frontend to render the embed codes and resets the 30-day update cycle.

## Limitations

* **Prototype scope:** Built as a time-boxed MVP for a Codesmith Future Code partnership — not hardened for production use.
* **Industry-specific:** The DOL query is hardcoded to NAICS code `518210` (data centers). Other industries are out of scope without code changes.
* **Bounded historical window:** Ingestion is limited to roughly the last 5 years of OSHA inspection records.
* **Cache staleness:** The 30-day refresh cycle means the dashboard can surface data up to a month behind the DOL source.
* **No authentication:** The backend API is unauthenticated; intended for local/internal use only.
* **Third-party limits:** Datawrapper free-tier rate and quota limits apply to chart creation and publishing.

## Scalability

## Screenshots