// Sinhala / English strings for the patient portal (login + dashboard). A
// lightweight, portal-scoped dictionary — we don't need a full i18n library.
//
// Values may be plain strings or functions of interpolation args, so dynamic
// text (countdowns, phone numbers, counts, names) can be localized too.

export type Lang = "en" | "si";

export interface PortalStrings {
  // shared / branding
  appName: string;
  portal: string;
  brandingBlurb: string;
  footer: string;
  englishOnlyNote: string;

  // ── login: screen 1 — phone ──────────────────────────────────────────────
  signInTitle: string;
  signInSubtitle: string;
  phoneLabel: string;
  checking: string;
  sendOtp: string;
  retryIn: (s: number) => string;
  waitBeforeNewOtp: (s: number) => string;
  hintNewPatient: string;
  hintMultipleAccounts: (n: number) => string;
  hintWelcomeBack: string;
  hintResumeRegistration: string;
  signingInTo: string;
  phoneHelper: string;
  invalidPhone: string;

  // ── login: screen 2 — otp ────────────────────────────────────────────────
  verifyTitle: string;
  verifySubtitle: (masked: string) => string;
  otpExpired: string;
  expiresIn: (t: string) => string;
  resending: string;
  resendIn: (s: number) => string;
  resendOtp: string;
  changePhone: string;
  verify: string;
  verifying: string;
  back: string;
  attemptsLeft: (n: number) => string;

  // ── login: screen 3 — select account ─────────────────────────────────────
  selectAccountTitle: string;
  selectAccountSubtitle: string;
  selectWithin: (t: string) => string;
  unnamedPatient: string;
  incomplete: string;
  finishRegistration: string;
  createNewAccount: string;
  useDifferentPhone: string;

  // ── login: clinic selection (new account / no accounts) ──────────────────
  selectClinicTitle: string;
  selectClinicSubtitle: string;
  clinicLabel: string;
  backToAccounts: string;

  // ── shared profile fields (login screen 4 + dashboard edit) ──────────────
  completeProfileTitle: string;
  completeProfileSubtitle: string;
  completeIn: (t: string) => string;
  fullName: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  dateOfBirth: string;
  dateOfBirthHint: string;
  weightKg: string;
  heightCm: string;
  address: string;
  email: string;
  medicalHistory: string;
  medicalHistoryPlaceholder: string;
  allergies: string;
  allergiesPlaceholder: string;
  saveProfile: string;
  nameRequired: string;
  genderRequired: string;
  dobRequired: string;
  fixErrors: string;
  sectionPersonal: string;
  sectionBody: string;
  sectionContact: string;
  sectionMedical: string;
  fullNamePlaceholder: string;
  addressPlaceholder: string;
  emailPlaceholder: string;
  weightPlaceholder: string;
  heightPlaceholder: string;
  day: string;
  month: string;
  year: string;

  // ── toasts (shared) ──────────────────────────────────────────────────────
  otpSent: string;
  otpResent: string;
  welcomeBack: (name: string) => string;
  welcomeNew: (name: string) => string;

  // ── dashboard ────────────────────────────────────────────────────────────
  signOut: string;
  verified: string;
  edit: string;
  cancel: string;
  saveChanges: string;
  phoneNumber: string;
  patientCode: string;
  weight: string;
  height: string;
  commaSeparated: string;
  noChangesToSave: string;
  profileUpdated: string;
  sessionExpired: string;
  tryAgain: string;
  personalDetails: string;
  profileComplete: (pct: number) => string;
  completeAction: string;
  profileCompletionHint: string;
}

