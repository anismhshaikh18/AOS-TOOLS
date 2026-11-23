export type ChecklistCategoryId =
  | 'all'
  | 'pan'
  | 'aadhaar'
  | 'ration'
  | 'certificates'
  | 'passport_exams';

export type DocumentProofTag =
  | 'PoI'
  | 'PoA'
  | 'PoB / DOB'
  | 'Photo'
  | 'Signature'
  | 'Mandatory'
  | 'Existing Proof'
  | 'Supporting';

export interface ChecklistDocumentItem {
  id: string;
  label: string;
  tag: DocumentProofTag;
  required: boolean;
  note?: string;
}

export interface ChecklistToolShortcut {
  label: string;
  kind: 'tab' | 'tool';
  targetId: string;
}

export interface DocumentChecklistGuide {
  id: string;
  category: Exclude<ChecklistCategoryId, 'all'>;
  categoryLabel: string;
  title: string;
  shortTitle: string;
  summary: string;
  portalMode: string;
  typicalTimeline: string;
  eligibilityRules: string[];
  checklist: ChecklistDocumentItem[];
  shortcuts: ChecklistToolShortcut[];
  keywords: string[];
}

export const CHECKLIST_CATEGORIES: Array<{ id: ChecklistCategoryId; label: string }> = [
  { id: 'all', label: 'All Services' },
  { id: 'pan', label: 'PAN Services' },
  { id: 'aadhaar', label: 'Aadhaar' },
  { id: 'ration', label: 'Smart / Ration Card' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'passport_exams', label: 'Passport & Exams' },
];

