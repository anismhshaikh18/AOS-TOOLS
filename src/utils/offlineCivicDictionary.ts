/**
 * 100% Client-Side Offline Civic, Government Document, Smart Card & Receipt Dictionary
 * plus Indian Script Phonetic Transliteration Engine.
 * Runs entirely in browser memory with zero external network calls.
 */

export interface CivicDictionaryEntry {
  en: string;
  hi: string;
  ta: string;
  te: string;
  mr: string;
  bn: string;
  gu: string;
  kn: string;
  ml: string;
  pa: string;
  ur: string;
}

const CIVIC_PHRASES: CivicDictionaryEntry[] = [
  {
    en: 'government of india',
    hi: 'भारत सरकार',
    ta: 'இந்திய அரசு',
    te: 'భారత ప్రభుత్వం',
    mr: 'भारत सरकार',
    bn: 'ভারত সরকার',
    gu: 'ભારત સરકાર',
    kn: 'ಭಾರತ ಸರ್ಕಾರ',
    ml: 'ഭാരത സർക്കാർ',
    pa: 'ਭਾਰਤ ਸਰਕਾਰ',
    ur: 'حکومتِ ہند',
  },
  {
    en: 'income tax department',
    hi: 'आयकर विभाग',
    ta: 'வருமான வரித் துறை',
    te: 'ఆదాయపు పన్ను శాఖ',
    mr: 'आयकर विभाग',
    bn: 'আয়কর দপ্তর',
    gu: 'આવકવેરા વિભાગ',
    kn: 'ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆ',
    ml: 'ആദായനികുതി വകുപ്പ്',
    pa: 'ਆਮਦਨ ਕਰ ਵਿਭਾਗ',
    ur: 'محکمہ انکم ٹیکس',
  },
  {
    en: 'permanent account number',
    hi: 'स्थायी खाता संख्या',
    ta: 'நிரந்தர கணக்கு எண்',
    te: 'శాశ్వత ఖాతా సంఖ్య',
    mr: 'कायमस्वरूपी खाते क्रमांक',
    bn: 'স্থায়ী অ্যাকাউন্ট নম্বর',
    gu: 'કાયમી ખાતા નંબર',
    kn: 'ಶಾಶ್ವತ ಖಾತೆ ಸಂಖ್ಯೆ',
    ml: 'സ്ഥിരം അക്കൗണ്ട് നമ്പർ',
    pa: 'ਸਥਾਈ ਖਾਤਾ ਨੰਬਰ',
    ur: 'مستقل اکاؤنٹ نمبر',
  },
  {
    en: 'unique identification authority of india',
    hi: 'भारतीय विशिष्ट पहचान प्राधिकरण',
    ta: 'இந்திய தனித்துவ அடையாள ஆணையம்',
    te: 'భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ',
    mr: 'भारतीय विशिष्ट ओळख प्राधिकरण',
    bn: 'ভারতীয় বিশিষ্ট পরিচয় কর্তৃপক্ষ',
    gu: 'ભારતીય વિશિષ્ટ ઓળખ સત્તામંડળ',
    kn: 'ಭಾರತೀಯ ವಿಶಿಷ್ಟ ಗುರುತು ಪ್ರಾಧಿಕಾರ',
    ml: 'യുണീക്ക് ഐഡന്റിഫിക്കേഷൻ അതോറിറ്റി ഓഫ് ഇന്ത്യ',
    pa: 'ਭਾਰਤੀ ਵਿਲੱਖਣ ਪਛਾਣ ਅਥਾਰਟੀ',
    ur: 'بھارتی منفرد شناختی اتھارٹی',
  },
  {
    en: 'election commission of india',
    hi: 'भारत निर्वाचन आयोग',
    ta: 'இந்திய தேர்தல் ஆணையம்',
    te: 'భారత ఎన్నికల సంఘం',
    mr: 'भारतीय निवडणूक आयोग',
    bn: 'ভারতের নির্বাচন কমিশন',
    gu: 'ભારતીય ચૂંટણી પંચ',
    kn: 'ಭಾರತೀಯ ಚುನಾವಣಾ ಆಯೋಗ',
    ml: 'ഇന്ത്യൻ തിരഞ്ഞെടുപ്പ് കമ്മീഷൻ',
    pa: 'ਭਾਰਤੀ ਚੋਣ ਕਮਿਸ਼ਨ',
    ur: 'الیکشن کمیشن آف انڈیا',
  },
  {
    en: 'aadhaar',
    hi: 'आधार',
    ta: 'ஆதார்',
    te: 'ఆధార్',
    mr: 'आधार',
    bn: 'আধার',
    gu: 'આધાર',
    kn: 'ಆಧಾರ್',
    ml: 'ആധാർ',
    pa: 'ਆਧਾਰ',
    ur: 'آدھار',
  },
  {
    en: 'birth certificate',
    hi: 'जन्म प्रमाण पत्र',
    ta: 'பிறப்புச் சான்றிதழ்',
    te: 'జనన ధృవీకరణ పత్రం',
    mr: 'जन्म प्रमाणपत्र',
    bn: 'জন্ম শংসাপত্র',
    gu: 'જન્મ પ્રમાણપત્ર',
    kn: 'ಜನನ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'ജനന സർട്ടിഫിക്കറ്റ്',
    pa: 'ਜਨਮ ਸਰਟੀਫਿਕੇਟ',
    ur: 'پیدائشی سرٹیفکیٹ',
  },
  {
    en: 'income certificate',
    hi: 'आय प्रमाण पत्र',
    ta: 'வருமானச் சான்றிதழ்',
    te: 'ఆదాయ ధృవీకరణ పత్రం',
    mr: 'उत्पन्न प्रमाणपत्र',
    bn: 'আয় শংসাপত্র',
    gu: 'આવકનું પ્રમાણપત્ર',
    kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'വരുമാന സർട്ടിഫിക്കറ്റ്',
    pa: 'ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ',
    ur: 'آمدنی کا سرٹیفکیٹ',
  },
  {
    en: 'caste certificate',
    hi: 'जाति प्रमाण पत्र',
    ta: 'சாதிச் சான்றிதழ்',
    te: 'కుల ధృవీకరణ పత్రం',
    mr: 'जात प्रमाणपत्र',
    bn: 'জাতিগত শংসাপত্র',
    gu: 'જાતિ પ્રમાણપત્ર',
    kn: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'ജാതി സർട്ടിഫിക്കറ്റ്',
    pa: 'ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ',
    ur: 'ذات سرٹیفکیٹ',
  },
  {
    en: 'community certificate',
    hi: 'समुदाय प्रमाण पत्र',
    ta: 'சமூகச் சான்றிதழ்',
    te: 'కుల ధృవీకరణ పత్రం',
    mr: 'जात प्रमाणपत्र',
    bn: 'সম্প্রদায় শংসাপত্র',
    gu: 'સમુદાય પ્રમાણપત્ર',
    kn: 'ಸಮುದಾಯ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'കമ്മ്യൂണിറ്റി സർട്ടിഫിക്കറ്റ്',
    pa: 'ਭਾਈਚਾਰਕ ਸਰਟੀਫਿਕੇਟ',
    ur: 'کمیونٹی سرٹیفکیٹ',
  },
  {
    en: 'residence certificate',
    hi: 'निवास प्रमाण पत्र',
    ta: 'இருப்பிடச் சான்றிதழ்',
    te: 'నివాస ధృవీకరణ పత్రం',
    mr: 'रहिवासी प्रमाणपत्र',
    bn: 'বসবাসের শংসাপত্র',
    gu: 'રહેઠાણ પ્રમાણપત્ર',
    kn: 'ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'താമസ സർട്ടിഫിക്കറ്റ്',
    pa: 'ਰਿਹਾਇਸ਼ੀ ਸਰਟੀਫਿਕੇਟ',
    ur: 'رہائشی سرٹیفکیٹ',
  },
  {
    en: 'domicile certificate',
    hi: 'मूल निवास प्रमाण पत्र',
    ta: 'குடியிருப்புச் சான்றிதழ்',
    te: 'నివాస ధృవీకరణ పత్రం',
    mr: 'अधिवास प्रमाणपत्र',
    bn: 'স্থায়ী বসবাসের শংসাপত্র',
    gu: 'ડોમિસાઇલ પ્રમાણપત્ર',
    kn: 'ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'ഡൊമിസൈൽ സർട്ടിഫിക്കറ്റ്',
    pa: 'ਡੋਮੀਸਾਈਲ ਸਰਟੀਫਿਕੇਟ',
    ur: 'ڈومیسائل سرٹیفکیٹ',
  },
  {
    en: 'nativity certificate',
    hi: 'स्थानीय निवासी प्रमाण पत्र',
    ta: 'பிறப்பிடச் சான்றிதழ்',
    te: 'స్థానికత ధృవీకరణ పత్రం',
    mr: 'मूळ रहिवासी प्रमाणपत्र',
    bn: 'জন্মস্থান শংসাপত্র',
    gu: 'મૂળ વતન પ્રમાણપત્ર',
    kn: 'ಮೂಲ ನಿವಾಸಿ ಪ್ರಮಾಣಪತ್ರ',
    ml: 'നേറ്റിവിറ്റി സർട്ടിഫിക്കറ്റ്',
    pa: 'ਮੂਲ ਨਿਵਾਸੀ ਸਰਟੀਫਿਕੇਟ',
    ur: 'مقامی شہریت سرٹیفکیٹ',
  },
  {
    en: 'smart card',
    hi: 'स्मार्ट कार्ड',
    ta: 'ஸ்மார்ட் கார்டு',
    te: 'స్మార్ట్ కార్డ్',
    mr: 'स्मार्ट कार्ड',
    bn: 'স্মার্ট কার্ড',
    gu: 'સ્માર્ટ કાર્ડ',
    kn: 'ಸ್ಮಾರ್ಟ್ ಕಾರ್ಡ್',
    ml: 'സ്മാർട്ട് കാർഡ്',
    pa: 'ਸਮਾਰਟ ਕਾਰਡ',
    ur: 'اسمارٹ کارڈ',
  },
  {
    en: 'identity card',
    hi: 'पहचान पत्र',
    ta: 'அடையாள அட்டை',
    te: 'గుర్తింపు కార్డు',
    mr: 'ओळखपत्र',
    bn: 'পরিচয়পত্র',
    gu: 'ઓળખ પત્ર',
    kn: 'ಗುರುತಿನ ಚೀಟಿ',
    ml: 'തിരിച്ചറിയൽ കാർഡ്',
    pa: 'ਪਛਾਣ ਪੱਤਰ',
    ur: 'شناختی کارڈ',
  },
  {
    en: 'driving licence',
    hi: 'ड्राइविंग लाइसेंस',
    ta: 'ஓட்டுநர் உரிமம்',
    te: 'డ్రైవింగ్ లైసెన్స్',
    mr: 'वाहन चालक परवाना',
    bn: 'ড্রাইভিং লাইসেন্স',
    gu: 'ડ્રાઇવિંગ લાઇસન્સ',
    kn: 'ಚಾಲನಾ ಪರವಾನಗಿ',
    ml: 'ഡ്രൈവിംഗ് ലൈസൻസ്',
    pa: 'ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ',
    ur: 'ڈرائیونگ لائسنس',
  },
  {
    en: 'ration card',
    hi: 'राशन कार्ड',
    ta: 'குடும்ப அட்டை',
    te: 'రేషన్ కార్డు',
    mr: 'शिधापत्रिका',
    bn: 'রেশন কার্ড',
    gu: 'રેશન કાર્ડ',
    kn: 'ಪಡಿತರ ಚೀಟಿ',
    ml: 'റേഷൻ കാർഡ്',
    pa: 'ਰਾਸ਼ਨ ਕਾਰਡ',
    ur: 'راشن کارڈ',
  },
  {
    en: 'applicant name',
    hi: 'आवेदक का नाम',
    ta: 'விண்ணப்பதாரர் பெயர்',
    te: 'దరఖాస్తుదారు పేరు',
    mr: 'अर्जदाराचे नाव',
    bn: 'আবেদনকারীর নাম',
    gu: 'અરજદારનું નામ',
    kn: 'ಅರ್ಜಿದಾರರ ಹೆಸರು',
    ml: 'അപേക്ഷകന്റെ പേര്',
    pa: 'ਬਿਨੈਕਾਰ ਦਾ ਨਾਮ',
    ur: 'درخواست گزار کا نام',
  },
  {
    en: 'full name',
    hi: 'पूरा नाम',
    ta: 'முழுப் பெயர்',
    te: 'పూర్తి పేరు',
    mr: 'पूर्ण नाव',
    bn: 'পুরো নাম',
    gu: 'પૂરું નામ',
    kn: 'ಪೂರ್ಣ ಹೆಸರು',
    ml: 'മുഴുവൻ പേര്',
    pa: 'ਪੂਰਾ ਨਾਮ',
    ur: 'پورا نام',
  },
  {
    en: 'name',
    hi: 'नाम',
    ta: 'பெயர்',
    te: 'పేరు',
    mr: 'नाव',
    bn: 'নাম',
    gu: 'નામ',
    kn: 'ಹೆಸರು',
    ml: 'പേര്',
    pa: 'ਨਾਮ',
    ur: 'نام',
  },
  {
    en: "father's name",
    hi: 'पिता का नाम',
    ta: 'தந்தையின் பெயர்',
    te: 'తండ్రి పేరు',
    mr: 'वडिलांचे नाव',
    bn: 'পিতার নাম',
    gu: 'પિતાનું નામ',
    kn: 'ತಂದೆಯ ಹೆಸರು',
    ml: 'പിതാവിന്റെ പേര്',
    pa: 'ਪਿਤਾ ਦਾ ਨਾਮ',
    ur: 'والد کا نام',
  },
  {
    en: 'father name',
    hi: 'पिता का नाम',
    ta: 'தந்தையின் பெயர்',
    te: 'తండ్రి పేరు',
    mr: 'वडिलांचे नाव',
    bn: 'পিতার নাম',
    gu: 'પિતાનું નામ',
    kn: 'ತಂದೆಯ ಹೆಸರು',
    ml: 'പിതാവിന്റെ പേര്',
    pa: 'ਪਿਤਾ ਦਾ ਨਾਮ',
    ur: 'والد کا نام',
  },
  {
    en: "mother's name",
    hi: 'माता का नाम',
    ta: 'தாயின் பெயர்',
    te: 'తల్లి పేరు',
    mr: 'आईचे नाव',
    bn: 'মাতার নাম',
    gu: 'માતાનું નામ',
    kn: 'ತಾಯಿಯ ಹೆಸರು',
    ml: 'മാതാവിന്റെ പേര്',
    pa: 'ਮਾਤਾ ਦਾ ਨਾਮ',
    ur: 'والدہ کا نام',
  },
  {
    en: "husband's name",
    hi: 'पति का नाम',
    ta: 'கணவர் பெயர்',
    te: 'భర్త పేరు',
    mr: 'पतीचे नाव',
    bn: 'স্বামীর নাম',
    gu: 'પતિનું નામ',
    kn: 'ಪತಿಯ ಹೆಸರು',
    ml: 'ഭർത്താവിന്റെ പേര്',
    pa: 'ਪਤੀ ਦਾ ਨਾਮ',
    ur: 'شوہر کا نام',
  },
  {
    en: 'date of birth',
    hi: 'जन्म तिथि',
    ta: 'பிறந்த தேதி',
    te: 'పుట్టిన తేదీ',
    mr: 'जन्म तारीख',
    bn: 'জন্ম তারিখ',
    gu: 'જન્મ તારીખ',
    kn: 'ಜನ್ಮ ದಿನಾಂಕ',
    ml: 'ജനനത്തീയതി',
    pa: 'ਜਨਮ ਮਿਤੀ',
    ur: 'تاریخ پیدائش',
  },
  {
    en: 'year of birth',
    hi: 'जन्म वर्ष',
    ta: 'பிறந்த ஆண்டு',
    te: 'పుట్టిన సంవత్సరం',
    mr: 'जन्म वर्ष',
    bn: 'জন্ম সাল',
    gu: 'જન્મ વર્ષ',
    kn: 'ಜನ್ಮ ವರ್ಷ',
    ml: 'ജനന വർഷം',
    pa: 'ਜਨਮ ਸਾਲ',
    ur: 'پیدائش کا سال',
  },
  {
    en: 'dob',
    hi: 'जन्म तिथि',
    ta: 'பிறந்த தேதி',
    te: 'పుట్టిన తేదీ',
    mr: 'जन्म तारीख',
    bn: 'জন্ম তারিখ',
    gu: 'જન્મ તારીખ',
    kn: 'ಜನ್ಮ ದಿನಾಂಕ',
    ml: 'ജനനത്തീയതി',
    pa: 'ਜਨਮ ਮਿਤੀ',
    ur: 'تاریخ پیدائش',
  },
  {
    en: 'age',
    hi: 'आयु',
    ta: 'வயது',
    te: 'వయస్సు',
    mr: 'वय',
    bn: 'বয়স',
    gu: 'ઉંમર',
    kn: 'ವಯಸ್ಸು',
    ml: 'വയസ്സ്',
    pa: 'ਉਮਰ',
    ur: 'عمر',
  },
  {
    en: 'gender',
    hi: 'लिंग',
    ta: 'பாலினம்',
    te: 'లింగం',
    mr: 'लिंग',
    bn: 'লিঙ্গ',
    gu: 'જાતિ',
    kn: 'ಲಿಂಗ',
    ml: 'ലിംഗഭേദം',
    pa: 'ਲਿੰਗ',
    ur: 'جنس',
  },
  {
    en: 'male',
    hi: 'पुरुष',
    ta: 'ஆண்',
    te: 'పురుషుడు',
    mr: 'पुरुष',
    bn: 'পুরুষ',
    gu: 'પુરુષ',
    kn: 'ಪುರುಷ',
    ml: 'പുരുഷൻ',
    pa: 'ਪੁਰਸ਼',
    ur: 'مرد',
  },
  {
    en: 'female',
    hi: 'महिला',
    ta: 'பெண்',
    te: 'స్త్రీ',
    mr: 'स्त्री',
    bn: 'মহিলা',
    gu: 'સ્ત્રી',
    kn: 'ಮಹಿಳೆ',
    ml: 'സ്ത്രീ',
    pa: 'ਔਰਤ',
    ur: 'عورت',
  },
  {
    en: 'address',
    hi: 'पता',
    ta: 'முகவரி',
    te: 'చిరునామా',
    mr: 'पत्ता',
    bn: 'ঠিকানা',
    gu: 'સરનામું',
    kn: 'ವಿಳಾಸ',
    ml: 'വിലാസം',
    pa: 'ਪਤਾ',
    ur: 'پتہ',
  },
  {
    en: 'permanent address',
    hi: 'स्थायी पता',
    ta: 'நிரந்தர முகவரி',
    te: 'శాశ్వత చిరునామా',
    mr: 'कायमचा पत्ता',
    bn: 'স্থায়ী ঠিকানা',
    gu: 'કાયમી સરનામું',
    kn: 'ಶಾಶ್ವತ ವಿಳಾಸ',
    ml: 'സ്ഥിര വിലാസം',
    pa: 'ਸਥਾਈ ਪਤਾ',
    ur: 'مستقل پتہ',
  },
  {
    en: 'village',
    hi: 'ग्राम / गाँव',
    ta: 'கிராமம்',
    te: 'గ్రామం',
    mr: 'गाव',
    bn: 'গ্রাম',
    gu: 'ગામ',
    kn: 'ಗ್ರಾಮ',
    ml: 'ഗ്രാമം',
    pa: 'ਪਿੰਡ',
    ur: 'گاؤں',
  },
  {
    en: 'taluk',
    hi: 'तहसील / तालुका',
    ta: 'வட்டம்',
    te: 'మండలం / తాలూకా',
    mr: 'तालुका',
    bn: 'তালুক',
    gu: 'તાલુકો',
    kn: 'ತಾಲೂಕು',
    ml: 'താലൂക്ക്',
    pa: 'ਤਹਿਸੀਲ',
    ur: 'تعلقہ',
  },
  {
    en: 'tehsil',
    hi: 'तहसील',
    ta: 'வட்டாட்சியர் பிரிவு',
    te: 'తహసీల్',
    mr: 'तहसील',
    bn: 'তহসিল',
    gu: 'તહસીલ',
    kn: 'ತಹಸೀಲ್',
    ml: 'തഹസിൽ',
    pa: 'ਤਹਿਸੀਲ',
    ur: 'تحصیل',
  },
  {
    en: 'district',
    hi: 'जिला',
    ta: 'மாவட்டம்',
    te: 'జిల్లా',
    mr: 'जिल्हा',
    bn: 'জেলা',
    gu: 'જિલ્લો',
    kn: 'ಜಿಲ್ಲೆ',
    ml: 'ജില്ല',
    pa: 'ਜ਼ਿਲ੍ਹਾ',
    ur: 'ضلع',
  },
  {
    en: 'state',
    hi: 'राज्य',
    ta: 'மாநிலம்',
    te: 'రాష్ట్రం',
    mr: 'राज्य',
    bn: 'রাজ্য',
    gu: 'રાજ્ય',
    kn: 'ರಾಜ್ಯ',
    ml: 'സംസ്ഥാനം',
    pa: 'ਰਾਜ',
    ur: 'ریاست',
  },
  {
    en: 'pin code',
    hi: 'पिन कोड',
    ta: 'அஞ்சல் குறியீடு',
    te: 'పిన్ కోడ్',
    mr: 'पिन कोड',
    bn: 'পিন কোড',
    gu: 'પિન કોડ',
    kn: 'ಪಿನ್ ಕೋಡ್',
    ml: 'പിൻ കോഡ്',
    pa: 'ਪਿੰਨ ਕੋਡ',
    ur: 'پن کوڈ',
  },
  {
    en: 'mobile number',
    hi: 'मोबाइल नंबर',
    ta: 'கைபேசி எண்',
    te: 'మొబైల్ నంబర్',
    mr: 'मोबाईल क्रमांक',
    bn: 'মোবাইল নম্বর',
    gu: 'મોબાઇલ નંબર',
    kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    ml: 'മൊബൈൽ നമ്പർ',
    pa: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    ur: 'موبائل نمبر',
  },
  {
    en: 'certificate number',
    hi: 'प्रमाण पत्र संख्या',
    ta: 'சான்றிதழ் எண்',
    te: 'ధృవీకరణ పత్ర సంఖ్య',
    mr: 'प्रमाणपत्र क्रमांक',
    bn: 'শংসাপত্র নম্বর',
    gu: 'પ્રમાણપત્ર નંબર',
    kn: 'ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ',
    ml: 'സർട്ടിഫിക്കറ്റ് നമ്പർ',
    pa: 'ਸਰਟੀਫਿਕੇਟ ਨੰਬਰ',
    ur: 'سرٹیفکیٹ نمبر',
  },
  {
    en: 'certificate no',
    hi: 'प्रमाण पत्र क्र.',
    ta: 'சான்றிதழ் எண்',
    te: 'ధృవీకరణ సంఖ్య',
    mr: 'प्रमाणपत्र क्र.',
    bn: 'শংসাপত্র নং',
    gu: 'પ્રમાણપત્ર નં.',
    kn: 'ಪ್ರಮಾಣಪತ್ರ ಸಂ.',
    ml: 'സർട്ടിഫിക്കറ്റ് നം.',
    pa: 'ਸਰਟੀਫਿਕੇਟ ਨੰ.',
    ur: 'سرٹیفکیٹ نمبر',
  },
  {
    en: 'application number',
    hi: 'आवेदन संख्या',
    ta: 'விண்ணப்ப எண்',
    te: 'దరఖాస్తు సంఖ్య',
    mr: 'अर्ज क्रमांक',
    bn: 'আবেদন নম্বর',
    gu: 'અરજી નંબર',
    kn: 'ಅರ್ಜಿ ಸಂಖ್ಯೆ',
    ml: 'അപേക്ഷാ നമ്പർ',
    pa: 'ਅਰਜ਼ੀ ਨੰਬਰ',
    ur: 'درخواست نمبر',
  },
  {
    en: 'registration number',
    hi: 'पंजीकरण संख्या',
    ta: 'பதிவு எண்',
    te: 'నమోదు సంఖ్య',
    mr: 'नोंदणी क्रमांक',
    bn: 'নিবন্ধন নম্বর',
    gu: 'નોંધણી નંબર',
    kn: 'ನೋಂದಣಿ ಸಂಖ್ಯೆ',
    ml: 'രജിസ്ട്രേഷൻ നമ്പർ',
    pa: 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨੰਬਰ',
    ur: 'رجسٹریشن نمبر',
  },
  {
    en: 'receipt number',
    hi: 'रसीद संख्या',
    ta: 'ரசீது எண்',
    te: 'రసీదు సంఖ్య',
    mr: 'पावती क्रमांक',
    bn: 'রসিদ নম্বর',
    gu: 'રસીદ નંબર',
    kn: 'ರಸೀದಿ ಸಂಖ್ಯೆ',
    ml: 'രസീത് നമ്പർ',
    pa: 'ਰਸੀਦ ਨੰਬਰ',
    ur: 'رسید نمبر',
  },
  {
    en: 'issue date',
    hi: 'जारी करने की तिथि',
    ta: 'வழங்கப்பட்ட தேதி',
    te: 'జారీ చేసిన తేదీ',
    mr: 'निर्गमित दिनांक',
    bn: 'প্রদানের তারিখ',
    gu: 'ઇશ્યૂ તારીખ',
    kn: 'ನೀಡಿದ ದಿನಾಂಕ',
    ml: 'നൽകിയ തീയതി',
    pa: 'ਜਾਰੀ ਕਰਨ ਦੀ ਮਿਤੀ',
    ur: 'اجراء کی تاریخ',
  },
  {
    en: 'date of issue',
    hi: 'जारी करने की तिथि',
    ta: 'வழங்கப்பட்ட தேதி',
    te: 'జారీ చేసిన తేదీ',
    mr: 'जारी दिनांक',
    bn: 'ইস্যু তারিখ',
    gu: 'આપ્યાની તારીખ',
    kn: 'ವಿತರಣಾ ದಿನಾಂಕ',
    ml: 'നൽകിയ തീയതി',
    pa: 'ਜਾਰੀ ਮਿਤੀ',
    ur: 'تاریخِ اجراء',
  },
  {
    en: 'valid till',
    hi: 'वैधता तिथि',
    ta: 'செல்லுபடியாகும் தேதி',
    te: 'చెల్లుబాటు తేదీ',
    mr: 'वैध दिनांक',
    bn: 'মেয়াদ উত্তীর্ণ তারিখ',
    gu: 'માન્ય તારીખ',
    kn: 'ಮಾನ್ಯತೆ ದಿನಾಂಕ',
    ml: 'സാധുത തീയതി',
    pa: 'ਮਿਆਦ ਮਿਤੀ',
    ur: 'قابلِ اعتبار تاریخ',
  },
  {
    en: 'date',
    hi: 'दिनांक',
    ta: 'தேதி',
    te: 'తేదీ',
    mr: 'दिनांक',
    bn: 'তারিখ',
    gu: 'તારીખ',
    kn: 'ದಿನಾಂಕ',
    ml: 'തീയതി',
    pa: 'ਮਿਤੀ',
    ur: 'تاریخ',
  },
  {
    en: 'signature',
    hi: 'हस्ताक्षर',
    ta: 'கையொப்பம்',
    te: 'సంతకం',
    mr: 'स्वाक्षरी',
    bn: 'স্বাক্ষর',
    gu: 'સહી',
    kn: 'ಸಹಿ',
    ml: 'ഒപ്പ്',
    pa: 'ਦਸਤਖਤ',
    ur: 'دستخط',
  },
  {
    en: 'authorized signatory',
    hi: 'अधिकृत हस्ताक्षरकर्ता',
    ta: 'அங்கீகரிக்கப்பட்ட கையொப்பமிட்டவர்',
    te: 'అధికారిక సంతకందారు',
    mr: 'अधिकृत स्वाक्षरीकर्ता',
    bn: 'অনুমোদিত স্বাক্ষরকারী',
    gu: 'અધિકૃત સહી કરનાર',
    kn: 'ಅಧಿಕೃತ ಸಹಿದಾರರು',
    ml: 'അംഗീകൃത ഒപ്പിട്ടയാൾ',
    pa: 'ਅਧਿਕਾਰਤ ਦਸਤਖਤਕਰਤਾ',
    ur: 'مجاز دستخط کنندہ',
  },
  {
    en: 'issuing authority',
    hi: 'जारी करने वाला प्राधिकारी',
    ta: 'வழங்கும் அதிகாரி',
    te: 'జారీ చేసే అధికారి',
    mr: 'निर्गमित अधिकारी',
    bn: 'প্রদানকারী কর্তৃপক্ষ',
    gu: 'જારી કરનાર સત્તાધિકારી',
    kn: 'ನೀಡುವ ಪ್ರಾಧಿಕಾರ',
    ml: 'നൽകുന്ന അതോറിറ്റി',
    pa: 'ਜਾਰੀ ਕਰਨ ਵਾਲਾ ਅਧਿਕਾਰੀ',
    ur: 'جاری کرنے والا مجاز افسر',
  },
  {
    en: 'tehsildar',
    hi: 'तहसीलदार',
    ta: 'வட்டாட்சியர்',
    te: 'తహసీల్దార్',
    mr: 'तहसीलदार',
    bn: 'তহসিলদার',
    gu: 'મામલતદાર',
    kn: 'ತಹಶೀಲ್ದಾರ್',
    ml: 'തഹസിൽദാർ',
    pa: 'ਤਹਿਸੀਲਦਾਰ',
    ur: 'تحصیلدار',
  },
  {
    en: 'verified',
    hi: 'सत्यापित',
    ta: 'சரிபார்க்கப்பட்டது',
    te: 'ధృవీకరించబడింది',
    mr: 'सत्यापित',
    bn: 'যাচাইকৃত',
    gu: 'ચકાસાયેલ',
    kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    ml: 'പരിശോധിച്ചുറപ്പിച്ചു',
    pa: 'ਪ੍ਰਮਾਣਿਤ',
    ur: 'تصدیق شدہ',
  },
  {
    en: 'approved',
    hi: 'स्वीकृत',
    ta: 'அங்கீகரிக்கப்பட்டது',
    te: 'ఆమోదించబడింది',
    mr: 'मंजूर',
    bn: 'অনুমোদিত',
    gu: 'મંજૂર',
    kn: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    ml: 'അംഗീകരിച്ചു',
    pa: 'ਮਨਜ਼ੂਰ',
    ur: 'منظور شدہ',
  },
  {
    en: 'status',
    hi: 'स्थिति',
    ta: 'நிலை',
    te: 'స్థితి',
    mr: 'स्थिती',
    bn: 'অবস্থা',
    gu: 'સ્થિતિ',
    kn: 'ಸ್ಥಿತಿ',
    ml: 'നില',
    pa: 'ਸਥਿਤੀ',
    ur: 'حیثیت',
  },
  {
    en: 'annual income',
    hi: 'वार्षिक आय',
    ta: 'ஆண்டு வருமானம்',
    te: 'వార్షిక ఆదాయం',
    mr: 'वार्षिक उत्पन्न',
    bn: 'বার্ষিক আয়',
    gu: 'વાર્ષિક આવક',
    kn: 'ವಾರ್ಷಿಕ ಆದಾಯ',
    ml: 'വാർഷിക വരുമാനം',
    pa: 'ਸਾਲਾਨਾ ਆਮਦਨ',
    ur: 'سالانہ آمدنی',
  },
  {
    en: 'total amount',
    hi: 'कुल राशि',
    ta: 'மொத்தத் தொகை',
    te: 'మొత్తం సొమ్ము',
    mr: 'एकूण रक्कम',
    bn: 'মোট পরিমাণ',
    gu: 'કુલ રકમ',
    kn: 'ಒಟ್ಟು ಮೊತ್ತ',
    ml: 'ആകെ തുക',
    pa: 'ਕੁੱਲ ਰਕਮ',
    ur: 'کل رقم',
  },
  {
    en: 'amount paid',
    hi: 'भुगतान की गई राशि',
    ta: 'செலுத்திய தொகை',
    te: 'చెల్లించిన మొత్తం',
    mr: 'भरलेली रक्कम',
    bn: 'পরিশোধিত অর্থ',
    gu: 'ચૂકવેલ રકમ',
    kn: 'ಪಾವತಿಸಿದ ಮೊತ್ತ',
    ml: 'അടച്ച തുക',
    pa: 'ਭੁਗਤਾਨ ਕੀਤੀ ਰਕਮ',
    ur: 'ادا کی گئی رقم',
  },
  {
    en: 'receipt',
    hi: 'रसीद',
    ta: 'ரசீது',
    te: 'రసీదు',
    mr: 'पावती',
    bn: 'রসিদ',
    gu: 'રસીદ',
    kn: 'ರಸೀದಿ',
    ml: 'രസീത്',
    pa: 'ਰਸੀਦ',
    ur: 'رسید',
  },
  {
    en: 'nationality',
    hi: 'राष्ट्रीयता',
    ta: 'தேசியம்',
    te: 'జాతీయత',
    mr: 'राष्ट्रीयत्व',
    bn: 'জাতীয়তা',
    gu: 'રાષ્ટ્રીયતા',
    kn: 'ರಾಷ್ಟ್ರೀಯತೆ',
    ml: 'ദേശീയത',
    pa: 'ਰਾਸ਼ਟਰੀਅਤਾ',
    ur: 'شہریت',
  },
  {
    en: 'indian',
    hi: 'भारतीय',
    ta: 'இந்தியர்',
    te: 'భారతీయుడు',
    mr: 'भारतीय',
    bn: 'ভারতীয়',
    gu: 'ભારતીય',
    kn: 'ಭಾರತೀಯ',
    ml: 'ഇന്ത്യൻ',
    pa: 'ਭਾਰਤੀ',
    ur: 'بھارتی',
  },
  {
    en: 'page',
    hi: 'पृष्ठ',
    ta: 'பக்கம்',
    te: 'పేజీ',
    mr: 'पृष्ठ',
    bn: 'পৃষ্ঠা',
    gu: 'પાનું',
    kn: 'ಪುಟ',
    ml: 'പേജ്',
    pa: 'ਪੰਨਾ',
    ur: 'صفحہ',
  },
  {
    en: 'tamil nadu',
    hi: 'तमिलनाडु',
    ta: 'தமிழ்நாடு',
    te: 'తమిళనాడు',
    mr: 'तामिळनाडू',
    bn: 'তামিলনাড়ু',
    gu: 'તમિલનાડુ',
    kn: 'ತಮಿಳುನಾಡು',
    ml: 'തമിഴ്നാട്',
    pa: 'ਤਮਿਲਨਾਡੂ',
    ur: 'تمل ناڈو',
  },
  {
    en: 'government of tamil nadu',
    hi: 'तमिलनाडु सरकार',
    ta: 'தமிழ்நாடு அரசு',
    te: 'తమిళనాడు ప్రభుత్వం',
    mr: 'तामिळनाडू सरकार',
    bn: 'তামিলনাড়ু সরকার',
    gu: 'તમિલનાડુ સરકાર',
    kn: 'ತಮಿಳುನಾಡು ಸರ್ಕಾರ',
    ml: 'തമിഴ്നാട് സർക്കാർ',
    pa: 'ਤਮਿਲਨਾਡੂ ਸਰਕਾਰ',
    ur: 'حکومت تمل ناڈو',
  },
  {
    en: 'department of food supplies and consumer protection',
    hi: 'खाद्य आपूर्ति एवं उपभोक्ता संरक्षण विभाग',
    ta: 'உணவுப் பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத் துறை',
    te: 'ఆహార సరఫరాలు మరియు వినియోగదారుల రక్షణ శాఖ',
    mr: 'अन्न पुरवठा व ग्राहक संरक्षण विभाग',
    bn: 'খাদ্য সরবরাহ ও উপভোক্তা সুরক্ষা দপ্তর',
    gu: 'અન્ન પુરવઠા અને ગ્રાહક સુરક્ષા વિભાગ',
    kn: 'ಆಹಾರ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಇಲಾಖೆ',
    ml: 'ഭക്ഷ്യവിതരണ ഉപഭോക്തൃ സംരക്ഷണ വകുപ്പ്',
    pa: 'ਖੁਰਾਕ ਸਪਲਾਈ ਅਤੇ ਖਪਤਕਾਰ ਸੁਰੱਖਿਆ ਵਿਭਾਗ',
    ur: 'محکمہ خوراک و تحفظ صارفین',
  },
  {
    en: 'electronic card details',
    hi: 'इलेक्ट्रॉनिक कार्ड विवरण',
    ta: 'மின்னணு அட்டை விவரங்கள்',
    te: 'ఎలక్ట్రానిక్ కార్డ్ వివరాలు',
    mr: 'इलेक्ट्रॉनिक कार्ड तपशील',
    bn: 'ইলেকট্রনিক কার্ডের বিবরণ',
    gu: 'ઇલેક્ટ્રોનિક કાર્ડની વિગતો',
    kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಕಾರ್ಡ್ ವಿವರಗಳು',
    ml: 'ഇലക്ട്രോണിക് കാർഡ് വിവരങ്ങൾ',
    pa: 'ਇਲੈਕਟ੍ਰਾਨਿਕ ਕਾਰਡ ਵੇਰਵੇ',
    ur: 'الیکٹرانک کارڈ کی تفصیلات',
  },
  {
    en: 'family card number',
    hi: 'परिवार कार्ड संख्या',
    ta: 'குடும்ப அட்டை எண்',
    te: 'కుటుంబ కార్డ్ సంఖ్య',
    mr: 'कुटुंब कार्ड क्रमांक',
    bn: 'পরিবার কার্ড নম্বর',
    gu: 'કુટુંબ કાર્ડ નંબર',
    kn: 'ಕುಟುಂಬ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ',
    ml: 'കുടുംബ കാർഡ് നമ്പർ',
    pa: 'ਪਰਿਵਾਰ ਕਾਰਡ ਨੰਬਰ',
    ur: 'فیملی کارڈ نمبر',
  },
  {
    en: 'electronic family card number (ufc)',
    hi: 'इलेक्ट्रॉनिक परिवार कार्ड संख्या (UFC)',
    ta: 'மின்னணு குடும்ப அட்டை எண் (UFC)',
    te: 'ఎలక్ట్రానిక్ కుటుంబ కార్డ్ సంఖ్య (UFC)',
    mr: 'इलेक्ट्रॉनिक कुटुंब कार्ड क्रमांक (UFC)',
    bn: 'ইলেকট্রনিক পরিবার কার্ড নম্বর (UFC)',
    gu: 'ઇલેક્ટ્રોનિક કુટુંબ કાર્ડ નંબર (UFC)',
    kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಕುಟುಂಬ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ (UFC)',
    ml: 'ഇലക്ട്രോണിക് കുടുംബ കാർഡ് നമ്പർ (UFC)',
    pa: 'ਇਲੈਕਟ੍ਰਾਨਿਕ ਪਰਿਵਾਰ ਕਾਰਡ ਨੰਬਰ (UFC)',
    ur: 'الیکٹرانک فیملی کارڈ نمبر (UFC)',
  },
  {
    en: 'card type',
    hi: 'कार्ड प्रकार',
    ta: 'அட்டை வகை',
    te: 'కార్డ్ రకం',
    mr: 'कार्ड प्रकार',
    bn: 'কার্ডের ধরন',
    gu: 'કાર્ડનો પ્રકાર',
    kn: 'ಕಾರ್ಡ್ ಪ್ರಕಾರ',
    ml: 'കാർഡ് തരം',
    pa: 'ਕਾਰਡ ਕਿਸਮ',
    ur: 'کارڈ کی قسم',
  },
  {
    en: 'shop code',
    hi: 'दुकान कोड',
    ta: 'கடை குறியீடு',
    te: 'దుకాణం కోడ్',
    mr: 'दुकान कोड',
    bn: 'দোকান কোড',
    gu: 'દુકાન કોડ',
    kn: 'ಅಂಗಡಿ ಕೋಡ್',
    ml: 'കട കോഡ്',
    pa: 'ਦੁਕਾਨ ਕੋਡ',
    ur: 'دکان کا کوڈ',
  },
  {
    en: 'family members',
    hi: 'परिवार के सदस्य',
    ta: 'குடும்ப உறுப்பினர்கள்',
    te: 'కుటుంబ సభ్యులు',
    mr: 'कुटुंबातील सदस्य',
    bn: 'পরিবারের সদস্যরা',
    gu: 'પરિવારના સભ્યો',
    kn: 'ಕುಟುಂಬ ಸದಸ್ಯರು',
    ml: 'കുടുംബാംഗങ്ങൾ',
    pa: 'ਪਰਿਵਾਰਕ ਮੈਂਬਰ',
    ur: 'خاندان کے افراد',
  },
  {
    en: 'cylinder count',
    hi: 'सिलेंडर संख्या',
    ta: 'சிலிண்டர் எண்ணிக்கை',
    te: 'సిలిండర్ల సంఖ్య',
    mr: 'सिलेंडर संख्या',
    bn: 'সিলিন্ডার সংখ্যা',
    gu: 'સિલિન્ડર સંખ્યા',
    kn: 'ಸಿಲಿಂಡರ್ ಸಂಖ್ಯೆ',
    ml: 'സിലിണ്ടർ എണ്ണം',
    pa: 'ਸਿਲੰਡਰ ਗਿਣਤੀ',
    ur: 'سلنڈر کی تعداد',
  },
  {
    en: 'family head details',
    hi: 'परिवार के मुखिया का विवरण',
    ta: 'குடும்பத் தலைவர் விவரங்கள்',
    te: 'కుటుంబ పెద్ద వివరాలు',
    mr: 'कुटुंब प्रमुख तपशील',
    bn: 'পরিবারের প্রধানের বিবরণ',
    gu: 'કુટુંબના વડાની વિગતો',
    kn: 'ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥರ ವಿವರಗಳು',
    ml: 'കുടുംബനാഥന്റെ വിവരങ്ങൾ',
    pa: 'ਪਰਿਵਾਰ ਦੇ ਮੁਖੀ ਦੇ ਵੇਰਵੇ',
    ur: 'خاندان کے سربراہ کی تفصیلات',
  },
  {
    en: 'family member details',
    hi: 'परिवार के सदस्यों का विवरण',
    ta: 'குடும்ப உறுப்பினர் விவரங்கள்',
    te: 'కుటుంబ సభ్యుల వివరాలు',
    mr: 'कुटुंब सदस्यांचा तपशील',
    bn: 'পরিবারের সদস্যদের বিবরণ',
    gu: 'પરિવારના સભ્યોની વિગતો',
    kn: 'ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರಗಳು',
    ml: 'കുടുംബാംഗങ്ങളുടെ വിവരങ്ങൾ',
    pa: 'ਪਰਿਵਾਰਕ ਮੈਂਬਰਾਂ ਦੇ ਵੇਰਵੇ',
    ur: 'خاندان کے افراد کی تفصیلات',
  },
  {
    en: 'father / husband name',
    hi: 'पिता / पति का नाम',
    ta: 'தந்தை / கணவர் பெயர்',
    te: 'తండ్రి / భర్త పేరు',
    mr: 'वडील / पतीचे नाव',
    bn: 'পিতা / স্বামীর নাম',
    gu: 'પિતા / પતિનું નામ',
    kn: 'ತಂದೆ / ಪತಿಯ ಹೆಸರು',
    ml: 'പിതാവിന്റെ / ഭർത്താവിന്റെ പേര്',
    pa: 'ਪਿਤਾ / ਪਤੀ ਦਾ ਨਾਮ',
    ur: 'والد / شوہر کا نام',
  },
  {
    en: 'relationship',
    hi: 'संबंध',
    ta: 'உறவுமுறை',
    te: 'సంబంధం',
    mr: 'नाते',
    bn: 'সম্পর্ক',
    gu: 'સંબંધ',
    kn: 'ಸಂಬಂಧ',
    ml: 'ബന്ധം',
    pa: 'ਰਿਸ਼ਤਾ',
    ur: 'رشتہ',
  },
  {
    en: 'family head',
    hi: 'परिवार का मुखिया',
    ta: 'குடும்பத் தலைவர்',
    te: 'కుటుంబ పెద్ద',
    mr: 'कुटुंब प्रमुख',
    bn: 'পরিবারের প্রধান',
    gu: 'કુટુંબના વડા',
    kn: 'ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥ',
    ml: 'കുടുംബനാഥൻ',
    pa: 'ਪਰਿਵਾਰ ਦਾ ਮੁਖੀ',
    ur: 'خاندان کا سربراہ',
  },
  {
    en: 'wife',
    hi: 'पत्नी',
    ta: 'மனைவி',
    te: 'భార్య',
    mr: 'पत्नी',
    bn: 'স্ত্রী',
    gu: 'પત્ની',
    kn: 'ಪತ್ನಿ',
    ml: 'ഭാര്യ',
    pa: 'ਪਤਨੀ',
    ur: 'بیوی',
  },
  {
    en: 'husband',
    hi: 'पति',
    ta: 'கணவர்',
    te: 'భర్త',
    mr: 'पती',
    bn: 'স্বামী',
    gu: 'પતિ',
    kn: 'ಪತಿ',
    ml: 'ഭർത്താവ്',
    pa: 'ਪਤੀ',
    ur: 'شوہر',
  },
  {
    en: 'son',
    hi: 'पुत्र',
    ta: 'மகன்',
    te: 'కుమారుడు',
    mr: 'मुलगा',
    bn: 'পুত্র',
    gu: 'પુત્ર',
    kn: 'ಮಗ',
    ml: 'മകൻ',
    pa: 'ਪੁੱਤਰ',
    ur: 'بیٹا',
  },
  {
    en: 'daughter',
    hi: 'पुत्री',
    ta: 'மகள்',
    te: 'కుమార్తె',
    mr: 'मुलगी',
    bn: 'কন্যা',
    gu: 'પુત્રી',
    kn: 'ಮಗಳು',
    ml: 'മകൾ',
    pa: 'ਧੀ',
    ur: 'بیٹی',
  },
  {
    en: 'address details',
    hi: 'पता विवरण',
    ta: 'முகவரி விவரங்கள்',
    te: 'చిరునామా వివరాలు',
    mr: 'पत्ता तपशील',
    bn: 'ঠিকানার বিবরণ',
    gu: 'સરનામાની વિગતો',
    kn: 'ವಿಳಾಸದ ವಿವರಗಳು',
    ml: 'വിലാസ വിവരങ്ങൾ',
    pa: 'ਪਤੇ ਦੇ ਵੇਰਵੇ',
    ur: 'پتے کی تفصیلات',
  },
  {
    en: 'address line 1',
    hi: 'पता पंक्ति 1',
    ta: 'முகவரி வரி 1',
    te: 'చిరునామా వరుస 1',
    mr: 'पत्ता ओळ १',
    bn: 'ঠিকানা লাইন ১',
    gu: 'સરનામું લાઇન 1',
    kn: 'ವಿಳಾಸ ಸಾಲು 1',
    ml: 'വിലാസം വരി 1',
    pa: 'ਪਤਾ ਲਾਈਨ 1',
    ur: 'پتہ لائن 1',
  },
  {
    en: 'address line 2',
    hi: 'पता पंक्ति 2',
    ta: 'முகவரி வரி 2',
    te: 'చిరునామా వరుస 2',
    mr: 'पत्ता ओळ २',
    bn: 'ঠিকানা লাইন ২',
    gu: 'સરનામું લાઇન 2',
    kn: 'ವಿಳಾಸ ಸಾಲು 2',
    ml: 'വിലാസം വരി 2',
    pa: 'ਪਤਾ ਲਾਈਨ 2',
    ur: 'پتہ لائن 2',
  },
  {
    en: 'address line 3',
    hi: 'पता पंक्ति 3',
    ta: 'முகவரி வரி 3',
    te: 'చిరునామా వరుస 3',
    mr: 'पत्ता ओळ ३',
    bn: 'ঠিকানা লাইন ৩',
    gu: 'સરનામું લાઇન 3',
    kn: 'ವಿಳಾಸ ಸಾಲು 3',
    ml: 'വിലാസം വരി 3',
    pa: 'ਪਤਾ ਲਾਈਨ 3',
    ur: 'پتہ لائن 3',
  },
  {
    en: 'nfsa card type',
    hi: 'एनएफएसए कार्ड प्रकार',
    ta: 'என்எஃப்எஸ்ஏ அட்டை வகை',
    te: 'ఎన్ఎఫ్ఎస్ఏ కార్డ్ రకం',
    mr: 'एनएफएसए कार्ड प्रकार',
    bn: 'এনএফএসএ কার্ডের ধরন',
    gu: 'એનએફએસએ કાર્ડ પ્રકાર',
    kn: 'ಎನ್ಎಫ್ಎಸ್ಎ ಕಾರ್ಡ್ ಪ್ರಕಾರ',
    ml: 'എൻഎഫ്എസ്എ കാർഡ് തരം',
    pa: 'ਐਨਐਫਐਸਏ ਕਾਰਡ ਕਿਸਮ',
    ur: 'این ایف ایس اے کارڈ کی قسم',
  },
  {
    en: 'number of cylinders',
    hi: 'सिलेंडरों की संख्या',
    ta: 'சிலிண்டர்களின் எண்ணிக்கை',
    te: 'సిలిండర్ల సంఖ్య',
    mr: 'सिलेंडरची संख्या',
    bn: 'সিলিন্ডারের সংখ্যা',
    gu: 'સિલિન્ડરની સંખ્યા',
    kn: 'ಸಿಲಿಂಡರ್‌ಗಳ ಸಂಖ್ಯೆ',
    ml: 'സിലിണ്ടറുകളുടെ എണ്ണം',
    pa: 'ਸਿਲੰਡਰਾਂ ਦੀ ਗਿਣਤੀ',
    ur: 'سلنڈروں کی تعداد',
  },
  {
    en: 'krishnagiri',
    hi: 'कृष्णगिरि',
    ta: 'கிருஷ்ணகிரி',
    te: 'కృష్ణగిరి',
    mr: 'कृष्णगिरी',
    bn: 'কৃষ্ণগিরি',
    gu: 'કૃષ્ણગિરી',
    kn: 'ಕೃಷ್ಣಗಿರಿ',
    ml: 'കൃഷ്ണഗിരി',
    pa: 'ਕ੍ਰਿਸ਼ਨਾਗਿਰੀ',
    ur: 'کرشناگیری',
  },
  {
    en: 'denkanikottai',
    hi: 'देनकनिकोट्टै',
    ta: 'தேன்கனிக்கோட்டை',
    te: 'దేంకణికొట్టై',
    mr: 'देनकनिकोट्टै',
    bn: 'দেনকনিকোট্টাই',
    gu: 'દેનકનિકોટ્ટાઈ',
    kn: 'ದೇಂಕಣಿಕೋಟೆ',
    ml: 'ദേൻകനിക്കോട്ടൈ',
    pa: 'ਦੇਨਕਨੀਕੋਟਾਈ',
    ur: 'دینکنی کوٹائی',
  },
  {
    en: 'note: this is an electronically generated document. therefore, no signature is required.',
    hi: 'नोट: यह इलेक्ट्रॉनिक रूप से जारी दस्तावेज़ है। अतः हस्ताक्षर की आवश्यकता नहीं है।',
    ta: 'குறிப்பு : இது மின்னணு முறையில் வழங்கப்பட்ட ஆவணம். எனவே, இதற்கு கையொப்பம் தேவையில்லை.',
    te: 'గమనిక: ఇది ఎలక్ట్రానిక్ పద్ధతిలో జారీ చేయబడిన పత్రం. కాబట్టి సంతకం అవసరం లేదు.',
    mr: 'टीप: हा इलेक्ट्रॉनिक पद्धतीने जारी केलेला दस्तऐवज आहे. त्यामुळे स्वाक्षरीची आवश्यकता नाही.',
    bn: 'দ্রষ্টব্য: এটি ইলেকট্রনিকভাবে প্রদত্ত নথি। তাই স্বাক্ষরের প্রয়োজন নেই।',
    gu: 'નોંધ: આ ઇલેક્ટ્રોનિક રીતે જારી કરાયેલ દસ્તાવેજ છે. તેથી સહીની જરૂર નથી.',
    kn: 'ಸೂಚನೆ: ಇದು ಎಲೆಕ್ಟ್ರಾನಿಕ್ ರೂಪದಲ್ಲಿ ನೀಡಲಾದ ದಾಖಲೆಯಾಗಿದೆ. ಆದ್ದರಿಂದ ಸಹಿಯ ಅಗತ್ಯವಿಲ್ಲ.',
    ml: 'കുറിപ്പ്: ഇത് ഇലക്ട്രോണിക് ആയി നൽകിയ രേഖയാണ്. അതിനാൽ ഒപ്പ് ആവശ്യമില്ല.',
    pa: 'ਨੋਟ: ਇਹ ਇਲੈਕਟ੍ਰਾਨਿਕ ਤੌਰ ਤੇ ਜਾਰੀ ਕੀਤਾ ਦਸਤਾਵੇਜ਼ ਹੈ। ਇਸ ਲਈ ਦਸਤਖਤ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।',
    ur: 'نوٹ: یہ الیکٹرانک طور پر جاری کردہ دستاویز ہے۔ اس لیے دستخط کی ضرورت نہیں ہے۔',
  },
];

