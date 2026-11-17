import PatientClient from "../PatientClient";

/** One of the signed-in patient's referral letters, as listed. */
export interface MyReferralLetter {
  id: string;
  clinicName: string | null;
  doctorName: string;
  issuedAt: string;
  expiresAt: string;
  /** The doctor's choice: show it with screenshots blocked. */
  blockScreenshots: boolean;
}

/** The letter itself — a copy of what the doctor sent. */
export interface ReferralLetter {
  clinicName: string | null;
  clinicAddress: string | null;
  clinicPhone: string | null;
  clinicAdmin: { name: string; slmcNumber: string | null } | null;
  themeColor: string | null;
  body: string;
  doctorName: string;
  doctorQualification: string | null;
  doctorSlmcNumber: string | null;
  issuedAt: string;
}

const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * The same routes as the web portal (backend referral-link.controller.ts
 * `mine`, `mine/:id`). `via=app` tells the clinic's "sent letters" table the
 * letter was read in the app.
 */
export const referralApi = {
  mine: (token: string) =>
    PatientClient.get<MyReferralLetter[]>("/referral-links/mine", auth(token)),

  open: (token: string, id: string) =>
    PatientClient.get<{
      letter: ReferralLetter;
      expiresAt: string;
      blockScreenshots: boolean;
    }>(`/referral-links/mine/${id}`, {
      ...auth(token),
      params: { via: "app" },
    }),
};
