export default function CsvDownloadButton() {
  return (
    <a href="/api/download-csv" download className="csv-download-button">
      Download CSV
    </a>
  );
}