type SupportedDictCode = keyof CivicDictionaryEntry;
const SUPPORTED_DICT_CODES = new Set<string>([
  'en',
  'hi',
  'ta',
  'te',
  'mr',
  'bn',
  'gu',
  'kn',
  'ml',
  'pa',
  'ur',
]);

// Build fast bidirectional lookup index: normalized string -> { entry, detectedLang }
const REVERSE_INDEX = new Map<string, { entry: CivicDictionaryEntry; lang: SupportedDictCode }>();
const COMPACT_INDEX = new Map<string, { entry: CivicDictionaryEntry; lang: SupportedDictCode }>();

const registerIndex = (key: string, entry: CivicDictionaryEntry, lang: SupportedDictCode) => {
  const norm = key.trim().toLowerCase().replace(/\s+/g, ' ');
  if (norm && !REVERSE_INDEX.has(norm)) {
    REVERSE_INDEX.set(norm, { entry, lang });
  }
  const compact = norm.replace(/[\s\-_.:,/()]+/g, '');
  if (compact && !COMPACT_INDEX.has(compact)) {
    COMPACT_INDEX.set(compact, { entry, lang });
  }
};

for (const entry of CIVIC_PHRASES) {
  for (const code of Object.keys(entry) as SupportedDictCode[]) {
    if (entry[code]) {
      registerIndex(entry[code], entry, code);
    }
  }
}

