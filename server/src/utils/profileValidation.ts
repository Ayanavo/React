import { body, CustomValidator, validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";

export type CompanyProfile = {
  companyName: string;
  designation: string;
  fromMonth: string;
  fromYear: string;
  toMonth: string;
  toYear: string;
  isPresent: boolean;
};

const MOBILE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
const MONTH_PATTERN = /^(0[1-9]|1[0-2])$/;
const YEAR_PATTERN = /^\d{4}$/;
const PINCODE_PATTERN = /^\d{6}$/;

export const normalizeMonth = (month: unknown) => {
  if (month === undefined || month === null || month === "") return "";

  const parsed = parseInt(String(month), 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 12) return "";

  return String(parsed).padStart(2, "0");
};

export const normalizeYear = (year: unknown) => {
  if (year === undefined || year === null || year === "") return "";

  const parsed = parseInt(String(year), 10);
  if (Number.isNaN(parsed) || parsed < 1000 || parsed > 9999) return "";

  return String(parsed);
};

const hasCompanyContent = (company: Record<string, unknown>) =>
  Boolean(
    (typeof company.companyName === "string" && company.companyName.trim()) ||
      (typeof company.designation === "string" && company.designation.trim()) ||
      company.fromMonth ||
      company.fromYear ||
      company.toMonth ||
      company.toYear
  );

const monthYearValue = (month?: unknown, year?: unknown) => {
  const normalizedMonth = normalizeMonth(month);
  const normalizedYear = normalizeYear(year);

  if (!normalizedMonth || !normalizedYear) return null;

  return parseInt(normalizedYear, 10) * 12 + parseInt(normalizedMonth, 10);
};

const validateCompanies: CustomValidator = (companies) => {
  if (companies === undefined || companies === null) return true;
  if (!Array.isArray(companies)) {
    throw new Error("Companies must be an array");
  }

  const errors: string[] = [];

  companies.forEach((company, index) => {
    if (!company || typeof company !== "object") {
      errors.push(`companies[${index}] must be an object`);
      return;
    }

    const entry = company as Record<string, unknown>;
    if (!hasCompanyContent(entry)) return;

    const companyName = typeof entry.companyName === "string" ? entry.companyName.trim() : "";
    const designation = typeof entry.designation === "string" ? entry.designation.trim() : "";
    const fromMonth = normalizeMonth(entry.fromMonth);
    const fromYear = normalizeYear(entry.fromYear);
    const toMonth = normalizeMonth(entry.toMonth);
    const toYear = normalizeYear(entry.toYear);
    const isPresent = Boolean(entry.isPresent);

    if (!companyName) {
      errors.push(`companies[${index}].companyName is required`);
    }

    if (!designation) {
      errors.push(`companies[${index}].designation is required`);
    }

    if (!fromMonth) {
      errors.push(`companies[${index}].fromMonth must be a valid month (01-12)`);
    }

    if (!fromYear) {
      errors.push(`companies[${index}].fromYear must be a valid 4-digit year`);
    }

    if (!isPresent) {
      if (!toMonth) {
        errors.push(`companies[${index}].toMonth must be a valid month (01-12)`);
      }

      if (!toYear) {
        errors.push(`companies[${index}].toYear must be a valid 4-digit year`);
      }

      const from = monthYearValue(fromMonth, fromYear);
      const to = monthYearValue(toMonth, toYear);

      if (from !== null && to !== null && from > to) {
        errors.push(`companies[${index}] to date must be after from date`);
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  return true;
};

export const sanitizeCompanies = (companies: unknown): CompanyProfile[] => {
  if (!Array.isArray(companies)) return [];

  return companies
    .filter((company) => company && typeof company === "object" && hasCompanyContent(company as Record<string, unknown>))
    .map((company) => {
      const entry = company as Record<string, unknown>;
      const isPresent = Boolean(entry.isPresent);
      const fromMonth = normalizeMonth(entry.fromMonth);
      const fromYear = normalizeYear(entry.fromYear);
      const toMonth = isPresent ? "" : normalizeMonth(entry.toMonth);
      const toYear = isPresent ? "" : normalizeYear(entry.toYear);

      return {
        companyName: String(entry.companyName ?? "").trim(),
        designation: String(entry.designation ?? "").trim(),
        fromMonth,
        fromYear,
        toMonth,
        toYear,
        isPresent,
      };
    });
};

export const formatCompaniesForResponse = (companies: unknown): CompanyProfile[] => {
  if (!Array.isArray(companies)) return [];

  return companies.map((company) => {
    const entry = (company ?? {}) as Record<string, unknown>;
    const isPresent = Boolean(entry.isPresent);

    return {
      companyName: String(entry.companyName ?? "").trim(),
      designation: String(entry.designation ?? "").trim(),
      fromMonth: normalizeMonth(entry.fromMonth),
      fromYear: normalizeYear(entry.fromYear),
      toMonth: isPresent ? "" : normalizeMonth(entry.toMonth),
      toYear: isPresent ? "" : normalizeYear(entry.toYear),
      isPresent,
    };
  });
};

export const saveUserProfileValidators = [
  body("photoURL").optional({ values: "falsy" }).isString().withMessage("Photo URL must be a string").isLength({ max: 2_000_000 }),
  body("firstName").trim().notEmpty().withMessage("First name is required").isLength({ max: 100 }),
  body("lastName").trim().notEmpty().withMessage("Last name is required").isLength({ max: 100 }),
  body("mobile").trim().notEmpty().withMessage("Mobile number is required").matches(MOBILE_PATTERN).withMessage("Mobile number format is invalid"),
  body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required").isLength({ max: 255 }),
  body("addressLine2").optional({ values: "falsy" }).isString().isLength({ max: 255 }),
  body("landmark").optional({ values: "falsy" }).isString().isLength({ max: 255 }),
  body("city").trim().notEmpty().withMessage("City is required").isLength({ max: 100 }),
  body("state").trim().notEmpty().withMessage("State is required").isLength({ max: 100 }),
  body("pincode").trim().notEmpty().withMessage("Pincode is required").matches(PINCODE_PATTERN).withMessage("Pincode must be 6 digits"),
  body("companies").optional().custom(validateCompanies),
];

export const handleSaveUserProfileValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  req.body.companies = sanitizeCompanies(req.body.companies);
  next();
};
