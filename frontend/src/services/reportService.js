import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportThreatsPDF = (threats) => {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Cloud Security Report", 14, 20);

    doc.setFontSize(11);
    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        30
    );

    const rows = threats.map((item) => [
        item.id,
        item.title,
        item.severity,
        item.source,
        item.status,
    ]);

    autoTable(doc, {
        startY: 40,
        head: [["ID", "Title", "Severity", "Source", "Status"]],
        body: rows,
    });

    doc.save("Cloud_Security_Report.pdf");
};

export const exportThreatsExcel = (threats) => {

    const worksheet = XLSX.utils.json_to_sheet(threats);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Threats"
    );

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const file = new Blob(
        [excelBuffer],
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );

    saveAs(file, "Cloud_Security_Report.xlsx");

};
export const exportAnalyticsReport = (threats) => {

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Cloud Security Analytics Report", 14, 20);

    doc.setFontSize(11);
    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        30
    );

    const critical = threats.filter(
        t => t.severity === "Critical"
    ).length;

    const high = threats.filter(
        t => t.severity === "High"
    ).length;

    const medium = threats.filter(
        t => t.severity === "Medium"
    ).length;

    const low = threats.filter(
        t => t.severity === "Low"
    ).length;

    autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value"]],
        body: [
            ["Total Threats", threats.length],
            ["Critical", critical],
            ["High", high],
            ["Medium", medium],
            ["Low", low],
        ],
    });

    doc.save("Cloud_Security_Analytics_Report.pdf");

};