// Common PDF label aliases without spaces/slashed variants
const PHRASE_ALIASES: Record<string, string> = {
  'மின்னணு குடும்ப அட்டை எண்': 'electronic family card number (ufc)',
  'மின்னணு குடும்ப அட்டை எண் (ufc)': 'electronic family card number (ufc)',
  'மின்னணு குடும்ப அட்டை': 'smart card',
  'மின்னணு அட்டை': 'smart card',
  'மின்னணு அட்டை விவரங்கள்': 'electronic card details',
  'குடும்ப அட்டை எண்': 'family card number',
  'குடும்ப உறுப்பினர்': 'family members',
  'உறுப்பினர்கள்': 'family members',
  'குடும்பத் தலைவர் விவரங்கள்': 'family head details',
  'குடும்பத் தலைவர் விபரங்கள்': 'family head details',
  'குடும்ப உறுப்பினர் விவரங்கள்': 'family member details',
  'குடும்ப உறுப்பினர் விபரங்கள்': 'family member details',
  'முகவரி விவரங்கள்': 'address details',
  'முகவரி விபரங்கள்': 'address details',
  'உணவுப் பொருள் வழங்கல்': 'department of food supplies and consumer protection',
  'உணவுப் பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத் துறை': 'department of food supplies and consumer protection',
  'உணவுப்பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத்துறை': 'department of food supplies and consumer protection',
  'தந்தை / கணவர் பெயர்': 'father / husband name',
  'தந்தை/கணவர் பெயர்': 'father / husband name',
  'தந்தை / கணவர் பெயா்': 'father / husband name',
  'தந்தை/ கணவர் பெயர்': 'father / husband name',
  'சிலிண்டர்களின் எண்ணிக்கை': 'number of cylinders',
  'சிலிண்டர் எண்ணிக்கை': 'cylinder count',
  'nfsa அட்டை வகை': 'nfsa card type',
  'பெயர்': 'name',
  'பாலினம்': 'gender',
  'ஆண்': 'male',
  'பெண்': 'female',
  'மகன்': 'son',
  'மகள்': 'daughter',
  'மனைவி': 'wife',
  'கணவர்': 'husband',
  'குடும்பத் தலைவர்': 'family head',
  'வட்டம்': 'taluk',
  'தாலுகா': 'taluk',
  'மாவட்டம்': 'district',
  'கிராமம்': 'village',
  'அஞ்சல் குறியீடு': 'pin code',
  'கடை குறியீடு': 'shop code',
  'தமிழ் நாடு': 'tamil nadu',
  'தமிழ்நாடு': 'tamil nadu',
  'தேன்கனிக்கோட்டை': 'denkanikottai',
  'கிருஷ்ணகிரி': 'krishnagiri',
  'குறிப்பு: இந்த ஆவணம் கணினி வழி வழங்கப்பட்டது, எனவே, இதற்கு சான்றொப்பம் தேவையில்லை':
    'note: this is an electronically generated document. therefore, no signature is required.',
  'குறிப்பு : இந்த ஆவணம் கணினி வழி வழங்கப்பட்டது , எனவே , இதற்கு சான்றொப்பம் தேவையில்லை':
    'note: this is an electronically generated document. therefore, no signature is required.',
};
for (const [alias, canonicalEn] of Object.entries(PHRASE_ALIASES)) {
  const canonicalHit = REVERSE_INDEX.get(canonicalEn);
  if (canonicalHit) {
    registerIndex(alias, canonicalHit.entry, 'ta');
  }
}

