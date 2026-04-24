import CsvDownloadButton from "./CsvDownloadButton";

interface HeaderProps {
  publishedAt: string;
}

export default function Header({ publishedAt }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <img
          className="header-logo"
          src="/ILR_Cornell_Lockup_White.png"
          alt="Cornell University ILR School"
        />
        <div className="header-title-block">
          <h1>OSHA Inspection Data Analytics</h1>
          <p>Climate Jobs Institute &middot; NAICS 518210</p>
        </div>
      </div>
      <div className="header-right">
        <span className="header-refreshed">
          Last refreshed: {publishedAt || "—"}
        </span>
        <CsvDownloadButton />
      </div>
    </header>
  );
}
