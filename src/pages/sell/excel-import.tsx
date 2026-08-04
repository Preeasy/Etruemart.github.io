import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import Layout from '@/components/Layout';
import Link from 'next/link';

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  noImage: number;
  noCategory: number;
  errors: string[];
}

export default function ExcelImportPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (sessionStatus === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <ShieldAlert className="w-12 h-12 text-ink-300 mb-3" />
          <p className="text-lg font-bold text-navy-800 mb-1">Admin access required</p>
          <p className="text-sm text-ink-500">Only administrators can import products.</p>
        </div>
      </Layout>
    );
  }

  const handleFile = async (file: File) => {
    setError('');
    setResult(null);
    setFileName(file.name);

    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 获取表头
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
      if (rawRows.length < 2) {
        setError('Excel data insufficient (need at least header + 1 row)');
        return;
      }

      const headers = rawRows[0] as string[];
      const dataRows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      setParsedHeaders(headers);
      setParsedRows(dataRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setError('');

    try {
      const res = await fetch('/api/products/excel-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parsedRows,
          headers: parsedHeaders,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Excel Batch Import - Admin</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/sell/new" className="text-ink-400 hover:text-navy-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <FileSpreadsheet className="w-7 h-7 text-accent-500" />
          <h1 className="text-2xl font-bold text-navy-800">Excel Batch Import</h1>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-accent-500 bg-accent-50'
              : 'border-ink-200 hover:border-accent-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          {fileName ? (
            <>
              <p className="text-lg font-semibold text-navy-800">{fileName}</p>
              <p className="text-sm text-ink-500 mt-1">
                {parsedRows.length} rows parsed - Click to change file
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-navy-800">
                Drop Excel file here or click to upload
              </p>
              <p className="text-sm text-ink-500 mt-1">
                Supports .xlsx, .xls, .csv - Images auto-matched from GitHub
              </p>
            </>
          )}
        </div>

        {/* Preview */}
        {parsedRows.length > 0 && !result && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                <span className="font-semibold text-navy-800">
                  Preview ({parsedRows.length} rows)
                </span>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {parsedRows.length} Products
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {parsedHeaders.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-medium text-ink-600 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-ink-50">
                        {parsedHeaders.map((h, j) => (
                          <td key={j} className="px-3 py-2 text-ink-700 whitespace-nowrap">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="px-4 py-2 text-center text-sm text-ink-400 border-t border-ink-100">
                  ... and {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Import Complete</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{result.created}</p>
                    <p className="text-ink-500">Created</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                    <p className="text-ink-500">Updated</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-500">{result.noImage}</p>
                    <p className="text-ink-500">No Image</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">{result.skipped}</p>
                    <p className="text-ink-500">Skipped</p>
                  </div>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="font-semibold text-orange-800 mb-2">
                  Errors ({result.errors.length})
                </p>
                <ul className="text-sm text-orange-700 space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-lg font-medium hover:bg-navy-900 transition-colors"
              >
                View Products
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setParsedRows([]);
                  setParsedHeaders([]);
                  setFileName('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-ink-200 text-navy-800 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!parsedRows.length && !result && (
          <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">Excel Format Guide</h3>
            <p className="text-sm text-blue-700 mb-3">
              The system auto-detects columns by name. Here are the supported column headers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-600">
              <div><strong>Item No / Item / 编号</strong> - Used to match images from GitHub</div>
              <div><strong>SKU</strong> - Product SKU</div>
              <div><strong>Product Name (EN) / Product Name</strong> - English name</div>
              <div><strong>Product Name (CN)</strong> - Chinese name</div>
              <div><strong>Price (Min) / Price</strong> - Minimum price</div>
              <div><strong>Price (Max)</strong> - Maximum price</div>
              <div><strong>MOQ</strong> - Minimum order quantity</div>
              <div><strong>Category L1 / Category</strong> - Primary category</div>
              <div><strong>Category L2</strong> - Sub category (optional)</div>
              <div><strong>Material / Color / Size</strong> - Attributes (optional)</div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Image matching:</strong> Images are auto-matched from the GitHub repository
                (<code className="text-xs bg-blue-100 px-1 rounded">Preeasy/images/Images</code>)
                using the Item No column (e.g., <code className="text-xs bg-blue-100 px-1 rounded">YCS-ACC-001</code>).
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
