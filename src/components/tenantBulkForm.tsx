
import { useState } from "react";
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

    const rentMonthText = getText(data.rentmonth);
    const rentMonth = rentMonthText
      ? getText(data.rentmonth)
      : "";

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
    } else if (amountText || paymentDateText || rentMonthText) {
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
      paymentStatus: paymentStatus as
        | "paid"
        | "pending"
        | "unpaid",
      ...(amountPaid !== undefined
        ? { amountPaid, paymentDate, rentMonth }
        : {}),
    });
  });

  return { records, errors };
}

// Text documents must use pipe-separated or tab-separated records.
// Expected order:
// houseNumber | tenantName | rentAmount | leaseStart | paymentStatus | amountPaid | paymentDate | rentMonth
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

    // Allow a header row.
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

      let parsed;

      if (result.rows) {
        parsed = validateRows(result.rows);
      } else {
        parsed = parseDocumentText(result.text);
      }

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
    if (!records.length || errors.length || importing) return;

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
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-950 p-6 text-white">
      <div>
        <h2 className="text-xl font-semibold">
          Bulk Import Properties & Tenants
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Upload your existing tenant records from your device.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <p className="mb-2 text-sm font-medium">
          Supported files
        </p>

        <p className="text-sm text-gray-400">
          Excel, CSV, Word, PDF, JPG, PNG and WEBP.
        </p>

        <input
          type="file"
          accept=".xlsx,.csv,.docx,.pdf,.jpg,.jpeg,.png,.webp,.bmp"
          onChange={handleFileChange}
          disabled={loading || importing}
          className="mt-4 block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-medium file:text-white"
        />

        {fileName && (
          <p className="mt-3 text-sm text-gray-400">
            Selected: {fileName}
          </p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-300">
          Extracting and validating file contents...
        </p>
      )}

      {records.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            Preview ({records.length} records)
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="p-3">House</th>
                  <th className="p-3">Tenant</th>
                  <th className="p-3">Rent</th>
                  <th className="p-3">Lease</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={`${record.houseNumber}-${index}`}
                    className="border-t border-gray-800"
                  >
                    <td className="p-3">{record.houseNumber}</td>
                    <td className="p-3">{record.tenantName}</td>
                    <td className="p-3">
                      KSh {record.rentAmount.toLocaleString()}
                    </td>
                    <td className="p-3">{record.leaseStart}</td>
                    <td className="p-3">{record.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
          <h3 className="mb-2 font-semibold text-red-400">
            Import errors ({errors.length})
          </h3>

          <ul className="space-y-1 text-sm text-red-300">
            {errors.map((error, index) => (
              <li key={index}>
                {error.row > 0 ? `Row ${error.row}: ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p className="text-sm text-green-400">{message}</p>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={
          loading ||
          importing ||
          records.length === 0 ||
          errors.length > 0
        }
        className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {importing
          ? "Importing..."
          : `Import ${records.length} Records`}
      </button>
    </div>
  );
}
