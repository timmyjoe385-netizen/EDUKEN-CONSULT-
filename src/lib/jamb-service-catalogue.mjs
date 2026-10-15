export const JAMB_SERVICE_TEMPLATES = [
  {
    name: 'JAMB e-PIN (UTME Without Mock)',
    legacyNames: [],
    category: 'JAMB Services',
    description: 'UTME e-PIN for candidates registering without the optional mock examination.',
    requirements: 'Candidate full name exactly as registered with JAMB; JAMB profile code; JAMB registration year. Do not submit your NIN, OTP, password, or bank-card details.',
    price: 7128,
    is_available: false,
    is_catalog_item: true,
  },
  {
    name: 'JAMB e-PIN (UTME With Mock)',
    legacyNames: [],
    category: 'JAMB Services',
    description: 'UTME e-PIN for candidates registering with the optional mock examination.',
    requirements: 'Candidate full name exactly as registered with JAMB; JAMB profile code; JAMB registration year. Do not submit your NIN, OTP, password, or bank-card details.',
    price: 8613,
    is_available: false,
    is_catalog_item: true,
  },
  {
    name: 'JAMB e-PIN (Direct Entry)',
    legacyNames: [],
    category: 'JAMB Services',
    description: 'JAMB Direct Entry registration e-PIN.',
    requirements: 'Candidate full name exactly as registered with JAMB; JAMB profile code; JAMB registration year. Do not submit your NIN, OTP, password, or bank-card details.',
    price: 5643,
    is_available: false,
    is_catalog_item: true,
  },
  {
    name: 'JAMB e-PIN (Trial-Testing Mock)',
    legacyNames: [],
    category: 'JAMB Services',
    description: 'e-PIN for eligible trial-testing/mock candidates.',
    requirements: 'Candidate full name exactly as registered with JAMB; JAMB profile code; JAMB registration year. Eligibility must be confirmed before processing.',
    price: 3500,
    is_available: false,
    is_catalog_item: true,
  },
  {
    name: 'JAMB Original Result Printing',
    legacyNames: ['JAMB Original Result Slip Guidance'],
    category: 'JAMB Services',
    description: 'Request assistance with obtaining your JAMB original result slip.',
    requirements: 'Candidate full name; JAMB registration number; JAMB examination year.',
    price: 2100,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: 'JAMB Admission Letter Printing',
    legacyNames: ['JAMB Admission Letter Guidance'],
    category: 'JAMB Services',
    description: 'Request assistance with obtaining your JAMB admission letter. You must have been offered admission and accepted it where required.',
    requirements: 'Candidate full name; JAMB registration number; JAMB examination year. Admission must already have been offered in JAMB CAPS.',
    price: 1600,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: 'JAMB Reprinting',
    legacyNames: ['JAMB Reprinting Guidance'],
    category: 'JAMB Services',
    description: 'Request reprinting of an eligible JAMB document.',
    requirements: 'Choose the document type; candidate full name; JAMB registration number; JAMB examination year. Supported document types depend on the current JAMB service.',
    price: 500,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: 'Check JAMB Admission Status',
    legacyNames: [],
    category: 'JAMB Services',
    description: 'Request guidance checking your admission status through official JAMB channels.',
    requirements: 'Candidate full name; JAMB registration number; JAMB examination year.',
    price: 500,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: "JAMB O'Level Result Screenshot",
    legacyNames: ["JAMB O'Level Confirmation Guidance"],
    category: 'JAMB Services',
    description: 'Request assistance with viewing or obtaining a screenshot of the O’Level result information linked to your JAMB profile.',
    requirements: 'Candidate full name; JAMB registration number; JAMB examination year. Do not attach result documents or share passwords in this form.',
    price: 500,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: 'JAMB Profile Code Retrieval',
    legacyNames: ['JAMB Profile Code Support'],
    category: 'JAMB Services',
    description: 'Request help retrieving your JAMB profile code using the official process.',
    requirements: 'JAMB registration number OR the phone number used for JAMB registration; JAMB year (BuyCard lists 2021–2026). Never submit your NIN, OTP or password.',
    price: 500,
    is_available: true,
    is_catalog_item: true,
  },
  {
    name: 'JAMB Registration Number Retrieval',
    legacyNames: ['JAMB Registration Number Recovery Guidance'],
    category: 'JAMB Services',
    description: 'Request help retrieving your JAMB registration number using the official process.',
    requirements: 'JAMB profile code OR the phone number used for registration; JAMB year (BuyCard lists 2017–2026). Never submit your NIN, OTP or password.',
    price: 500,
    is_available: true,
    is_catalog_item: true,
  },
];

export function isJambCatalogueService(service) {
  return Boolean(service && (service.is_catalog_item === true || String(service.is_catalog_item).toLowerCase() === 'true'));
}

export function jambServiceFieldsFor(service) {
  const name = String(service?.name || '').trim().toLowerCase();
  const field = (name, label, placeholder = label) => ({ name, label, placeholder });
  const fullName = field('candidateFullName', 'Candidate full name (as registered with JAMB)');
  const registrationNumber = field('registrationNumber', 'JAMB registration number');
  const jambYear = field('jambYear', 'JAMB examination year', 'e.g. 2026');
  const profileCode = field('profileCode', 'JAMB profile code');
  const phoneNumber = field('registeredPhone', 'Phone number used for JAMB registration');
  if (name.includes('e-pin')) return [fullName, profileCode, jambYear];
  if (name.includes('original result printing')) return [fullName, registrationNumber, jambYear];
  if (name.includes('admission letter printing')) return [fullName, registrationNumber, jambYear];
  if (name === 'jamb reprinting') return [
    { name: 'documentType', label: 'Document to reprint', options: ['UTME Examination Slip', 'UTME Registration Slip', 'Direct Entry Registration Slip', 'Original Result Slip', 'Admission Letter', 'Change of Course/Institution Slip', 'Other'] },
    fullName,
    registrationNumber,
    jambYear,
  ];
  if (name.includes('check jamb admission status')) return [fullName, registrationNumber, jambYear];
  if (name.includes("o'level result screenshot")) return [fullName, registrationNumber, jambYear];
  if (name.includes('profile code retrieval')) return [field('registrationNumberOrPhone', 'JAMB registration number OR registered phone number') , jambYear];
  if (name.includes('registration number retrieval')) return [field('profileCodeOrPhone', 'JAMB profile code OR registered phone number'), jambYear];
  return [];
}