const LOWER_CONNECTORS = new Set(['of', 'and', 'the', 'to', 'in', 'on', 'for', 'or', 'a']);

function formatEnglishCivicLabel(rawTarget: string): string {
  if (rawTarget.length > 55 || rawTarget.includes('.')) {
    return rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1);
  }
  const words = rawTarget.split(/\s+/);
  return words
    .map((word, idx) => {
      if (word === '(ufc)' || word === 'ufc' || word === 'nfsa' || word === 'pin' || word === 'dob') {
        return word.toUpperCase();
      }
      if (idx > 0 && idx < words.length - 1 && LOWER_CONNECTORS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      if (/^\([a-z]+\)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Checks whether a full text block (ignoring trailing colons/spaces) matches
 * a verified offline civic/certificate dictionary term.
 */
export function lookupOfflineCivicPhrase(
  rawText: string,
  targetLang: string
): { translated: string; detectedLang: string } | null {
  if (!SUPPORTED_DICT_CODES.has(targetLang)) return null;

  const trimmed = rawText.trim();
  const suffixMatch = trimmed.match(/^(.*?)(\s*[:：\-–]+\s*)$/);
  const core = (suffixMatch ? suffixMatch[1] : trimmed).trim();
  const trailingPunct = suffixMatch ? suffixMatch[2] : '';

  const normalized = core.toLowerCase().replace(/\s+/g, ' ');
  let hit = REVERSE_INDEX.get(normalized);
  if (!hit) {
    const compact = normalized.replace(/[\s\-_.:,/()]+/g, '');
    if (compact.length >= 2) {
      hit = COMPACT_INDEX.get(compact);
    }
  }
  if (!hit) return null;

  const targetVal = hit.entry[targetLang as SupportedDictCode];
  if (!targetVal) return null;

  let formatted = targetVal;
  if (targetLang === 'en') {
    if (core === core.toUpperCase() && /[A-Z]/.test(core)) {
      formatted = targetVal.toUpperCase();
    } else {
      formatted = formatEnglishCivicLabel(targetVal);
    }
  }

  return {
    translated: `${formatted}${trailingPunct}`,
    detectedLang: hit.lang,
  };
}

/**
 * Checks if a label or column heading indicates the corresponding value cell
 * holds a Proper Noun (Person Name or Place/Address) rather than a generic sentence.
 */
export function isProperNounFieldLabel(labelText: string): boolean {
  const norm = labelText.toLowerCase().replace(/[:\-]/g, ' ').trim();
  const compact = norm.replace(/\s+/g, '');
  return (
    /(^|\b)(name|father|husband|mother|guardian|applicant|village|taluk|district|address|street|road|locality)(\b|$)/i.test(
      norm
    ) ||
    compact.includes('பெயர்') ||
    compact.includes('கிராமம்') ||
    compact.includes('முகவரிவரி') ||
    compact.includes('தாலுகா') ||
    compact.includes('வட்டம்') ||
    compact.includes('மாவட்டம்') ||
    compact.includes('नाम') ||
    compact.includes('ग्राम') ||
    compact.includes('गाँव') ||
    compact.includes('पता') ||
    compact.includes('जिला')
  );
}

const TAMIL_CIVIC_ADDRESS_WORDS: Record<string, string> = {
  'எண்': 'No',
  'அஞ்சல்': 'Post',
  'கிராமம்': 'Village',
  'தெரு': 'Street',
  'குறுக்குத்': 'Cross',
  'சாலை': 'Road',
  'நகர்': 'Nagar',
  'புரம்': 'Puram',
  'காலனி': 'Colony',
  'வ': 'W',
  'வடக்கு': 'North',
  'தெற்கு': 'South',
  'கிழக்கு': 'East',
  'மேற்கு': 'West',
  'தேன்கனிக்கோட்டை': 'Denkanikottai',
  'கிருஷ்ணகிரி': 'Krishnagiri',
  'டச்கிர்': 'Daskir',
  'ச்டகிர்': 'Daskir',
  'ஸ்டகிர்': 'Daskir',
  'தஸ்தகீர்': 'Dastagir',
  'தஸ்தகீர்ஷெக்': 'Dastagir Shek',
  'ஷாஹீத்': 'Shaheed',
  'ஷாகீத்': 'Shaheed',
  'ஷெக்': 'Shek',
  'ஷைக்': 'Shaik',
  'மொஹ்யாமெட்': 'Mohammed',
  'டெஸ்டாகீர்': 'Dastagir',
  'முகமத்': 'Muhammed',
  'ஜைனப்': 'Zainab',
  'சபுரா': 'Sabura',
  'அசிப்': 'Asif',
};

const TAMIL_VOWELS: Record<string, string> = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'e', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'o', 'ஔ': 'au',
};

const TAMIL_CONSONANTS: Record<string, string> = {
  'க': 'k', 'ங': 'ng', 'ச': 'ch', 'ஞ': 'nj', 'ட': 't', 'ண': 'n',
  'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
  'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r', 'ன': 'n',
  'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h', 'ஶ': 'sh',
};

const TAMIL_SIGNS: Record<string, string> = {
  'ா': 'a', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'u',
  'ெ': 'e', 'ே': 'e', 'ை': 'ai', 'ொ': 'o', 'ோ': 'o', 'ௌ': 'au',
};

function transliterateSingleTamilWord(word: string): string {
  const lowerClean = word.replace(/^[(["']+|[)\],"':.]+$/g, '');
  const prefix = word.slice(0, word.indexOf(lowerClean));
  const suffix = word.slice(word.indexOf(lowerClean) + lowerClean.length);

  if (TAMIL_CIVIC_ADDRESS_WORDS[lowerClean]) {
    return `${prefix}${TAMIL_CIVIC_ADDRESS_WORDS[lowerClean]}${suffix}`;
  }
  if (!/[\u0B80-\u0BFF]/.test(lowerClean)) return word;

  const chars = Array.from(lowerClean);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    const prev = chars[i - 1];

    if (TAMIL_VOWELS[ch]) {
      out += TAMIL_VOWELS[ch];
      continue;
    }

    if (TAMIL_CONSONANTS[ch]) {
      let base = TAMIL_CONSONANTS[ch];
      // Contextual voicing for intervocalic/post-nasal Tamil stops
      if (i > 0) {
        if (ch === 'க' && prev !== '்' && next !== '்') base = 'g';
        if (ch === 'க' && prev === '்' && chars[i - 2] === 'ங்') base = 'g';
        if (ch === 'ச' && (i === 0 || prev === '்')) base = 's';
        if (ch === 'ச' && i > 0 && prev !== '்') base = 's';
        if (ch === 'ட' && prev === '்' && (chars[i - 2] === 'ண' || chars[i - 2] === 'ன்')) base = 'd';
        if (ch === 'ட' && i > 0 && prev !== '்' && next !== '்') base = 'd';
        if (ch === 'த' && prev === '்' && chars[i - 2] === 'ந') base = 'd';
        if (ch === 'ப' && prev === '்' && chars[i - 2] === 'ம') base = 'b';
        if (ch === 'ப' && i > 0 && prev !== '்' && next !== '்') base = 'b';
      } else {
        if (ch === 'ச') base = 's';
      }

      if (next === '்') {
        out += base;
        i++; // consume pulli virama
      } else if (next && TAMIL_SIGNS[next]) {
        out += base + TAMIL_SIGNS[next];
        i++; // consume vowel modifier
      } else {
        out += base + 'a';
      }
      continue;
    }

    if (ch === '்' || ch === 'ஃ') continue;
    out += TAMIL_SIGNS[ch] ?? ch;
  }

  const capitalized = out.charAt(0).toUpperCase() + out.slice(1);
  return `${prefix}${capitalized}${suffix}`;
}

/**
 * Translates & transliterates person names or village/address proper-noun cells cleanly
 * into Title Case English so names/villages are never turned into literal dictionary nouns.
 */
export function transliterateProperNounFieldToEnglish(rawText: string): string {
  // Handle attached parentheses like "உள்ளுகுருக்கி(அஞ்சல்)" and restore glued known name segments if spaces were missing
  let prepared = rawText.replace(/\(/g, ' (').replace(/\s+/g, ' ').trim();
  const compoundKeys = Object.keys(TAMIL_CIVIC_ADDRESS_WORDS)
    .filter((k) => k.length >= 3)
    .sort((a, b) => b.length - a.length);
  for (const ck of compoundKeys) {
    if (prepared.includes(ck) && prepared !== ck) {
      prepared = prepared.replaceAll(ck, ` ${ck} `);
    }
  }
  prepared = prepared.replace(/\s+/g, ' ').trim();

  const tokens = prepared.split(/\s+/);
  const convertToken = (tok: string): string => {
    if (/[\u0900-\u097F]/.test(tok)) {
      const dev = transliterateOfflineBasic(tok, 'en');
      return dev.charAt(0).toUpperCase() + dev.slice(1);
    }
    return transliterateSingleTamilWord(tok);
  };
  const converted = tokens.map((tok) => {
    // Handle colon prefixes like "எண்:999"
    const colonParts = tok.split(':');
    if (colonParts.length === 2) {
      return `${convertToken(colonParts[0])}: ${convertToken(colonParts[1])}`;
    }
    return convertToken(tok);
  });
  return converted
    .join(' ')
    .replace(/\s+:/g, ':')
    .replace(/:\s+/g, ': ')
    .replace(/\s+\)/g, ')')
    .trim();
}

/**
 * Attempts local phrase/word substitution + phonetic Indian-script transliteration
 * when running in 100% air-gapped offline mode without external endpoints.
 */
export function translateOfflineWithDictionaryAndTransliteration(
  rawText: string,
  targetLang: string
): string {
  const direct = lookupOfflineCivicPhrase(rawText, targetLang);
  if (direct) return direct.translated;

  // Check colon-separated "Label : Value" pattern
  const colonIdx = rawText.indexOf(':');
  if (colonIdx > 0 && colonIdx < rawText.length - 1) {
    const labelPart = rawText.slice(0, colonIdx).trim();
    const valuePart = rawText.slice(colonIdx + 1).trim();
    const labelHit = lookupOfflineCivicPhrase(labelPart, targetLang);
    const valueHit = lookupOfflineCivicPhrase(valuePart, targetLang);

    if (labelHit || valueHit) {
      const tLabel = labelHit ? labelHit.translated : transliterateOfflineBasic(labelPart, targetLang);
      const tVal = valueHit ? valueHit.translated : transliterateOfflineBasic(valuePart, targetLang);
      return `${tLabel}: ${tVal}`;
    }
  }

  // Sub-phrase token substitution
  const words = rawText.split(/\s+/);
  const replaced = words.map((w) => {
    const clean = w.replace(/[.,;:()]+$/g, '');
    const punct = w.slice(clean.length);
    const hit = lookupOfflineCivicPhrase(clean, targetLang);
    return hit ? `${hit.translated}${punct}` : transliterateOfflineBasic(w, targetLang);
  });

  return replaced.join(' ');
}

// Basic Devanagari / Tamil -> Latin phonetic table for 100% offline fallback of names/places
const DEVANAGARI_TO_LATIN: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ः': 'h', '्': '', '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

function transliterateOfflineBasic(token: string, targetLang: string): string {
  if (targetLang !== 'en') return token;
  if (/[\u0900-\u097F]/.test(token)) {
    let out = '';
    for (const ch of token) {
      out += DEVANAGARI_TO_LATIN[ch] ?? ch;
    }
    return out;
  }
  if (/[\u0B80-\u0BFF]/.test(token)) {
    return transliterateSingleTamilWord(token);
  }
  return token;
}
