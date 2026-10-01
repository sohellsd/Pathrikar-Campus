import { jsPDF } from 'jspdf';
import { AppState, CourseType } from './types';

export interface DocItem {
  name: string;
  englishName?: string;
  subName?: string;
  englishSubName?: string;
  badge?: string;
  fileName?: string;
  instruction?: string;
  isDsyQualifying?: boolean;
  dsyCourse?: 'polytechnic' | 'be_btech';
}

export interface SectionItem {
  title: string;
  englishTitle?: string;
  subtitle?: string;
  docs: DocItem[];
}

interface PillData {
  text: string;
  type: 'required' | 'create_one_pdf' | 'anyone' | 'otp' | 'default';
}

// ============================================================================
// DEDICATED ENGLISH-ONLY PDF CONTENT SOURCE
// The PDF generator exclusively references this dictionary.
// ============================================================================
export const pdfEnglishStrings = {
  mainTitle: 'DOCUMENT CHECKLIST',
  studentInfo: {
    studentName: 'Student Name:',
    course: 'Course:',
    category: 'Category:',
    admissionType: 'Admission Type:',
    dsy: 'Direct Second Year (DSY)',
    regular: 'Regular',
    hostel: 'Hostel Accommodation:',
    yes: 'Yes'
  },
  sections: {
    keepReady: 'KEEP THESE READY',
    identity: 'IDENTITY & RESIDENCY',
    category: 'CATEGORY DOCUMENTS',
    incomeBank: 'INCOME & BANKING DETAILS',
    academic: 'ACADEMIC & ADMISSION PROOF',
    prevEdu: 'PREVIOUS EDUCATION RECORDS',
    leaving: 'TRANSFER / LEAVING CERTIFICATE',
    hostel: 'HOSTEL ACCOMMODATION'
  },
  prerequisites: {
    mahaId: 'MahaID',
    aadhaarCard: 'Aadhaar Card',
    aadhaarMobile: 'Aadhaar-linked Mobile'
  },
  badges: {
    required: 'REQUIRED',
    original: 'ORIGINAL',
    xerox: 'XEROX',
    anyOne: 'ANY ONE',
    ifApplicable: 'IF APPLICABLE',
    otp: 'OTP',
    createOnePdf: 'CREATE ONE PDF'
  }
};

