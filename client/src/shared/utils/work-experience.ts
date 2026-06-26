export type CompanyEntry = {
  companyName?: string;
  designation?: string;
  fromMonth?: string;
  fromYear?: string;
  toMonth?: string;
  toYear?: string;
  isPresent?: boolean;
};

export const normalizeMonth = (month?: string | number | null) => {
  if (month === undefined || month === null || month === "") return "";

  const parsed = parseInt(String(month), 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 12) return "";

  return String(parsed).padStart(2, "0");
};

export const normalizeYear = (year?: string | number | null) => {
  if (year === undefined || year === null || year === "") return "";

  const parsed = parseInt(String(year), 10);
  if (Number.isNaN(parsed) || parsed < 1000 || parsed > 9999) return "";

  return String(parsed);
};

export const hasMonthYear = (month?: string, year?: string) => Boolean(normalizeMonth(month) && normalizeYear(year));

export const normalizeCompanyEntry = (company: CompanyEntry = {}): CompanyEntry => ({
  companyName: company.companyName?.trim() ?? "",
  designation: company.designation?.trim() ?? "",
  fromMonth: normalizeMonth(company.fromMonth),
  fromYear: normalizeYear(company.fromYear),
  toMonth: normalizeMonth(company.toMonth),
  toYear: normalizeYear(company.toYear),
  isPresent: Boolean(company.isPresent),
});

export const normalizeCompanies = (companies: CompanyEntry[] = []) => companies.map(normalizeCompanyEntry);

export const MONTH_OPTIONS = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export const getYearOptions = (startYear = 1970) => {
  const currentYear = new Date().getFullYear();
  const years: Array<{ label: string; value: string }> = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push({ label: String(year), value: String(year) });
  }

  return years;
};

export const getCompanyTenureMonths = (company: CompanyEntry): number => {
  const fromMonth = normalizeMonth(company.fromMonth);
  const fromYear = normalizeYear(company.fromYear);

  if (!fromMonth || !fromYear) return 0;

  const fromMonthNum = parseInt(fromMonth, 10);
  const fromYearNum = parseInt(fromYear, 10);

  if (company.isPresent) {
    const now = new Date();
    const toMonth = now.getMonth() + 1;
    const toYear = now.getFullYear();
    return Math.max(0, (toYear - fromYearNum) * 12 + (toMonth - fromMonthNum) + 1);
  }

  const toMonth = normalizeMonth(company.toMonth);
  const toYear = normalizeYear(company.toYear);

  if (!toMonth || !toYear) return 0;

  const toMonthNum = parseInt(toMonth, 10);
  const toYearNum = parseInt(toYear, 10);

  return Math.max(0, (toYearNum - fromYearNum) * 12 + (toMonthNum - fromMonthNum) + 1);
};

export const calculateWorkExperience = (companies: CompanyEntry[] = []) => {
  const totalMonths = companies.reduce((sum, company) => sum + getCompanyTenureMonths(company), 0);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
  };
};

export const EMPTY_COMPANY_ENTRY: CompanyEntry = {
  companyName: "",
  designation: "",
  fromMonth: "",
  fromYear: "",
  toMonth: "",
  toYear: "",
  isPresent: false,
};

export const monthYearToDate = (month?: string | number, year?: string | number): Date | null => {
  const normalizedMonth = normalizeMonth(month);
  const normalizedYear = normalizeYear(year);

  if (!normalizedMonth || !normalizedYear) return null;

  return new Date(parseInt(normalizedYear, 10), parseInt(normalizedMonth, 10) - 1, 1);
};

export const dateToMonthYear = (date: Date) => ({
  month: String(date.getMonth() + 1).padStart(2, "0"),
  year: String(date.getFullYear()),
});
