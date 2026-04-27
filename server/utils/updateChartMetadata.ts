export default function updateChartMetadata(chartType: string) {
  const piePalette = [
    "#4A7C9E",
    "#5A9E7C",
    "#9E7A4A",
    "#7A6E9E",
    "#9E9E4A",
    "#4A9E9E",
    "#9E4A6E",
    "#6E9E4A",
    "#4A6E9E",
    "#9E6E4A",
  ];

  const barPalette = [
    "#5A9E7C",
    "#4A7C9E",
    "#9E6E4A",
    "#7A6E9E",
    "#4A9E9E",
    "#9E9E4A",
    "#6E9E4A",
    "#9E4A6E",
    "#4A6E9E",
    "#9E7A4A",
  ];

  const stackedBarPalette = [
    "#7A6E9E",
    "#4A7C9E",
    "#5A9E7C",
    "#9E9E4A",
    "#4A9E9E",
    "#9E7A4A",
    "#6E9E4A",
    "#9E4A6E",
    "#9E6E4A",
    "#4A6E9E",
  ];

  switch (chartType) {
    case "d3-pies":
    case "d3-donuts":
    case "d3-multiple-pies":
    case "d3-multiple-donuts":
      return {
        "convert-values-to-percentages": true,
        "value-label-format": "0%",
        "show-values": true,
        "custom-colors": piePalette,
      };
    case "d3-bars":
      return {
        "value-label-visibility": "show",
        "value-label-format": "0%",
        "value-label-mode": "right",
        "custom-colors": barPalette,
      };
    case "d3-bars-stacked":
      return {
        "stack-percentages": true,
        "value-label-visibility": "show",
        "value-label-format": "0%",
        "custom-colors": stackedBarPalette,
      };
    default:
      return null;
  }
}