// Canonical English Document Dictionary for any localized strings
const CANONICAL_DOC_MAP: Record<string, string> = {
  // Caste & Category
  'caste certificate': 'Caste Certificate',
  'जात प्रमाणपत्र': 'Caste Certificate',
  'जाति प्रमाण पत्र': 'Caste Certificate',
  'caste validity certificate': 'Caste Validity Certificate',
  'जात वैधता प्रमाणपत्र': 'Caste Validity Certificate',
  'जाति वैधता प्रमाण पत्र': 'Caste Validity Certificate',
  'ncl certificate': 'Non-Creamy Layer Certificate (NCL)',
  'non-creamy layer certificate (ncl)': 'Non-Creamy Layer Certificate (NCL)',
  'non-creamy layer certificate': 'Non-Creamy Layer Certificate (NCL)',
  'नॉन-क्रिमीलेअर प्रमाणपत्र (ncl)': 'Non-Creamy Layer Certificate (NCL)',
  'नॉन-क्रीमी लेयर प्रमाण पत्र (ncl)': 'Non-Creamy Layer Certificate (NCL)',

  // Income & Banking
  'income certificate': 'Income Certificate',
  'उत्पन्न प्रमाणपत्र': 'Income Certificate',
  'आय प्रमाण पत्र': 'Income Certificate',
  'bank passbook / bank details proof': 'Bank Passbook / Bank Details Proof',
  'bank passbook / bank account proof': 'Bank Passbook / Bank Details Proof',
  'बँक पासबुक / बँक खाते पुरावा': 'Bank Passbook / Bank Details Proof',
  'बैंक पासबुक / बैंक विवरण प्रमाण': 'Bank Passbook / Bank Details Proof',

  // Domicile & Ration
  'domicile certificate': 'Domicile Certificate',
  'निवासी प्रमाणपत्र (डोमिसाईल)': 'Domicile Certificate',
  'निवासी प्रमाणपत्र': 'Domicile Certificate',
  'अधिवास प्रमाण पत्र (डोमिसाइल)': 'Domicile Certificate',
  'अधिवास प्रमाण पत्र': 'Domicile Certificate',
  'ration card (front & back)': 'Ration Card (Front & Back)',
  'रेशन कार्ड (पुढील व मागील पान)': 'Ration Card (Front & Back)',
  'राशन कार्ड (आगे और पीछे का पृष्ठ)': 'Ration Card (Front & Back)',
  'alpabhudharak certificate / job card': 'Alpabhudharak Certificate / Job Card',
  'अल्पभूधारक प्रमाणपत्र किंवा जॉब कार्ड': 'Alpabhudharak Certificate / Job Card',
  'अल्पभूधारक प्रमाण पत्र या जॉब कार्ड': 'Alpabhudharak Certificate / Job Card',

  // Academic & Admission
  'college allotment letter (cap)': 'College Allotment Letter (CAP)',
  'college allotment letter': 'College Allotment Letter (CAP)',
  'कॉलेज वाटप पत्र (allotment letter)': 'College Allotment Letter (CAP)',
  'कॉलेज आवंटन पत्र (allotment letter)': 'College Allotment Letter (CAP)',
  'bonafide certificate + fee receipt': 'Bonafide Certificate + Fee Receipt',
  'bonafide certificate + fees paid receipt': 'Bonafide Certificate + Fee Receipt',
  'बोनाफाईड प्रमाणपत्र + फी पावती': 'Bonafide Certificate + Fee Receipt',
  'बोनाफाइड प्रमाण पत्र + शुल्क रसीद': 'Bonafide Certificate + Fee Receipt',
  'bonafide certificate': 'Bonafide Certificate',
  'बोनाफाईड प्रमाणपत्र': 'Bonafide Certificate',
  'बोनाफाइड प्रमाण पत्र': 'Bonafide Certificate',

  // Previous Education
  '10th marksheet': '10th Marksheet',
  '१० वी मार्कशीट': '10th Marksheet',
  '१० वीं मार्कशीट': '10th Marksheet',
  '12th marksheet': '12th Marksheet',
  '१२ वी मार्कशीट': '12th Marksheet',
  '१२ वीं मार्कशीट': '12th Marksheet',
  'polytechnic / diploma marksheet': 'Polytechnic / Diploma Marksheet',
  'diploma 2nd year marksheet': 'Diploma 2nd Year Marksheet',
  'पॉलिटेक्निक / डिप्लोमा मार्कशीट': 'Polytechnic / Diploma Marksheet',
  'diploma final year marksheet': 'Diploma Final Year Marksheet',
  'डिप्लोमा अंतिम वर्ष मार्कशीट': 'Diploma Final Year Marksheet',
  'gap certificate (affidavit)': 'Gap Certificate (Affidavit)',
  'gap certificate': 'Gap Certificate (Affidavit)',
  'गॅप प्रमाणपत्र (प्रतिज्ञापत्र)': 'Gap Certificate (Affidavit)',
  'गैप प्रमाण पत्र (शपथ पत्र)': 'Gap Certificate (Affidavit)',
  'graduation final year / final semester marksheet': 'Graduation Final Year / Semester Marksheet',
  'पदवी अंतिम वर्ष / सेमिस्टर मार्कशीट': 'Graduation Final Year / Semester Marksheet',
  'स्नातक अंतिम वर्ष / सेमेस्टर मार्कशीट': 'Graduation Final Year / Semester Marksheet',

  // Leaving & Transfer
  '12th / diploma leaving certificate (lc/tc)': 'Leaving Certificate (LC / TC)',
  'leaving certificate (lc / tc)': 'Leaving Certificate (LC / TC)',
  'leaving certificate': 'Leaving Certificate (LC / TC)',
  'शाळा / कॉलेज सोडल्याचा दाखला (lc/tc)': 'Leaving Certificate (LC / TC)',
  'शाळा / कॉलेज सोडल्याचा दाखला': 'Leaving Certificate (LC / TC)',
  'विद्यालय / महाविद्यालय स्थानांतरण प्रमाण पत्र (tc / lc)': 'Leaving Certificate (LC / TC)',
  'graduation tc / leaving certificate': 'Graduation Transfer Certificate (TC)',
  'graduation transfer certificate (tc)': 'Graduation Transfer Certificate (TC)',
  'पदवी ट्रान्सफर सर्टिफिकेट (tc)': 'Graduation Transfer Certificate (TC)',
  'स्नातक स्थानांतरण प्रमाण पत्र (tc)': 'Graduation Transfer Certificate (TC)',

  // Hostel
  'hostel bond + owner’s tax receipt': 'Hostel Agreement Bond + Tax Receipt',
  'hostel agreement bond + tax receipt': 'Hostel Agreement Bond + Tax Receipt',
  'वसतिगृह करारपत्र + घरपट्टी पावती': 'Hostel Agreement Bond + Tax Receipt',
  'छात्रावास अनुबंध पत्र + संपत्ति कर रसीद': 'Hostel Agreement Bond + Tax Receipt',

  // Current Year Marksheets
  '1st year marksheet (sem 1 + sem 2)': '1st Year Marksheet (Sem 1 + Sem 2)',
  '2nd year marksheet (sem 3 + sem 4)': '2nd Year Marksheet (Sem 3 + Sem 4)',
  '3rd year marksheet (sem 5 + sem 6)': '3rd Year Marksheet (Sem 5 + Sem 6)',
  '4th year marksheet (sem 7 + sem 8)': '4th Year Marksheet (Sem 7 + Sem 8)',
  '१ ले वर्ष मार्कशीट (सेम १ + सेम २)': '1st Year Marksheet (Sem 1 + Sem 2)',
  '२ रे वर्ष मार्कशीट (सेम ३ + सेम ४)': '2nd Year Marksheet (Sem 3 + Sem 4)',
  '३ रे वर्ष मार्कशीट (सेम ५ + सेम ६)': '3rd Year Marksheet (Sem 5 + Sem 6)',
  '४ थे वर्ष मार्कशीट (सेम ७ + सेम ८)': '4th Year Marksheet (Sem 7 + Sem 8)',
  'प्रथम वर्ष मार्कशीट (सेम १ + सेम २)': '1st Year Marksheet (Sem 1 + Sem 2)',
  'द्वितीय वर्ष मार्कशीट (सेम ३ + सेम ४)': '2nd Year Marksheet (Sem 3 + Sem 4)',
  'तृतीय वर्ष मार्कशीट (सेम ५ + सेम ६)': '3rd Year Marksheet (Sem 5 + Sem 6)',
  'चतुर्थ वर्ष मार्कशीट (सेम ७ + सेम ८)': '4th Year Marksheet (Sem 7 + Sem 8)',
  '1st year marksheet': '1st Year Marksheet',
  '2nd year marksheet': '2nd Year Marksheet',
  '१ ले वर्ष मार्कशीट': '1st Year Marksheet',
  '२ रे वर्ष मार्कशीट': '2nd Year Marksheet',
  'प्रथम वर्ष मार्कशीट': '1st Year Marksheet',
  'द्वितीय वर्ष मार्कशीट': '2nd Year Marksheet',

  // DSY Qualifying
  'qualifying document for dsy': 'Qualifying Document for DSY',
  'थेट द्वितीय वर्ष पात्रता कागदपत्र': 'Qualifying Document for DSY',
  'डायरेक्ट सेकंड ईयर पात्रता दस्तावेज़': 'Qualifying Document for DSY'
};