export const DOCUMENT_CHECKLIST_GUIDES: DocumentChecklistGuide[] = [
  {
    id: 'pan-new-49a',
    category: 'pan',
    categoryLabel: 'PAN Services',
    title: 'New PAN Card Application (Form 49A)',
    shortTitle: 'New PAN (Form 49A)',
    summary:
      'Complete PoI, PoA, DOB, photo/signature, and 300 KB PDF preparation checklist for Indian citizens applying via Protean (NSDL) or UTIITSL.',
    portalMode: 'Protean (NSDL) & UTIITSL',
    typicalTimeline: 'e-PAN in 2–5 days · Physical card 10–15 days',
    eligibilityRules: [
      'Applicant must be an Indian citizen who has never been allotted a PAN earlier.',
      'Minors (below 18 years) can apply through a Representative Assessee (parent/guardian) using the parent’s PoI & PoA.',
      'Active mobile number and email ID are required for OTP verification and e-PAN delivery.',
      'Name and Date of Birth on Aadhaar must match supporting documents for instant e-KYC.',
    ],
    checklist: [
      {
        id: 'pan49a-poi',
        label: 'Proof of Identity (Aadhaar Card / Voter ID / Passport / Driving Licence)',
        tag: 'PoI',
        required: true,
        note: 'Name spelling must match Form 49A exactly.',
      },
      {
        id: 'pan49a-poa',
        label: 'Proof of Address (Aadhaar / Utility Bill < 3 months / Bank Passbook)',
        tag: 'PoA',
        required: true,
        note: 'Must include full PIN code and clear residential address.',
      },
      {
        id: 'pan49a-dob',
        label: 'Date of Birth Proof (Aadhaar / Birth Certificate / 10th Marksheet / Passport)',
        tag: 'PoB / DOB',
        required: true,
        note: 'Full DD/MM/YYYY date must be clearly printed.',
      },
      {
        id: 'pan49a-photo',
        label: 'Recent Colour Passport Photo (2.5 × 3.5 cm or 213 × 213 px, < 50 KB JPG)',
        tag: 'Photo',
        required: true,
        note: 'Plain white background, 300 DPI.',
      },
      {
        id: 'pan49a-sign',
        label: 'Clear Black-Ink Signature on White Paper (< 50 KB JPG)',
        tag: 'Signature',
        required: true,
        note: 'No ruled lines or shadow behind signature.',
      },
      {
        id: 'pan49a-pdf',
        label: 'Combined Supporting Proofs PDF (< 300 KB, Password-Free)',
        tag: 'Supporting',
        required: false,
        note: 'Required for scan-based upload mode on UTIITSL / Protean.',
      },
    ],
    shortcuts: [
      { label: 'PAN Master Hub', kind: 'tab', targetId: 'pan' },
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Photo & Sign Resizer', kind: 'tool', targetId: 'photo-signature-resize' },
      { label: 'Compress PDF (<300 KB)', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'Merge PDF', kind: 'tool', targetId: 'merge-pdf' },
    ],
    keywords: [
      'pan',
      'new pan',
      'form 49a',
      'utiitsl',
      'protean',
      'nsdl',
      'poi',
      'poa',
      'dob',
      'e-pan',
      'checklist',
    ],
  },
  {
    id: 'pan-correction-csf',
    category: 'pan',
    categoryLabel: 'PAN Services',
    title: 'PAN Correction, Name / Father Name Update & Reprint (CSF)',
    shortTitle: 'PAN Correction (CSF)',
    summary:
      'Checklist for correcting name spelling, father’s name, DOB, photo/signature mismatch, or ordering a reprinted PVC PAN card.',
    portalMode: 'Protean (NSDL) & UTIITSL CSF',
    typicalTimeline: '7–15 working days',
    eligibilityRules: [
      'Applicant must already hold a valid 10-character PAN number.',
      'For major name change (post-marriage or surname change), a Gazette Notification or Marriage Certificate is mandatory.',
      'Date of Birth corrections require a Matriculation certificate, Passport, or Municipal Birth Certificate.',
      'Reprint requests with no demographic change only require existing PAN verification and Aadhaar OTP.',
    ],
    checklist: [
      {
        id: 'pancsf-existing',
        label: 'Existing PAN Card Copy or PAN Allotment Letter',
        tag: 'Existing Proof',
        required: true,
        note: 'Clear front scan showing 10-character PAN.',
      },
      {
        id: 'pancsf-poi',
        label: 'Updated Proof of Identity showing exact corrected Name / Father’s Name',
        tag: 'PoI',
        required: true,
        note: 'Aadhaar, Passport, Voter ID, or Driving Licence.',
      },
      {
        id: 'pancsf-poa',
        label: 'Current Address Proof for PVC Card Dispatch',
        tag: 'PoA',
        required: true,
        note: 'Aadhaar, Bank Statement, or recent Electricity/Gas bill.',
      },
      {
        id: 'pancsf-photo-sign',
        label: 'Updated Passport Photo & Signature (< 50 KB each)',
        tag: 'Photo',
        required: true,
        note: 'Required when updating photo or signature on card.',
      },
      {
        id: 'pancsf-marriage',
        label: 'Marriage Certificate / Official Gazette Copy (If Full Name Changed)',
        tag: 'Supporting',
        required: false,
        note: 'Mandatory only for major name or surname change.',
      },
      {
        id: 'pancsf-pdf',
        label: 'Single Merged Supporting Proof PDF (< 300 KB)',
        tag: 'Supporting',
        required: false,
        note: 'Combine existing PAN + correction proof into one PDF.',
      },
    ],
    shortcuts: [
      { label: 'PAN Master Hub', kind: 'tab', targetId: 'pan' },
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Merge PDF', kind: 'tool', targetId: 'merge-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
    ],
    keywords: [
      'pan correction',
      'csf',
      'pan reprint',
      'name change',
      'father name',
      'dob correction',
      'pan update',
    ],
  },
  {
    id: 'aadhaar-address-update',
    category: 'aadhaar',
    categoryLabel: 'Aadhaar',
    title: 'Aadhaar Address Update (Online myAadhaar / HoF Mode)',
    shortTitle: 'Aadhaar Address Update',
    summary:
      'Standard Proof of Address checklist for updating residential address online through myAadhaar or via Head of Family (HoF) consent.',
    portalMode: 'UIDAI myAadhaar Portal',
    typicalTimeline: '5–30 days after verification',
    eligibilityRules: [
      'Active mobile number must be linked to your Aadhaar to receive myAadhaar login OTP.',
      'Uploaded PoA scan must be from the original colour document (photocopies are frequently rejected).',
      'Document name must match the resident’s name on Aadhaar; otherwise apply under Head of Family (HoF) mode.',
      'Utility bills (Electricity, Water, Gas, Postpaid) must be issued within the last 3 months.',
    ],
    checklist: [
      {
        id: 'aad-addr-otp',
        label: '12-Digit Aadhaar Number + OTP-Linked Mobile Phone',
        tag: 'Mandatory',
        required: true,
        note: 'Required to sign in on myAadhaar.',
      },
      {
        id: 'aad-addr-poa',
        label: 'Valid Proof of Address (EB/Water/Gas Bill < 3 mo, Bank Passbook, Passport, Voter ID, or Smart Ration Card)',
        tag: 'PoA',
        required: true,
        note: 'Original colour scan with all 4 corners visible, < 2 MB PDF/JPG.',
      },
      {
        id: 'aad-addr-rent',
        label: 'Registered Rent / Lease Agreement (If residing in rented property)',
        tag: 'PoA',
        required: false,
        note: 'Must be valid and registered in the applicant’s name.',
      },
      {
        id: 'aad-addr-hof',
        label: 'Head of Family (HoF) Self-Declaration + Relationship Proof (If no personal PoA)',
        tag: 'Supporting',
        required: false,
        note: 'Ration Card, Marriage Certificate, or Birth Certificate proving HoF link.',
      },
      {
        id: 'aad-addr-scan',
        label: 'Clean, Uncropped, Password-Free PDF/Image Scan (< 2 MB)',
        tag: 'Supporting',
        required: true,
        note: 'Avoid blurry shadows or cut-off text.',
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Images to PDF', kind: 'tool', targetId: 'images-to-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'Unlock PDF (e-Aadhaar)', kind: 'tool', targetId: 'unlock-pdf' },
    ],
    keywords: [
      'aadhaar',
      'aadhar',
      'address update',
      'uidai',
      'myaadhaar',
      'hof',
      'head of family',
      'poa',
      'address change',
    ],
  },
  {
    id: 'aadhaar-demographic-biometric',
    category: 'aadhaar',
    categoryLabel: 'Aadhaar',
    title: 'Aadhaar Demographic / Biometric Update (Seva Kendra)',
    shortTitle: 'Aadhaar Centre Update',
    summary:
      'Original documents required when visiting an Aadhaar Seva Kendra for mobile linking, name/DOB correction, or mandatory child biometric update.',
    portalMode: 'Aadhaar Seva Kendra (In-Person)',
    typicalTimeline: '7–30 days',
    eligibilityRules: [
      'Mobile number update, photograph update, and fingerprint/iris biometric updates require physical presence at an Aadhaar centre.',
      'Mandatory biometric updates for children at ages 5 and 15 are free of charge.',
      'Date of Birth update is allowed strictly once and requires an approved Birth Certificate or Passport.',
      'Carry original physical documents — centre operators scan originals and return them immediately.',
    ],
    checklist: [
      {
        id: 'aad-bio-card',
        label: 'Existing Aadhaar Card / Unlocked e-Aadhaar Copy',
        tag: 'Existing Proof',
        required: true,
      },
      {
        id: 'aad-bio-poi',
        label: 'Original Proof of Identity (Passport / PAN / Voter ID / Govt ID)',
        tag: 'PoI',
        required: true,
        note: 'Needed for name spelling or gender correction.',
      },
      {
        id: 'aad-bio-dob',
        label: 'Original Date of Birth Proof (Birth Certificate / 10th Marksheet / Passport)',
        tag: 'PoB / DOB',
        required: false,
        note: 'Mandatory only if updating Date of Birth.',
      },
      {
        id: 'aad-bio-form',
        label: 'Filled Aadhaar Enrolment / Update Form',
        tag: 'Supporting',
        required: true,
        note: 'Available at Seva Kendra or UIDAI portal.',
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Unlock PDF', kind: 'tool', targetId: 'unlock-pdf' },
      { label: 'PDF Tools', kind: 'tab', targetId: 'pdf' },
    ],
    keywords: [
      'aadhaar biometric',
      'aadhaar mobile link',
      'seva kendra',
      'aadhaar name update',
      'aadhaar dob',
      'uidai',
    ],
  },
  {
    id: 'ration-new-smart-card',
    category: 'ration',
    categoryLabel: 'Smart / Ration Card',
    title: 'New Smart Ration Card Application (TNPDS / NFSA)',
    shortTitle: 'New Smart Ration Card',
    summary:
      'Essential family Aadhaar, residence proof, gas connection detail, and photo checklist for applying for a new family Smart Ration Card.',
    portalMode: 'TNPDS / State Civil Supplies Portal',
    typicalTimeline: '15–45 days (after field verification)',
    eligibilityRules: [
      'Family head and members must reside within the state and must not hold an active duplicate ration card elsewhere.',
      'Aadhaar cards of the Head of Family and all adult members are mandatory for e-KYC seeding.',
      'Newly married couples or separated families must attach a Member Deletion / Surrender Certificate from their previous family card.',
      'An active mobile number is required to track TNPDS application reference status.',
    ],
    checklist: [
      {
        id: 'rat-new-photo',
        label: 'Head of Family Passport Size Photo (< 50 KB JPG/PNG)',
        tag: 'Photo',
        required: true,
        note: 'Clear front-facing studio photo.',
      },
      {
        id: 'rat-new-aadhaar',
        label: 'Aadhaar Cards of Head of Family & All Family Members',
        tag: 'PoI',
        required: true,
        note: 'Combine into one legible PDF if uploading together.',
      },
      {
        id: 'rat-new-poa',
        label: 'Residence Proof (EB Bill / Gas Book / House Tax Receipt / Rent Agreement)',
        tag: 'PoA',
        required: true,
        note: 'Must display current door number, street & taluk.',
      },
      {
        id: 'rat-new-gas',
        label: 'LPG Gas Connection Consumer Sheet / Recent Bill',
        tag: 'Supporting',
        required: false,
        note: 'Required if household has active cylinder connection.',
      },
      {
        id: 'rat-new-surrender',
        label: 'Previous Ration Card Deletion / Surrender Certificate',
        tag: 'Supporting',
        required: false,
        note: 'Mandatory if removing name from parent’s existing card.',
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Photo & Sign Resizer', kind: 'tool', targetId: 'photo-signature-resize' },
      { label: 'Merge PDF', kind: 'tool', targetId: 'merge-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
    ],
    keywords: [
      'ration card',
      'smart card',
      'tnpds',
      'new ration card',
      'nfsa',
      'civil supplies',
      'family card',
      'pds',
    ],
  },
  {
    id: 'ration-member-address-update',
    category: 'ration',
    categoryLabel: 'Smart / Ration Card',
    title: 'Smart Card Member Addition, Deletion or Address Change',
    shortTitle: 'Smart Card Update',
    summary:
      'Checklist for adding a newborn or spouse, removing a member, or updating residential address on an existing Smart Ration Card.',
    portalMode: 'TNPDS / State PDS Portal',
    typicalTimeline: '10–30 days',
    eligibilityRules: [
      'Smart Card must be active and linked with a working mobile number for OTP login.',
      'For adding a child, an official Municipal / Hospital Birth Certificate is mandatory.',
      'For adding a spouse, both Marriage Certificate and a Deletion Slip from the parent’s ration card are required.',
      'Address change requires an updated utility bill, Aadhaar, or registered rental agreement at the new address.',
    ],
    checklist: [
      {
        id: 'rat-upd-card',
        label: 'Existing Smart Ration Card Number + Registered Mobile OTP',
        tag: 'Existing Proof',
        required: true,
      },
      {
        id: 'rat-upd-member-id',
        label: 'New Member’s Aadhaar Card (or Birth Certificate for child < 5 years)',
        tag: 'PoI',
        required: true,
      },
      {
        id: 'rat-upd-marriage',
        label: 'Marriage Certificate + Previous Card Member Deletion Slip (For Spouse)',
        tag: 'Supporting',
        required: false,
        note: 'Required when adding wife/husband after marriage.',
      },
      {
        id: 'rat-upd-poa',
        label: 'Updated Address Proof (EB Bill / Aadhaar / Property Tax / Rent Agreement)',
        tag: 'PoA',
        required: false,
        note: 'Required only for address change requests.',
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Images to PDF', kind: 'tool', targetId: 'images-to-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'PDF Translator', kind: 'tool', targetId: 'pdf-translator' },
    ],
    keywords: [
      'smart card update',
      'add member ration',
      'ration address change',
      'tnpds member add',
      'delete member',
      'ration card correction',
    ],
  },
  {
    id: 'cert-income-community-nativity',
    category: 'certificates',
    categoryLabel: 'Certificates',
    title: 'Income, Community / Caste & Nativity Certificate (e-Sevai / e-District)',
    shortTitle: 'Income / Caste / Nativity',
    summary:
      'Standard e-Sevai and e-District revenue certificate checklist covering PoI, PoA, parent records, and signed self-declaration.',
    portalMode: 'e-Sevai / State e-District Portal',
    typicalTimeline: '7–15 working days',
    eligibilityRules: [
      'Applicant or parent must be a bona fide resident of the respective Taluk / Revenue Village.',
      'Income certificate requires accurate annual family income declaration from all earning members.',
      'Community / Caste certificate requires father’s or mother’s community proof or school Transfer Certificate (TC).',
      'A signed Self-Declaration Form in the prescribed state format is mandatory for all revenue certificates.',
    ],
    checklist: [
      {
        id: 'cert-rev-photo',
        label: 'Applicant Passport Size Photo (< 50 KB JPG)',
        tag: 'Photo',
        required: true,
      },
      {
        id: 'cert-rev-poi',
        label: 'Aadhaar Card of Applicant (and Parent if Minor)',
        tag: 'PoI',
        required: true,
      },
      {
        id: 'cert-rev-poa',
        label: 'Smart Ration Card / Voter ID / Residence Proof',
        tag: 'PoA',
        required: true,
        note: 'Establishes revenue village & taluk jurisdiction.',
      },
      {
        id: 'cert-rev-support',
        label: 'Category Specific Proof (Salary Slip/Form 16 for Income; Parent Community Cert or TC for Caste)',
        tag: 'Supporting',
        required: true,
        note: 'For Nativity, attach 5-year residence/schooling proofs.',
      },
      {
        id: 'cert-rev-decl',
        label: 'Signed Self-Declaration Form (Clean Scanned PDF)',
        tag: 'Mandatory',
        required: true,
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Images to PDF', kind: 'tool', targetId: 'images-to-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'PDF Translator', kind: 'tool', targetId: 'pdf-translator' },
    ],
    keywords: [
      'income certificate',
      'community certificate',
      'caste certificate',
      'nativity certificate',
      'domicile',
      'e-sevai',
      'edistrict',
      'revenue certificate',
      'obc',
      'ews',
    ],
  },
  {
    id: 'cert-birth-death-legal-heir',
    category: 'certificates',
    categoryLabel: 'Certificates',
    title: 'Birth, Death & Legal Heir Certificate Pack',
    shortTitle: 'Birth / Death / Legal Heir',
    summary:
      'Documentation checklist for municipal birth/death registrations and Tahsildar Legal Heir certificate applications.',
    portalMode: 'CRS / Municipal / e-Sevai Portal',
    typicalTimeline: '15–30 working days',
    eligibilityRules: [
      'Birth or death events reported within 21 days are registered free at the local Municipal / Panchayat body.',
      'Delayed birth/death registrations (> 1 year) require a Magistrate order and Non-Availability Certificate.',
      'Legal Heir applications must list all surviving Class-I legal heirs (spouse, children, mother) accurately.',
    ],
    checklist: [
      {
        id: 'cert-bd-record',
        label: 'Hospital Birth Discharge Summary or Original Death Certificate',
        tag: 'Mandatory',
        required: true,
      },
      {
        id: 'cert-bd-poi',
        label: 'Aadhaar Cards of Parents / All Legal Heirs',
        tag: 'PoI',
        required: true,
      },
      {
        id: 'cert-bd-poa',
        label: 'Smart Ration Card / Family Residence Proof',
        tag: 'PoA',
        required: true,
      },
      {
        id: 'cert-bd-photo',
        label: 'Applicant Passport Photo (< 50 KB)',
        tag: 'Photo',
        required: true,
      },
      {
        id: 'cert-bd-affidavit',
        label: 'Signed Self-Declaration / Notarized Affidavit (If Applicable)',
        tag: 'Supporting',
        required: false,
        note: 'Required for Legal Heir & delayed registrations.',
      },
    ],
    shortcuts: [
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Merge PDF', kind: 'tool', targetId: 'merge-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
    ],
    keywords: [
      'birth certificate',
      'death certificate',
      'legal heir',
      'varisu',
      'municipal',
      'crs',
      'tahsildar',
    ],
  },
  {
    id: 'passport-fresh-reissue',
    category: 'passport_exams',
    categoryLabel: 'Passport & Exams',
    title: 'Fresh / Re-Issue Indian Passport (Passport Seva)',
    shortTitle: 'Indian Passport Seva',
    summary:
      'Original PoA, DOB, Non-ECR qualification, and biometric appointment checklist for Passport Seva Kendra (PSK / POPSK) visits.',
    portalMode: 'MEA Passport Seva Portal',
    typicalTimeline: '7–21 days (Normal) · 1–3 days (Tatkaal)',
    eligibilityRules: [
      'Applicant must be an Indian citizen; carry original physical proofs plus self-attested photocopies to the PSK.',
      'Applicants who have passed Class 10 or higher qualify for Non-ECR (Emigration Check Not Required) status.',
      'Minors (< 18 years) require Annexure D signed by both parents along with parents’ valid ID/passport copies.',
      'For Re-issue, bring the original old passport along with self-attested copies of the first two and last two pages.',
    ],
    checklist: [
      {
        id: 'psp-poa',
        label: 'Current Address Proof (Aadhaar / Photo Bank Passbook / Utility Bill / Voter ID)',
        tag: 'PoA',
        required: true,
      },
      {
        id: 'psp-dob',
        label: 'Date of Birth Proof (Birth Certificate / 10th Marksheet / PAN / Aadhaar)',
        tag: 'PoB / DOB',
        required: true,
      },
      {
        id: 'psp-ecr',
        label: 'Class 10 / 12 / Degree Certificate (For Non-ECR Category)',
        tag: 'Supporting',
        required: false,
        note: 'Avoids ECR stamp on passport.',
      },
      {
        id: 'psp-old',
        label: 'Original Old Passport + Copy of First & Last Pages (Re-Issue Only)',
        tag: 'Existing Proof',
        required: false,
      },
      {
        id: 'psp-photo',
        label: '35 × 45 mm White-Background Passport Photos (Backup / Minor Cases)',
        tag: 'Photo',
        required: false,
        note: 'PSK captures live photo; physical copies needed for infants/minors.',
      },
    ],
    shortcuts: [
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
      { label: 'Merge PDF', kind: 'tool', targetId: 'merge-pdf' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
    ],
    keywords: [
      'passport',
      'indian passport',
      'passport seva',
      'psk',
      'tatkaal',
      'non-ecr',
      'passport renewal',
      'reissue',
    ],
  },
  {
    id: 'govt-exam-ssc-upsc-tnpsc',
    category: 'passport_exams',
    categoryLabel: 'Passport & Exams',
    title: 'SSC, UPSC & TNPSC Recruitment Form Document Pack',
    shortTitle: 'SSC / UPSC / TNPSC Form',
    summary:
      'Strict photo KB/dimensions, signature sizing, age cutoff verification, and certificate PDF checklist for competitive exam portals.',
    portalMode: 'SSC / UPSC / TNPSC OTR Portals',
    typicalTimeline: 'Immediate online upload',
    eligibilityRules: [
      'Verify exact chronological age against the official notification cutoff date before filling the form.',
      'Photograph must be recent (< 3 months) with plain light background, no cap/sunglasses, and optional Name + DOP strip where mandated.',
      'Signature must be in clear black/dark-blue ink on plain white paper, cropped horizontally without excessive whitespace.',
      'Category certificates (OBC-NCL, EWS, SC/ST, PwBD) must match the current financial year format specified in the notification.',
    ],
    checklist: [
      {
        id: 'exam-photo',
        label: '3.5 × 4.5 cm Passport Photo (20–50 KB JPG, Optional Name & DOP Strip)',
        tag: 'Photo',
        required: true,
        note: 'Use Passport Photo Studio with < 50 KB compression.',
      },
      {
        id: 'exam-sign',
        label: 'Scanned Signature on White Paper (10–20 KB JPG)',
        tag: 'Signature',
        required: true,
        note: 'Clear horizontal crop, no dark borders.',
      },
      {
        id: 'exam-poi',
        label: 'Valid Photo ID (Aadhaar / Voter ID / PAN / Driving Licence)',
        tag: 'PoI',
        required: true,
        note: 'Carry the exact same ID to the examination hall.',
      },
      {
        id: 'exam-edu',
        label: '10th, 12th & Degree Marksheets / Passing Certificates (PDF)',
        tag: 'PoB / DOB',
        required: true,
        note: '10th certificate verifies Date of Birth & Name spelling.',
      },
      {
        id: 'exam-cat',
        label: 'Valid Category / Community / EWS / PwBD Certificate (If Claiming Reservation)',
        tag: 'Supporting',
        required: false,
        note: 'Ensure validity for the current recruitment year.',
      },
    ],
    shortcuts: [
      { label: 'Passport Photo Studio', kind: 'tool', targetId: 'passport-photo-studio' },
      { label: 'Photo & Sign Resizer', kind: 'tool', targetId: 'photo-signature-resize' },
      { label: 'Quick Calculators', kind: 'tool', targetId: 'quick-calculator-suite' },
      { label: 'Compress PDF', kind: 'tool', targetId: 'compress-pdf' },
      { label: 'Government Portals Hub', kind: 'tab', targetId: 'portals' },
    ],
    keywords: [
      'ssc',
      'upsc',
      'tnpsc',
      'exam form',
      'otr',
      'dop',
      'signature resize',
      'age cutoff',
      'recruitment',
      'govt job',
    ],
  },
];