const en: PortalStrings = {
  appName: "Suwexa",
  portal: "Patient Portal",
  brandingBlurb:
    "View your procedures, medical history, and manage your health records.",
  footer: "Suwexa — Patient Portal",
  englishOnlyNote: "Please type your details in English.",

  signInTitle: "Patient sign in",
  signInSubtitle: "Enter your phone number to get started.",
  phoneLabel: "Phone number",
  checking: "Checking...",
  sendOtp: "Send OTP",
  retryIn: (s) => `Retry in ${s}s`,
  waitBeforeNewOtp: (s) => `Please wait ${s}s before requesting a new OTP.`,
  hintNewPatient: "You will be registered as a new patient",
  hintMultipleAccounts: (n) => `${n} accounts on this number`,
  hintWelcomeBack: "Welcome back! Enter OTP to log in",
  hintResumeRegistration: "Resume your registration",
  signingInTo: "Signing in to",
  phoneHelper: "We’ll send a 6-digit code by SMS",
  invalidPhone: "Enter a valid mobile number (07X XXX XXXX)",

  verifyTitle: "Verify your phone",
  verifySubtitle: (masked) => `Enter the 6-digit code sent to ${masked}`,
  otpExpired: "OTP expired",
  expiresIn: (t) => `Expires in ${t}`,
  resending: "Resending...",
  resendIn: (s) => `Resend in ${s}s`,
  resendOtp: "Resend OTP",
  changePhone: "Change phone",
  verify: "Verify",
  verifying: "Verifying…",
  back: "Back",
  attemptsLeft: (n) =>
    `Incorrect code. ${n} attempt${n === 1 ? "" : "s"} left.`,

  selectAccountTitle: "Select account",
  selectAccountSubtitle:
    "Multiple accounts found on this phone number. Choose one to continue.",
  selectWithin: (t) => `Select within ${t}`,
  unnamedPatient: "Unnamed patient",
  incomplete: "Incomplete",
  finishRegistration: "finish registration",
  createNewAccount: "Create new account",
  useDifferentPhone: "Use a different phone",

  selectClinicTitle: "Select your clinic",
  selectClinicSubtitle: "Choose the clinic you want to register with.",
  clinicLabel: "Clinic",
  backToAccounts: "Back to accounts",

  completeProfileTitle: "Complete your profile",
  completeProfileSubtitle: "Fill in your details to create your account.",
  completeIn: (t) => `Complete in ${t}`,
  fullName: "Full name",
  gender: "Gender",
  male: "Male",
  female: "Female",
  other: "Other",
  dateOfBirth: "Date of birth",
  dateOfBirthHint:
    "Enter your date of birth exactly as it appears on your NIC or birth certificate. This helps your clinic identify you correctly.",
  weightKg: "Weight (kg)",
  heightCm: "Height (cm)",
  address: "Address",
  email: "Email",
  medicalHistory: "Medical history",
  medicalHistoryPlaceholder: "Type or select conditions",
  allergies: "Allergies",
  allergiesPlaceholder: "Type or select allergies",
  saveProfile: "Save profile",
  nameRequired: "Enter your full name",
  genderRequired: "Select your gender",
  dobRequired: "Enter your date of birth",
  fixErrors: "Please fix the highlighted fields.",
  sectionPersonal: "Personal details",
  sectionBody: "Body measurements",
  sectionContact: "Contact",
  sectionMedical: "Medical",
  fullNamePlaceholder: "Enter your full name",
  addressPlaceholder: "House no, street, city",
  emailPlaceholder: "name@example.com",
  weightPlaceholder: "e.g. 65",
  heightPlaceholder: "e.g. 170",
  day: "Day",
  month: "Month",
  year: "Year",

  otpSent: "OTP sent to your phone.",
  otpResent: "OTP resent successfully.",
  welcomeBack: (name) => `Welcome back, ${name}!`,
  welcomeNew: (name) => `Welcome to Suwexa, ${name}!`,

  signOut: "Sign out",
  verified: "Verified",
  edit: "Edit",
  cancel: "Cancel",
  saveChanges: "Save changes",
  phoneNumber: "Phone number",
  patientCode: "Patient code",
  weight: "Weight",
  height: "Height",
  commaSeparated: "Comma separated",
  noChangesToSave: "No changes to save.",
  profileUpdated: "Profile updated successfully.",
  sessionExpired: "Session expired. Please sign in again.",
  tryAgain: "Try again",
  personalDetails: "Personal details",
  profileComplete: (pct) => `Profile ${pct}% complete`,
  completeAction: "Complete",
  profileCompletionHint:
    "Add weight, height, email and address to help your clinic.",
};

