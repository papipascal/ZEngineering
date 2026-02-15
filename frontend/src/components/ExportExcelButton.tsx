import { Button } from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface Props {
  data: Record<string, unknown>[];
  columns: { key: string; header: string }[];
  fileName: string;
  sheetName?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function ExportExcelButton({ data, columns, fileName, sheetName = 'Sheet1', size = 'small' }: Props) {
  const handleExport = () => {
    const rows = data.map((row) =>
      Object.fromEntries(columns.map((col) => [col.header, row[col.key] ?? '']))
    );
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = columns.map((col) => {
      const maxLen = Math.max(
        col.header.length,
        ...data.map((r) => String(r[col.key] ?? '').length),
      );
      return { wch: Math.min(maxLen + 2, 50) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button
      variant="outlined"
      size={size}
      startIcon={<ExportIcon />}
      onClick={handleExport}
      disabled={data.length === 0}
    >
      Export Excel
    </Button>
  );
}
