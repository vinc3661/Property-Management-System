
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import type { PropertyTenantImport } from "../types/propertyTenantImport";
import { extractFileContent } from "../utils/fileExtraction";

type TenantBulkProps = {
  onImportPropertiesAndTenants: (
    records: PropertyTenantImport[]
  ) => Promise<void>;
};

type ImportError = {
  row: number;
  message: string;
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function getText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const text = getText(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";

  const date = new Date(`${text}T00:00:00`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text
    ? text
    : "";
}

function validateRows(rows: Record<string, unknown>[]) {
  const records: PropertyTenantImport[] = [];
  const errors: ImportError[] = [];
  const seenHouses = new Set<string>();

  rows.forEach((row, index) => {
    const data: Record<string, unknown> = {};

    Object.entries(row).forEach(([key, value]) => {
      data[normalizeHeader(key)] = value;
    });

    const houseNumber = getText(data.housenumber);
    const tenantName = getText(data.tenantname);
    const rentText = getText(data.rentamount);
    const rentAmount = Number(rentText);
    const leaseStart = parseDate(data.leasestart);

    const paymentStatus = getText(data.paymentstatus).toLowerCase();

    const amountText = getText(data.amountpaid);
    const amountPaid = amountText ? Number(amountText) : undefined;

    const paymentDateText = getText(data.paymentdate);
    const paymentDate = paymentDateText
      ? parseDate(data.paymentdate)
      : "";

    const rentMonth = getText(data.rentmonth);

    const rowErrors: string[] = [];

    if (!houseNumber) rowErrors.push("House number is missing.");
    if (!tenantName) rowErrors.push("Tenant name is missing.");

    if (!rentText || !Number.isFinite(rentAmount) || rentAmount <= 0) {
      rowErrors.push("Invalid monthly rent.");
    }

    if (!leaseStart) {
      rowErrors.push("Invalid lease start date. Use YYYY-MM-DD.");
    }

    if (!["paid", "pending", "unpaid"].includes(paymentStatus)) {
      rowErrors.push("Invalid payment status.");
    }

    const houseKey = houseNumber.toLowerCase();

    if (houseNumber && seenHouses.has(houseKey)) {
      rowErrors.push("Duplicate house number in this file.");
    }

    if (houseNumber) seenHouses.add(houseKey);

    if (amountText && (!Number.isFinite(amountPaid) || amountPaid! <= 0)) {
      rowErrors.push("Invalid payment amount.");
    }

    if (paymentStatus === "paid") {
      if (amountPaid === undefined) {
        rowErrors.push("Paid tenant requires an amount paid.");
      }

      if (!paymentDate) {
        rowErrors.push("Paid tenant requires a valid payment date.");
      }

      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rentMonth)) {
        rowErrors.push("Paid tenant requires a rent month (YYYY-MM).");
      }
    } else if (amountText || paymentDateText || rentMonth) {
      rowErrors.push(
        "Payment details should only be provided for paid tenants."
      );
    }

    if (rowErrors.length) {
      rowErrors.forEach((message) => {
        errors.push({ row: index + 2, message });
      });
      return;
    }

    records.push({
      houseNumber,
      tenantName,
      rentAmount,
      leaseStart,
      paymentStatus: paymentStatus as "paid" | "pending" | "unpaid",
      ...(amountPaid !== undefined
        ? { amountPaid, paymentDate, rentMonth }
        : {}),
    });
  });

  return { records, errors };
}

function parseDocumentText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: Record<string, unknown>[] = [];
  const errors: ImportError[] = [];

  const expectedHeaders = [
    "housenumber",
    "tenantname",
    "rentamount",
    "leasestart",
    "paymentstatus",
    "amountpaid",
    "paymentdate",
    "rentmonth",
  ];

  lines.forEach((line, index) => {
    const separator = line.includes("|") ? "|" : "\t";

    if (!line.includes("|") && !line.includes("\t")) {
      errors.push({
        row: index + 1,
        message: "Could not identify columns. Use | or tab separators.",
      });
      return;
    }

    const values = line.split(separator).map((value) => value.trim());

    if (
      values.map(normalizeHeader).join("|") ===
      expectedHeaders.join("|")
    ) {
      return;
    }

    if (values.length !== 8) {
      errors.push({
        row: index + 1,
        message: "Expected exactly 8 columns in this record.",
      });
      return;
    }

    rows.push(
      Object.fromEntries(
        expectedHeaders.map((header, columnIndex) => [
          header,
          values[columnIndex],
        ])
      )
    );
  });

  const validation = validateRows(rows);

  return {
    records: validation.records,
    errors: [...errors, ...validation.errors],
  };
}

