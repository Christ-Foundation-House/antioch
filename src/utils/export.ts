import {
  args_tools_valuesToString,
  tools_valuesToString,
} from "@/scripts/tools";
import { TableProps } from "antd";
import { Excel } from "antd-table-saveas-excel";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

export async function exportGraph({
  divRef,
  fileName,
  backgroundColor = "#161E27", // Default background color if none is provided
}: {
  divRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
  backgroundColor?: string;
}) {
  if (divRef.current) {
    // Save the original background color
    const originalBackgroundColor = divRef.current.style.backgroundColor;

    // Temporarily change the background color
    divRef.current.style.backgroundColor = backgroundColor;

    // Capture the screenshot
    const canvas = await html2canvas(divRef.current);
    const dataURL = canvas.toDataURL("image/png");

    // Restore the original background color
    divRef.current.style.backgroundColor = originalBackgroundColor;

    // Create and click the download link
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = fileName ?? "chart.png";
    link.click();
  }
}

export function exportTable({
  type,
  data,
  fileNamePrefix = "Wicf",
  columns,
}: {
  type: args_tools_valuesToString["type"];
  data: any[];
  fileNamePrefix: string;
  columns: TableProps["columns"] | undefined;
}) {
  const excel = new Excel();
  const cleanArray = (arr) => arr.map(({ width, render, ...rest }) => rest);
  const dataForExcel = tools_valuesToString({ type, values: data });
  if (!Array.isArray(dataForExcel)) {
    toast.error("Error exporting data is not array");
    return;
  }
  console.log("dataString", dataForExcel);
  const time = new Date();
  const fileName = `${fileNamePrefix ?? "WICF_Members"}-${time.toDateString()}-${
    time.getHours() + "_" + time.getMinutes()
  }${type ? "-" + type : null}.xlsx`;
  // console.log(fileName);
  if (dataForExcel) {
    excel
      .addSheet("Wicf" + `-${type}`)
      .addColumns(cleanArray(columns))
      .addDataSource(dataForExcel)
      .saveAs(fileName);
  }
}