function resolveEnglishDocName(rawName: string, englishName?: string): string {
  if (englishName && englishName.trim()) {
    return englishName.replace(/[\u0900-\u097F]/g, '').trim();
  }
  const clean = rawName.split('\n')[0].trim().toLowerCase();
  for (const [k, v] of Object.entries(CANONICAL_DOC_MAP)) {
    if (clean === k || clean.includes(k) || k.includes(clean)) {
      return v;
    }
  }
  // Strip any non-Latin Unicode characters
  const stripped = rawName.split('\n')[0].replace(/[\u0900-\u097F]/g, '').trim();
  return stripped || 'Required Document';
}

function resolveEnglishSectionTitle(rawTitle: string, englishTitle?: string): string {
  if (englishTitle && englishTitle.trim()) {
    return englishTitle.replace(/[\u0900-\u097F]/g, '').trim().toUpperCase();
  }
  const lower = rawTitle.toLowerCase().trim();
  if (lower.includes('category') || lower.includes('जात') || lower.includes('प्रवर्ग') || lower.includes('श्रेणी')) {
    return pdfEnglishStrings.sections.category;
  }
  if (lower.includes('residency') || lower.includes('identity') || lower.includes('रहिवासी') || lower.includes('निवासी') || lower.includes('निवास')) {
    return pdfEnglishStrings.sections.identity;
  }
  if (lower.includes('income') || lower.includes('bank') || lower.includes('उत्पन्न') || lower.includes('बँक') || lower.includes('आय')) {
    return pdfEnglishStrings.sections.incomeBank;
  }
  if (lower.includes('academic') || lower.includes('admission') || lower.includes('शैक्षणिक')) {
    return pdfEnglishStrings.sections.academic;
  }
  if (lower.includes('previous') || lower.includes('prior') || lower.includes('मागील') || lower.includes('पिछली')) {
    return pdfEnglishStrings.sections.prevEdu;
  }
  if (lower.includes('leaving') || lower.includes('transfer') || lower.includes('सोडल्याचा') || lower.includes('स्थानांतरण')) {
    return pdfEnglishStrings.sections.leaving;
  }
  if (lower.includes('hostel') || lower.includes('वसतिगृह') || lower.includes('छात्रावास')) {
    return pdfEnglishStrings.sections.hostel;
  }
  return rawTitle.replace(/[\u0900-\u097F]/g, '').trim().toUpperCase() || 'DOCUMENTS';
}

