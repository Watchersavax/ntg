export interface AccountTypeOption {
  id: "individual" | "corporate" | "agent";
  formType: number;
  label: string;
  pillLabel: string;
  description: string;
  icon: string;
  brandTitle: string;
  brandDescription: string;
  formSubtitle: string;
}

export interface TrustItem {
  icon: string;
  label: string;
}
