
import { useState } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";

import type { PropertyTenantImport } from "../types/propertyTenantImport";

type TenantBulkProps = {
  onImportPropertiesAndTenants: (
    records: PropertyTenantImport[]
  ) => Promise<void>;
};

type ImportError = {
  row: number;
  message: string;
};

const headers = [
  "houseNumber",
  "rentAmount",
  "tenantName",
  "leaseStart",
  "paymentStatus",
  "amountPaid",
  "paymentDate",
  "rentMonth",
];

function getText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown): string {
  return getText(value).toLowerCase().replace(/[\s_-]/g, "");
}

// Supports Excel date cells and YYYY-MM-DD text.
function parseDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(
        parsed.d
      ).padStart(2, "0")}`;
    }
  }

  const text = getText(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`);

    if (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === text
    ) {
      return text;
    }
  }

  return "";
}

function parseRentMonth(value: unknown): string {
  const text = getText(value);

  return /^\d{4}-(0[1-9]|1[0-2])$/.test(text) ? text : "";
}

function parseRecords(rows: Record<string, unknown>[]) {
  const records: PropertyTenantImport[] = [];
  const errors: ImportError[] = [];
  const seenHouses = new Set<string>();

  rows.forEach((row, index) => {
    // Excel row 1 contains headers.
    const rowNumber = index + 2;

    const normalized: Record<string, unknown> = {};

    Object.entries(row).forEach(([key, value]) => {
      normalized[normalizeHeader(key)] = value;
    });

    const houseNumber = getText(normalized.housenumber);
    const tenantName = getText(normalized.tenantname);
    const rentAmount = Number(normalized.rentamount);
    const leaseStart = parseDate(normalized.leasestart);
    const paymentStatus = getText(
      normalized.paymentstatus
    ).toLowerCase();

    const amountPaidText = getText(normalized.amountpaid);
    const amountPaid = amountPaidText
      ? Number(amountPaidText)
      : undefined;

    const paymentDateText = getText(normalized.paymentdate);
    const paymentDate = paymentDateText
      ? parseDate(normalized.paymentdate)
      : "";

    const rentMonthText = getText(normalized.rentmonth);
    const rentMonth = rentMonthText
      ? parseRentMonth(normalized.rentmonth)
      : "";

    // Ignore completely empty spreadsheet rows.
    if (
      !houseNumber &&
      !tenantName &&
      !getText(normalized.rentamount) &&
      !getText(normalized.leasestart) &&
      !paymentStatus
    ) {
      return;
    }

    const rowErrors: string[] = [];

    if (!houseNumber) {
      rowErrors.push("House number is required.");
    }

    if (!tenantName) {
      rowErrors.push("Tenant name is required.");
    }

    if (
      !getText(normalized.rentamount) ||
      !Number.isFinite(rentAmount) ||
      rentAmount <= 0
    ) {
      rowErrors.push("Rent must be a number greater than zero.");
    }

    if (!leaseStart) {
      rowErrors.push("Lease start must be a valid YYYY-MM-DD date.");
    }

    if (!["paid", "pending", "unpaid"].includes(paymentStatus)) {
      rowErrors.push("Payment status must be paid, pending or unpaid.");
    }

    const houseKey = houseNumber.toLowerCase();

    if (houseNumber && seenHouses.has(houseKey)) {
      rowErrors.push("Duplicate house number in this spreadsheet.");
    }

    if (houseNumber) {
      seenHouses.add(houseKey);
    }

    if (
      amountPaidText &&
      (!Number.isFinite(amountPaid) || amountPaid! <= 0)
    ) {
      rowErrors.push("Amount paid must be greater than zero.");
    }

    if (paymentStatus === "paid") {
      if (amountPaid === undefined) {
        rowErrors.push("Paid tenants require an amount paid.");
      }

      if (!paymentDate) {
        rowErrors.push("Paid tenants require a valid payment date.");
      }

      if (!rentMonth) {
        rowErrors.push("Paid tenants require a rent month (YYYY-MM).");
      }
    } else if (amountPaidText || paymentDateText || rentMonthText) {
      rowErrors.push(
        "Payment details should only be supplied for paid tenants."
      );
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((message) => {
        errors.push({ row: rowNumber, message });
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
        ? {
            amountPaid,
            paymentDate,
            rentMonth,
          }
        : {}),
    });
  });

  if (records.length === 0 && errors.length === 0) {
    errors.push({
      row: 0,
      message: "The spreadsheet contains no tenant records.",
    });
  }

  return { records, errors };
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

  const downloadTemplate = () => {
    const template = [
      headers,
      [
        "A01",
        8000,
        "John Doe",
        "2026-01-01",
        "paid",
        8000,
        "2026-01-05",
        "2026-01",
      ],
      [
        "A02",
        7500,
        "Jane Doe",
        "2026-02-01",
        "pending",
        "",
        "",
        "",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(template);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenants");

    XLSX.writeFile(workbook, "PMS_Tenant_Import_Template.xlsx");
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setMessage("");
    setRecords([]);
    setErrors([]);
    setFileName(file.name);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (!["xlsx", "csv"].includes(extension ?? "")) {
        throw new Error("Please upload an Excel (.xlsx) or CSV file.");
      }

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstSheet) {
        throw new Error("The uploaded file has no worksheet.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        { defval: "" }
      );

      const result = parseRecords(rows);

      setRecords(result.records);
      setErrors(result.errors);

      if (result.records.length > 0 && result.errors.length === 0) {
        setMessage("Spreadsheet validated successfully. Review before importing.");
      }
    } catch (error) {
      setErrors([
        {
          row: 0,
          message:
            error instanceof Error
              ? error.message
              : "Could not read the spreadsheet.",
        },
      ]);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (records.length === 0 || errors.length > 0) return;

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

  const inputClass =
    "block w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white file:mr-4 file:rounded-md file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-white";

  return (
    <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-950 p-6 text-white">
      <div>
        <h2 className="text-xl font-semibold">
          Bulk Import Tenants
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Upload one spreadsheet containing your properties and tenants.
        </p>
      </div>

      <button
        type="button"
        onClick={downloadTemplate}
        className="rounded-lg border border-gray-700 px-4 py-3 text-sm transition hover:bg-gray-800"
      >
        Download Excel Template
      </button>

      <div className="space-y-2">
        <label className="block text-sm text-gray-300">
          Select your spreadsheet
        </label>

        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          disabled={loading || importing}
          className={inputClass}
        />

        {fileName && (
          <p className="text-sm text-gray-400">
            Selected: {fileName}
          </p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-300">
          Reading and validating spreadsheet...
        </p>
      )}

      {records.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            Import Preview ({records.length} valid records)
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="p-3">House</th>
                  <th className="p-3">Tenant</th>
                  <th className="p-3">Rent</th>
                  <th className="p-3">Lease Start</th>
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
        <div className="space-y-2 rounded-lg border border-red-900 bg-red-950/30 p-4">
          <h3 className="font-semibold text-red-400">
            Please fix these errors ({errors.length})
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
          importing ||
          loading ||
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