export function generateChecklistPdf(params: {
  studentName: string;
  state: AppState;
  sections: SectionItem[];
}): string {
  const { studentName, state, sections } = params;

  // Standard A4 dimensions in mm: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178 mm
  const maxY = pageHeight - 15; // 282 mm
  let currentY = 15;

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > maxY) {
      doc.addPage();
      currentY = 15;
      return true;
    }
    return false;
  };

  // 1. Title Header (Large, bold, 20pt)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(pdfEnglishStrings.mainTitle, marginX, currentY + 5.5);
  currentY += 8;

  // Thin clean horizontal rule
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 3.5;

  // 2. Student Details Box (Clean Two-Column Grid)
  const isDsy = state.isDirectSecondYear;
  const isHosteller = Boolean(state.isHosteller);
  const infoHeight = isHosteller ? 19 : 14.5;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.roundedRect(marginX, currentY, contentWidth, infoHeight, 1.5, 1.5, 'FD');

  const col1X = marginX + 3.5;
  const col2X = marginX + 90;

  // Row 1
  let rowY = currentY + 4.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(pdfEnglishStrings.studentInfo.studentName, col1X, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  const cleanDisplayName = studentName.trim().replace(/[\u0900-\u097F]/g, '').trim() || 'Student';
  doc.text(cleanDisplayName, col1X + 26, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(pdfEnglishStrings.studentInfo.course, col2X, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const courseStr = state.courseType ? String(state.courseType).replace(/_/g, ' ') : (state.stream || 'Engineering');
  doc.text(courseStr, col2X + 15, rowY);

  // Row 2
  rowY += 5.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(pdfEnglishStrings.studentInfo.category, col1X, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(String(state.category || 'Open'), col1X + 26, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(pdfEnglishStrings.studentInfo.admissionType, col2X, rowY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(isDsy ? pdfEnglishStrings.studentInfo.dsy : pdfEnglishStrings.studentInfo.regular, col2X + 29, rowY);

  if (isHosteller) {
    rowY += 4.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(pdfEnglishStrings.studentInfo.hostel, col1X, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(pdfEnglishStrings.studentInfo.yes, col1X + 42, rowY);
  }

  currentY += infoHeight + 3.5;

  // 3. Helper: Draw Semantic Badge Pill (Right to Left)
  const drawBadge = (text: string, rightX: number, centerY: number, type: PillData['type']) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    const textW = doc.getTextWidth(text);
    const pillPad = 2.5;
    const pillW = textW + pillPad * 2;
    const pillH = 4.5;
    const pillX = rightX - pillW;
    const pillY = centerY - pillH / 2;

    if (type === 'required') {
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(254, 202, 202); // red-200
      doc.setTextColor(220, 38, 38);   // red-600
    } else if (type === 'create_one_pdf') {
      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(186, 230, 253); // sky-200
      doc.setTextColor(2, 132, 199);   // sky-600
    } else if (type === 'anyone') {
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.setDrawColor(199, 210, 254); // indigo-200
      doc.setTextColor(67, 56, 202);   // indigo-700
    } else if (type === 'otp') {
      doc.setFillColor(254, 243, 199); // amber-50
      doc.setDrawColor(253, 230, 138); // amber-200
      doc.setTextColor(180, 83, 9);    // amber-700
    } else {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setTextColor(71, 85, 105);   // slate-600
    }

    doc.setLineWidth(0.2);
    doc.roundedRect(pillX, pillY, pillW, pillH, 1, 1, 'FD');
    doc.text(text, pillX + pillPad, centerY + 1.2);

    return pillW + 1.8; // return occupied width plus spacing
  };

  // 4. Helper: Draw Clean A4-Width Document Card
  const drawDocCard = (name: string, badges: PillData[] = [], subtext?: string) => {
    const cardH = subtext ? 13.5 : 9.8;
    checkPageBreak(cardH + 1.8);

    // Card background & subtle border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.roundedRect(marginX, currentY, contentWidth, cardH, 1.2, 1.2, 'FD');

    const centerY = currentY + (cardH / 2);

    // Checkbox
    const boxSize = 3.8;
    const boxX = marginX + 3.2;
    const boxY = centerY - boxSize / 2;
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.roundedRect(boxX, boxY, boxSize, boxSize, 0.7, 0.7, 'FD');

    // Badges (drawn right to left)
    let rightOffset = marginX + contentWidth - 3;
    for (const b of badges) {
      const occupied = drawBadge(b.text, rightOffset, centerY, b.type);
      rightOffset -= occupied;
    }

    // Document Name (Plain English Text)
    const textStartX = marginX + 10.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900

    if (subtext) {
      doc.text(name, textStartX, currentY + 5.2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202); // indigo-700
      doc.text(subtext, textStartX, currentY + 10.5);
    } else {
      doc.text(name, textStartX, centerY + 1.3);
    }

    currentY += cardH + 1.6;
  };

  // 5. Helper: Draw Section Header
  const drawSectionHeader = (title: string) => {
    checkPageBreak(15);
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title.toUpperCase(), marginX, currentY);

    // Subtle underline rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + 1.5, marginX + contentWidth, currentY + 1.5);

    currentY += 3.5;
  };

  const renderedDocs = new Set<string>();

  // 6. Section: KEEP THESE READY (Prerequisites)
  drawSectionHeader(pdfEnglishStrings.sections.keepReady);

  drawDocCard(pdfEnglishStrings.prerequisites.mahaId, [
    { text: pdfEnglishStrings.badges.required, type: 'required' }
  ]);
  renderedDocs.add('mahaid');

  drawDocCard(pdfEnglishStrings.prerequisites.aadhaarCard, [
    { text: pdfEnglishStrings.badges.required, type: 'required' },
    { text: pdfEnglishStrings.badges.original, type: 'default' }
  ]);
  renderedDocs.add('aadhaar card');

  drawDocCard(pdfEnglishStrings.prerequisites.aadhaarMobile, [
    { text: pdfEnglishStrings.badges.otp, type: 'otp' }
  ]);
  renderedDocs.add('aadhaar-linked mobile');

  // 7. Render Final Resolved Documents from Central Rules Engine
  sections.forEach(section => {
    if (!section.docs || section.docs.length === 0) return;

    const validDocs = section.docs.filter(d => {
      const eng = resolveEnglishDocName(d.name, d.englishName).toLowerCase();
      if (eng.includes('mahaid') || eng.includes('aadhaar') || renderedDocs.has(eng)) {
        return false;
      }
      renderedDocs.add(eng);
      return true;
    });

    if (validDocs.length === 0) return;

    const engSectionTitle = resolveEnglishSectionTitle(section.title, section.englishTitle);
    drawSectionHeader(engSectionTitle);

    validDocs.forEach(d => {
      const engDocName = resolveEnglishDocName(d.name, d.englishName);
      const badges: PillData[] = [];

      // Determine clean English labels
      if (d.badge === 'mandatory') {
        badges.push({ text: pdfEnglishStrings.badges.required, type: 'required' });
        const lower = engDocName.toLowerCase();
        if (
          lower.includes('cert') ||
          lower.includes('marksheet') ||
          lower.includes('passbook') ||
          lower.includes('tc') ||
          lower.includes('lc')
        ) {
          badges.push({ text: pdfEnglishStrings.badges.original, type: 'default' });
        }
      } else if (d.badge === 'merge' || d.badge === 'onepdf') {
        badges.push({ text: pdfEnglishStrings.badges.createOnePdf, type: 'create_one_pdf' });
      } else if (d.badge === 'anyone' || d.badge === 'dsy') {
        badges.push({ text: pdfEnglishStrings.badges.anyOne, type: 'anyone' });
      } else if (engDocName.toLowerCase().includes('gap')) {
        badges.push({ text: pdfEnglishStrings.badges.ifApplicable, type: 'default' });
      } else if (d.badge) {
        badges.push({ text: pdfEnglishStrings.badges.required, type: 'required' });
      }

      // Handle DSY Qualifying Document subtext in pure English
      let subtext: string | undefined = undefined;
      if (d.isDsyQualifying) {
        if (state.courseType === CourseType.Poly_Diploma) {
          subtext = '• ITI Marksheet OR 12th Marksheet (Only 1 required)';
        } else {
          subtext = '• Polytechnic / Diploma Marksheet OR Equivalent Qualification (Only 1 required)';
        }
        if (state.dsyQualification) {
          const qualName =
            state.dsyQualification === 'iti'
              ? 'ITI Marksheet'
              : state.dsyQualification === '12th'
              ? '12th Marksheet'
              : state.dsyQualification === 'diploma'
              ? 'Polytechnic / Diploma Marksheet'
              : 'Equivalent Qualification Document';
          subtext = `• Selected: ${qualName} (${pdfEnglishStrings.badges.anyOne})`;
        }
      } else if (d.englishSubName) {
        subtext = `• ${d.englishSubName}`;
      }

      drawDocCard(engDocName, badges, subtext);
    });
  });

  // 8. Sanitize file name: {StudentName}_Document_Checklist.pdf
  const sanitized = cleanDisplayName.replace(/[^a-zA-Z0-9_\s-]/g, '').replace(/\s+/g, '_');
  const filename = `${sanitized || 'Student'}_Document_Checklist.pdf`;

  doc.save(filename);
  return filename;
}