export function TenantBulkForm({
  onImportPropertiesAndTenants,
}: TenantBulkProps) {
  const [records, setRecords] = useState<PropertyTenantImport[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  
  const importLock = useRef(false);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setRecords([]);
    setErrors([]);
    setMessage("");
    setFileName(file.name);

    try {
      const result = await extractFileContent(file);

      const parsed = result.rows
        ? validateRows(result.rows)
        : parseDocumentText(result.text);

      setRecords(parsed.records);
      setErrors(parsed.errors);

      if (parsed.records.length > 0 && parsed.errors.length === 0) {
        setMessage("File processed successfully. Review your records.");
      }

      if (parsed.records.length === 0 && parsed.errors.length === 0) {
        setErrors([
          { row: 0, message: "No tenant records were found." },
        ]);
      }
    } catch (error) {
      setErrors([
        {
          row: 0,
          message:
            error instanceof Error
              ? error.message
              : "Could not process this file.",
        },
      ]);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!records.length || errors.length || importLock.current) return;

    importLock.current = true;

    try {
      setImporting(true);
      setMessage("");

      await onImportPropertiesAndTenants(records);

      setMessage(`${records.length} records imported successfully!`);
      setRecords([]);
      setErrors([]);
      setFileName("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Import failed."
      );
    } finally {
      importLock.current = false;
      setImporting(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 rounded-2xl border border-white/10 bg-[#090909] p-4 text-white shadow-xl sm:p-6 lg:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Bulk Import
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-400">
            Import your existing properties and tenant records in one go.
          </p>
        </div>

        <span className="w-fit rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
          Bulk upload
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#111111] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white">
          Upload your records
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          Excel, CSV, Word, PDF, JPG, PNG and WEBP.
        </p>

        <label
          htmlFor="tenant-import-file"
          className={`mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/30 px-4 py-6 text-center transition hover:border-green-500/60 hover:bg-green-500/[0.04] ${
            loading || importing ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-green-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
              />
            </svg>
          </div>

          <span className="text-sm font-medium text-white">
            Choose a file to upload
          </span>
          <span className="mt-1 text-xs text-gray-500">
            Select a file from your device
          </span>
        </label>

        <input
          id="tenant-import-file"
          type="file"
          accept=".xlsx,.csv,.docx,.pdf,.jpg,.jpeg,.png,.webp,.bmp"
          onChange={handleFileChange}
          disabled={loading || importing}
          className="sr-only"
        />

        {fileName && (
          <div className="mt-3 flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-green-400">
              FILE
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-200">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                Selected for processing
              </p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111111] p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-green-400" />
          <p className="text-sm text-gray-300">
            Extracting and validating file contents...
          </p>
        </div>
      )}

      {records.length > 0 && (
        <div className="min-w-0 space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-white">
              Import preview
            </h3>
            <span className="text-xs text-green-400">
              {records.length} valid records
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">House</th>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Monthly rent</th>
                    <th className="px-4 py-3 font-medium">Lease start</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={`${record.houseNumber}-${index}`}
                      className="border-t border-white/[0.06] transition hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                        {record.houseNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {record.tenantName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-300">
                        KSh {record.rentAmount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                        {record.leaseStart}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            record.paymentStatus === "paid"
                              ? "bg-green-500/10 text-green-400"
                              : record.paymentStatus === "pending"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {record.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="border-t border-white/[0.06] px-4 py-3 text-xs text-gray-500 sm:hidden">
              Swipe horizontally to view all columns.
            </p>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
          <h3 className="mb-3 text-sm font-semibold text-red-400">
            Import errors ({errors.length})
          </h3>

          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm text-red-300">
            {errors.map((error, index) => (
              <li key={index} className="leading-5">
                {error.row > 0 ? `Row ${error.row}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            message.toLowerCase().includes("successfully")
              ? "border-green-500/20 bg-green-500/[0.06] text-green-400"
              : "border-white/10 bg-white/[0.04] text-gray-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="border-t border-white/[0.08] pt-5">
        <button
          type="button"
          onClick={handleImport}
          disabled={
            loading ||
            importing ||
            records.length === 0 ||
            errors.length > 0
          }
          className="w-full rounded-xl bg-green-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-green-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
        >
          {importing
            ? "Importing records..."
            : `Import ${records.length} Records`}
        </button>

        <p className="mt-3 text-center text-xs text-gray-600">
          Review your records before importing them into your database.
        </p>
      </div>
    </div>
  );
}