const si: PortalStrings = {
  appName: "Suwexa",
  portal: "රෝගී පිවිසුම",
  brandingBlurb:
    "ඔබගේ බෙහෙත් වට්ටෝරු, වෛද්‍ය ඉතිහාසය සහ සෞඛ්‍ය තොරතුරු කළමනාකරණය කරන්න.",
  footer: "Suwexa — රෝගී පිවිසුම",
  englishOnlyNote: "කරුණාකර ඔබගේ තොරතුරු ඉංග්‍රීසියෙන් ඇතුළත් කරන්න.",

  signInTitle: "රෝගී පිවිසුම",
  signInSubtitle: "ආරම්භ කිරීමට ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.",
  phoneLabel: "දුරකථන අංකය",
  checking: "පරීක්ෂා කරමින්...",
  sendOtp: "OTP යවන්න",
  retryIn: (s) => `තත්පර ${s}කින් නැවත උත්සාහ කරන්න`,
  waitBeforeNewOtp: (s) =>
    `නව OTP අංකයක් ඉල්ලීමට පෙර තත්පර ${s}ක් රැඳී සිටින්න.`,
  hintNewPatient: "ඔබ නව රෝගියෙකු ලෙස ලියාපදිංචි වනු ඇත",
  hintMultipleAccounts: (n) => `මෙම අංකයට ගිණුම් ${n}ක් ඇත`,
  hintWelcomeBack: "නැවත සාදරයෙන් පිළිගනිමු! පිවිසීමට OTP ඇතුළත් කරන්න",
  hintResumeRegistration: "ඔබගේ ලියාපදිංචිය නැවත ආරම්භ කරන්න",
  signingInTo: "පිවිසෙන සායනය",
  phoneHelper: "අපි SMS මගින් අංක 6 කේතයක් එවන්නෙමු",
  invalidPhone: "වලංගු ජංගම අංකයක් ඇතුළත් කරන්න (07X XXX XXXX)",

  verifyTitle: "ඔබගේ දුරකථනය තහවුරු කරන්න",
  verifySubtitle: (masked) => `${masked} වෙත එවන ලද අංක 6 කේතය ඇතුළත් කරන්න`,
  otpExpired: "OTP කල් ඉකුත් විය",
  expiresIn: (t) => `${t} කින් කල් ඉකුත් වේ`,
  resending: "නැවත යවමින්...",
  resendIn: (s) => `තත්පර ${s}කින් නැවත යවන්න`,
  resendOtp: "OTP නැවත යවන්න",
  changePhone: "දුරකථනය වෙනස් කරන්න",
  verify: "තහවුරු කරන්න",
  verifying: "තහවුරු කරමින්…",
  back: "ආපසු",
  attemptsLeft: (n) => `වැරදි කේතයකි. තවත් උත්සාහයන් ${n}ක් ඉතිරියි.`,

  selectAccountTitle: "ගිණුම තෝරන්න",
  selectAccountSubtitle:
    "මෙම දුරකථන අංකයට ගිණුම් කිහිපයක් හමු විය. ඉදිරියට යාමට එකක් තෝරන්න.",
  selectWithin: (t) => `${t} ඇතුළත තෝරන්න`,
  unnamedPatient: "නම නොදැක්වූ රෝගියා",
  incomplete: "අසම්පූර්ණයි",
  finishRegistration: "ලියාපදිංචිය සම්පූර්ණ කරන්න",
  createNewAccount: "නව ගිණුමක් සාදන්න",
  useDifferentPhone: "වෙනත් දුරකථනයක් භාවිතා කරන්න",

  selectClinicTitle: "ඔබගේ සායනය තෝරන්න",
  selectClinicSubtitle: "ඔබ ලියාපදිංචි වීමට කැමති සායනය තෝරන්න.",
  clinicLabel: "සායනය",
  backToAccounts: "ගිණුම් වෙත ආපසු",

  completeProfileTitle: "ඔබගේ පැතිකඩ සම්පූර්ණ කරන්න",
  completeProfileSubtitle: "ඔබගේ ගිණුම සෑදීමට ඔබගේ විස්තර ඇතුළත් කරන්න.",
  completeIn: (t) => `${t} ඇතුළත සම්පූර්ණ කරන්න`,
  fullName: "සම්පූර්ණ නම",
  gender: "ස්ත්‍රී පුරුෂ භාවය",
  male: "පුරුෂ",
  female: "ස්ත්‍රී",
  other: "වෙනත්",
  dateOfBirth: "උපන් දිනය",
  dateOfBirthHint:
    "කරුණාකර ඔබගේ ජාතික හැඳුනුම්පත හෝ උප්පැන්න සහතිකයේ ඇති පරිදිම උපන් දිනය ඇතුළත් කරන්න. මෙය ඔබගේ සායනයට ඔබව නිවැරදිව හඳුනා ගැනීමට උපකාරී වන අතර ලියාපදිංචිය සම්පූර්ණ කිරීමට අවශ්‍යයි.",
  weightKg: "බර (kg)",
  heightCm: "උස (cm)",
  address: "ලිපිනය",
  email: "විද්‍යුත් තැපෑල",
  medicalHistory: "වෛද්‍ය ඉතිහාසය",
  medicalHistoryPlaceholder: "රෝග ටයිප් කරන්න හෝ තෝරන්න…",
  allergies: "අසාත්මිකතා",
  allergiesPlaceholder: "අසාත්මිකතා ටයිප් කරන්න හෝ තෝරන්න…",
  saveProfile: "පැතිකඩ සුරකින්න",
  nameRequired: "නම අවශ්‍යයි",
  genderRequired: "ස්ත්‍රී පුරුෂ භාවය තෝරන්න",
  dobRequired: "ඔබගේ උපන් දිනය ඇතුළත් කරන්න",
  fixErrors: "කරුණාකර සලකුණු කළ ක්ෂේත්‍ර නිවැරදි කරන්න.",
  sectionPersonal: "පුද්ගලික විස්තර",
  sectionBody: "ශරීර මිනුම්",
  sectionContact: "සම්බන්ධතා",
  sectionMedical: "වෛද්‍ය",
  fullNamePlaceholder: "ඔබගේ සම්පූර්ණ නම",
  addressPlaceholder: "නිවස අංකය, වීදිය, නගරය",
  emailPlaceholder: "name@example.com",
  weightPlaceholder: "උදා. 65",
  heightPlaceholder: "උදා. 170",
  day: "දිනය",
  month: "මාසය",
  year: "වර්ෂය",

  otpSent: "ඔබගේ දුරකථනයට OTP යවන ලදී.",
  otpResent: "OTP සාර්ථකව නැවත යවන ලදී.",
  welcomeBack: (name) => `නැවත සාදරයෙන් පිළිගනිමු, ${name}!`,
  welcomeNew: (name) => `Suwexa වෙත සාදරයෙන් පිළිගනිමු, ${name}!`,

  signOut: "පිටවන්න",
  verified: "තහවුරු කළා",
  edit: "සංස්කරණය",
  cancel: "අවලංගු කරන්න",
  saveChanges: "වෙනස්කම් සුරකින්න",
  phoneNumber: "දුරකථන අංකය",
  patientCode: "රෝගී කේතය",
  weight: "බර",
  height: "උස",
  commaSeparated: "කොමාවෙන් වෙන් කරන්න",
  noChangesToSave: "සුරැකීමට වෙනස්කම් නැත.",
  profileUpdated: "පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී.",
  sessionExpired: "සැසිය කල් ඉකුත් විය. කරුණාකර නැවත පිවිසෙන්න.",
  tryAgain: "නැවත උත්සාහ කරන්න",
  personalDetails: "පුද්ගලික විස්තර",
  profileComplete: (pct) => `පැතිකඩ ${pct}% සම්පූර්ණයි`,
  completeAction: "සම්පූර්ණ කරන්න",
  profileCompletionHint:
    "ඔබගේ සායනයට උදව් වීමට බර, උස, විද්‍යුත් තැපෑල සහ ලිපිනය එක් කරන්න.",
};

export const PORTAL_STRINGS: Record<Lang, PortalStrings> = { en, si };
