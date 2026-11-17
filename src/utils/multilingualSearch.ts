interface KeywordCluster {
  tags: string[];
  aliases: string[];
}

const KEYWORD_CLUSTERS: KeywordCluster[] = [
  {
    tags: ['pan', 'nsdl', 'protean', 'utiitsl', '49a', 'pan-master-hub'],
    aliases: [
      'पैन', 'पैन कार्ड', 'पैनकार्ड',
      'பான்', 'பான் கார்டு',
      'పాన్', 'పాన్ కార్డ్',
      'पॅन', 'पॅन कार्ड',
      'pan card', 'panchayat pan', 'pancard', 'new pan', 'pan correction',
    ],
  },
  {
    tags: ['aadhaar', 'uidai', 'ekyc', 'eid', 'myaadhaar'],
    aliases: [
      'आधार', 'आधार कार्ड',
      'ஆதார்', 'ஆதார் அட்டை',
      'ఆధార్',
      'आधारकार्ड',
      'aadhar', 'adhar', 'aadhar card',
    ],
  },
  {
    tags: ['ration', 'tnpds', 'nfsa', 'smart card', 'pds', 'family'],
    aliases: [
      'राशन', 'राशन कार्ड', 'खाद्य', 'स्मार्ट कार्ड',
      'ரேஷன்', 'குடும்ப அட்டை', 'ஸ்மார்ட் கார்டு', 'உணவு',
      'రేషన్', 'రేషన్ కార్డ్',
      'रेशन', 'रेशन कार्ड',
      'ration card', 'smart ration', 'tamil nadu pds', 'onorc',
    ],
  },
  {
    tags: ['passport', 'passport-photo-sheet', 'passport-photo-studio', 'mea', 'psp'],
    aliases: [
      'पासपोर्ट', 'पासपोर्ट फोटो', 'वीजा',
      'பாஸ்போர்ட்', 'கடவுச்சீட்டு', 'புகைப்படம்',
      'పాస్‌పోర్ట్', 'పాస్పోర్ట్',
      'पासपोर्ट साइज',
      'visa photo', '35x45', 'ssc photo', 'upsc photo', 'dop',
    ],
  },
  {
    tags: ['id card', 'smart-id-card-studio', 'cr80', 'pvc', 'voter', 'epic'],
    aliases: [
      'पहचान पत्र', 'आईडी कार्ड', 'वोटर', 'चुनाव',
      'அடையாள அட்டை', 'வாக்காளர்',
      'ఓటర్', 'గుర్తింపు కార్డు',
      'ओळखपत्र', 'मतदार',
      'pvc card', 'voter id', 'id card', 'electoral',
    ],
  },
  {
    tags: ['pdf', 'merge', 'split', 'compress', 'protect', 'unlock', 'translate', 'word'],
    aliases: [
      'पीडीएफ', 'जोड़ना', 'कम करना', 'ताला', 'अनलॉक', 'अनुवाद',
      'பிடிஎஃப்', 'இணைப்பு', 'சுருக்க', 'மொழிபெயர்ப்பு',
      'పిడిఎఫ్', 'అనువాదం',
      'पीडीएफ फाइल',
      'pdf jodo', 'pdf kam karo', 'size kam', 'pdf bhasha', 'translate pdf',
    ],
  },
  {
    tags: ['resize', 'photo', 'signature', 'crop', 'kb', 'compress'],
    aliases: [
      'फोटो', 'साइज', 'हस्ताक्षर', 'दस्तखत', 'क्रॉप',
      'கையொப்பம்', 'அளவு',
      'సంతకం', 'ఫోటో',
      'सही', 'फोटो साइज',
      'photo size', 'signature whitener', 'sign resize', '20kb', '50kb', '300kb',
    ],
  },
  {
    tags: ['khata', 'diary', 'receipt', 'client', 'ledger', 'voucher', 'bill'],
    aliases: [
      'खाता', 'हिसाब', 'रसीद', 'बिल', 'डायरी',
      'ரசீது', 'கணக்கு', 'டைரி',
      'రసీదు', 'ఖాతా',
      'हिशोब', 'पावती',
      'khata', 'hisab', 'receipt hub', 'cash memo', 'client diary', 'bill book',
    ],
  },
  {
    tags: ['calculator', 'age', 'word', 'typing', 'fee', 'commission'],
    aliases: [
      'कैलकुलेटर', 'उम्र', 'आयु', 'गिनती', 'फीस', 'कमीशन',
      'கணக்கிடு', 'வயது', 'கட்டணம்',
      'వయస్సు', 'లెక్క',
      'वय', 'गणना',
      'umar', 'age nikalo', 'word counter', 'fee calculator', 'cyber cafe',
    ],
  },
  {
    tags: ['qr', 'barcode', 'upi'],
    aliases: [
      'क्यूआर', 'बारकोड', 'कोड', 'यूपीआई',
      'க்யூஆர்', 'பார்கோடு',
      'క్యూఆర్',
      'qr code', 'upi qr', 'barcode',
    ],
  },
  {
    tags: ['udyam', 'msme', 'business', 'shop', 'gst'],
    aliases: [
      'उद्यम', 'व्यापार', 'एमएसएमई', 'दुकान', 'जीएसटी',
      'தொழில்', 'உத்யம்',
      'ఉద్యమ్', 'వ్యాపారం',
      'उद्योग',
      'msme', 'udyam', 'business registration',
    ],
  },
  {
    tags: ['scholarship', 'nsp', 'student', 'education', 'college'],
    aliases: [
      'छात्रवृत्ति', 'स्कॉलरशिप', 'विद्यार्थी', 'पढ़ाई',
      'உதவித்தொகை', 'மாணவர்',
      'స్కాలర్‌షిప్', 'విద్యార్థి',
      'शिष्यवृत्ती',
      'nsp', 'scholarship', 'student aid',
    ],
  },
  {
    tags: ['consumer', 'helpline', 'complaint', 'grievance', 'fraud'],
    aliases: [
      'शिकायत', 'उपभोक्ता', 'मदद', 'धोखाधड़ी',
      'புகார்', 'நுகர்வோர்',
      'ఫిర్యాదు', 'వినియోగదారు',
      'तक्रार', 'ग्राहक',
      'consumer helpline', 'jago grahak', 'complaint', 'grievance',
    ],
  },
  {
    tags: ['ceir', 'sanchar', 'saathi', 'mobile', 'imei', 'phone', 'lost'],
    aliases: [
      'मोबाइल', 'फोन', 'चोरी', 'खोया', 'संचार साथी',
      'தொலைந்த போன்', 'மொபைல்', 'திருட்டு',
      'మొబైల్', 'ఫోన్',
      'हरवलेला फोन',
      'lost phone', 'stolen mobile', 'imei block', 'sanchar saathi', 'ceir',
    ],
  },
  {
    tags: ['bank', 'rbi', 'epfo', 'pf', 'pension', 'tax', 'income', 'gst'],
    aliases: [
      'बैंक', 'पीएफ', 'पेंशन', 'टैक्स', 'बीमा',
      'வங்கி', 'ஓய்வூதியம்', 'வரி',
      'బ్యాంక్', 'పింఛను',
      'बँक', 'पेन्शन',
      'passbook', 'pf balance', 'itr', 'tax return', 'rbi',
    ],
  },
  {
    tags: ['tamil nadu', 'tnega', 'esevai', 'maharashtra', 'up', 'karnataka', 'kerala', 'delhi'],
    aliases: [
      'तमिलनाडु', 'ई-सेवा', 'महाराष्ट्र', 'उत्तर प्रदेश', 'कर्नाटक', 'केरल', 'दिल्ली',
      'தமிழ்நாடு', 'இ-சேவை', 'வருவாய்', 'சாதி சான்றிதழ்',
      'తమిళనాడు', 'మహారాష్ట్ర',
      'तामिळनाडू', 'आपले सरकार',
      'caste certificate', 'income certificate', 'domicile', 'esevai', 'aaple sarkar', 'seva sindhu',
    ],
  },
];

export function expandMultilingualTokens(rawQuery: string): string[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const expanded = new Set<string>([q]);
  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  words.forEach((w) => expanded.add(w));

  for (const cluster of KEYWORD_CLUSTERS) {
    const allTerms = [...cluster.tags, ...cluster.aliases];
    const matched = allTerms.some(
      (term) => q.includes(term) || words.some((w) => term.includes(w) && w.length >= 3)
    );
    if (matched) {
      cluster.tags.forEach((t) => expanded.add(t));
    }
  }

  return Array.from(expanded);
}

export function matchesMultilingualQuery(
  rawQuery: string,
  fields: Array<string | undefined>
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const haystack = fields
    .filter((f): f is string => typeof f === 'string' && f.length > 0)
    .join(' ')
    .toLowerCase();

  if (haystack.includes(q)) return true;

  const tokens = expandMultilingualTokens(q);
  return tokens.some((tok) => haystack.includes(tok));
}
