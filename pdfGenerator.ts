import { jsPDF } from 'jspdf';
import { AppState, CourseType } from './types';
import { NOTO_SANS_DEVANAGARI_REGULAR_B64, NOTO_SANS_DEVANAGARI_BOLD_B64 } from './fontsBase64';

export interface DocItem {
  name: string;
  subName?: string;
  badge?: string;
  fileName?: string;
  instruction?: string;
  isDsyQualifying?: boolean;
  dsyCourse?: 'polytechnic' | 'be_btech';
}

export interface SectionItem {
  title: string;
  subtitle?: string;
  docs: DocItem[];
}

interface PillData {
  text: string;
  type: 'required' | 'create_one_pdf' | 'anyone' | 'otp' | 'default';
}

export function generateChecklistPdf(params: {
  studentName: string;
  state: AppState;
  sections: SectionItem[];
  t: any;
}): string {
  const { studentName, state, sections, t } = params;
  const lang = state.language || 'en';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 1. Embed Noto Sans Devanagari (Regular and Bold)
  doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', NOTO_SANS_DEVANAGARI_REGULAR_B64);
  doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');

  doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', NOTO_SANS_DEVANAGARI_BOLD_B64);
  doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');

  doc.setFont('NotoSansDevanagari', 'normal');

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  const maxY = pageHeight - 16; // 281mm
  let currentY = 16;

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > maxY) {
      doc.addPage();
      currentY = 16;
      return true;
    }
    return false;
  };

  // 2. Localization dictionary for clean PDF labels and headers
  const i18n = {
    en: {
      docChecklist: 'DOCUMENT CHECKLIST',
      studentName: 'Student Name:',
      course: 'Course:',
      category: 'Category:',
      admissionType: 'Admission Type:',
      dsyLabel: 'Direct Second Year (DSY)',
      hostellerLabel: 'Hostel Accommodation:',
      yes: 'Yes',
      keepReady: 'KEEP READY',
      mahaId: 'MahaID',
      aadhaarCard: 'Aadhaar Card',
      aadhaarMobile: 'Aadhaar-linked Mobile',
      mahaIdHint: "Don't have MahaID? Create via mahasarathi.maharashtra.gov.in",
      lblRequired: 'REQUIRED',
      lblOriginal: 'ORIGINAL',
      lblXerox: 'XEROX',
      lblAnyOne: 'ANY ONE',
      lblIfApp: 'IF APPLICABLE',
      lblOtp: 'FOR OTP',
      lblCreateOnePdf: 'CREATE ONE PDF',
      subInstructions: 'SUBMISSION INSTRUCTIONS:',
      subInstructionsBody:
        '• Upload clear, original document scans in PDF format under 250 KB each. Keep original documents ready for college verification.'
    },
    mr: {
      docChecklist: 'कागदपत्रे चेकलिस्ट',
      studentName: 'विद्यार्थ्याचे नाव:',
      course: 'अभ्यासक्रम:',
      category: 'प्रवर्ग:',
      admissionType: 'प्रवेश प्रकार:',
      dsyLabel: 'थेट द्वितीय वर्ष (DSY)',
      hostellerLabel: 'वसतिगृह:',
      yes: 'होय',
      keepReady: 'तयार ठेवा',
      mahaId: 'MahaID',
      aadhaarCard: 'आधार कार्ड',
      aadhaarMobile: 'आधार-लिंक केलेला मोबाईल',
      mahaIdHint: 'MahaID नाही? mahasarathi.maharashtra.gov.in वर तयार करा',
      lblRequired: 'अनिवार्य',
      lblOriginal: 'मूळ प्रत',
      lblXerox: 'झेरॉक्स',
      lblAnyOne: 'कोणतेही एक',
      lblIfApp: 'लागू असल्यास',
      lblOtp: 'OTP साठी',
      lblCreateOnePdf: 'एक PDF तयार करा',
      subInstructions: 'महत्त्वाच्या सूचना:',
      subInstructionsBody:
        '• सर्व कागदपत्रे मूळ प्रत (Original) स्कॅन करून स्पष्ट PDF मध्ये (कमाल २५० KB) तयार ठेवा. कॉलेज पडताळणीसाठी मूळ कागदपत्रे सोबत असणे आवश्यक आहे.'
    },
    hi: {
      docChecklist: 'दस्तावेज़ चेकलिस्ट',
      studentName: 'छात्र का नाम:',
      course: 'पाठ्यक्रम:',
      category: 'श्रेणी / वर्ग:',
      admissionType: 'प्रवेश प्रकार:',
      dsyLabel: 'डायरेक्ट सेकंड ईयर (DSY)',
      hostellerLabel: 'छात्रावास:',
      yes: 'हाँ',
      keepReady: 'तैयार रखें',
      mahaId: 'MahaID',
      aadhaarCard: 'आधार कार्ड',
      aadhaarMobile: 'आधार-लिंक मोबाइल',
      mahaIdHint: 'MahaID नहीं है? mahasarathi.maharashtra.gov.in पर बनाएं',
      lblRequired: 'अनिवार्य',
      lblOriginal: 'मूल प्रति',
      lblXerox: 'ज़ेरॉक्स',
      lblAnyOne: 'कोई भी एक',
      lblIfApp: 'यदि लागू हो',
      lblOtp: 'OTP के लिए',
      lblCreateOnePdf: 'एक PDF बनाएं',
      subInstructions: 'महत्वपूर्ण निर्देश:',
      subInstructionsBody:
        '• सभी दस्तावेज़ मूल प्रति (Original) स्कैन करके स्पष्ट PDF (अधिकतम २५० KB) में रखें। कॉलेज सत्यापन के लिए मूल दस्तावेज़ साथ रखें।'
    }
  }[lang];

  // 3. Header: Document Title
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(i18n.docChecklist, marginX, currentY + 3);

  currentY += 8;

  // 4. Student Details Card (Simple, Evergreen - NO dates, NO academic years, NO branding)
  const isDsy = state.isDirectSecondYear;
  const isHosteller = state.isHosteller;
  const hasExtraRow = isDsy || isHosteller;
  const cardHeight = hasExtraRow ? 15 : 11;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(8);

  // Row 1: Student Name & Course
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(i18n.studentName, marginX + 3.5, currentY + 4.5);
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setTextColor(15, 23, 42);
  const displayName = studentName.trim() || 'Student';
  doc.text(displayName, marginX + 28, currentY + 4.5);

  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(i18n.course, marginX + 88, currentY + 4.5);
  doc.setFont('NotoSansDevanagari', 'normal');
  doc.setTextColor(15, 23, 42);
  const courseStr = String(state.courseType || state.stream || 'N/A');
  doc.text(courseStr, marginX + 104, currentY + 4.5);

  // Row 2: Category & Admission Type / Hosteller
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(i18n.category, marginX + 3.5, currentY + 9);
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(state.category || 'Open'), marginX + 28, currentY + 9);

  if (isDsy) {
    doc.setFont('NotoSansDevanagari', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(i18n.admissionType, marginX + 88, currentY + 9);
    doc.setFont('NotoSansDevanagari', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(i18n.dsyLabel, marginX + 116, currentY + 9);
  } else if (isHosteller) {
    doc.setFont('NotoSansDevanagari', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(i18n.hostellerLabel, marginX + 88, currentY + 9);
    doc.setFont('NotoSansDevanagari', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(i18n.yes, marginX + 124, currentY + 9);
  }

  // Row 3 (if both DSY and Hosteller)
  if (isDsy && isHosteller) {
    doc.setFont('NotoSansDevanagari', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(i18n.hostellerLabel, marginX + 3.5, currentY + 13.5);
    doc.setFont('NotoSansDevanagari', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(i18n.yes, marginX + 39, currentY + 13.5);
  }

  currentY += cardHeight + 4;

  // 5. Pill Label Rendering Function (Clean, subtle, semantic)
  const drawPill = (text: string, rightX: number, y: number, type: PillData['type']) => {
    doc.setFont('NotoSansDevanagari', 'bold');
    doc.setFontSize(6.5);
    const textWidth = doc.getTextWidth(text);
    const pillPadding = 2.2;
    const pillW = textWidth + pillPadding * 2;
    const pillH = 4.2;
    const pillX = rightX - pillW;
    const pillY = y - 3.1;

    if (type === 'required') {
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(254, 202, 202); // red-200
      doc.setTextColor(185, 28, 28);   // red-700
    } else if (type === 'create_one_pdf') {
      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(186, 230, 253); // sky-200
      doc.setTextColor(3, 105, 161);   // sky-700
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
    doc.text(text, pillX + pillPadding, y);

    return pillW + 1.5; // return occupied width plus margin
  };

  // 6. Document Row Rendering Function
  const drawRow = (name: string, pills: PillData[] = [], subName?: string) => {
    checkPageBreak(subName ? 10 : 6.5);

    // Checkbox (Clean 3.5mm rounded box)
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX + 1, currentY - 2.8, 3.5, 3.5, 0.7, 0.7, 'FD');

    // Document Name (clean single line)
    doc.setFont('NotoSansDevanagari', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    const cleanName = name.replace(/\n/g, ' ').trim();

    // Ensure text does not collide with right pills
    const estimatedPillWidth = pills.length * 28;
    const maxNameWidth = contentWidth - estimatedPillWidth - 10;
    const truncatedName = doc.splitTextToSize(cleanName, maxNameWidth)[0] || cleanName;
    doc.text(truncatedName, marginX + 6.5, currentY);

    // Render Pills from right to left
    let rightOffset = marginX + contentWidth;
    for (const pill of pills) {
      const occupied = drawPill(pill.text, rightOffset, currentY, pill.type);
      rightOffset -= occupied;
    }

    currentY += 4.2;

    // SubName / Helper line (e.g. DSY options)
    if (subName) {
      doc.setFont('NotoSansDevanagari', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(subName, marginX + 6.5, currentY);
      currentY += 3.8;
    }

    // Subtle hairline divider between rows
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.15);
    doc.line(marginX + 6.5, currentY - 0.8, marginX + contentWidth, currentY - 0.8);
    currentY += 1.2;
  };

  // 7. Section Header Rendering Function
  const drawSectionHeader = (title: string) => {
    checkPageBreak(12);
    currentY += 1.5;
    doc.setFont('NotoSansDevanagari', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(title.toUpperCase(), marginX, currentY);

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + 1.2, marginX + contentWidth, currentY + 1.2);

    currentY += 4.5;
  };

  // Deduplication tracker
  const renderedDocNames = new Set<string>();

  // 8. SECTION: KEEP READY (Compact, at top)
  drawSectionHeader(i18n.keepReady);

  drawRow(i18n.mahaId, [{ text: i18n.lblRequired, type: 'required' }], i18n.mahaIdHint);
  renderedDocNames.add('mahaid');

  drawRow(i18n.aadhaarCard, [
    { text: i18n.lblRequired, type: 'required' },
    { text: i18n.lblOriginal, type: 'default' }
  ]);
  renderedDocNames.add('aadhaar card');
  renderedDocNames.add('आधार कार्ड');

  drawRow(i18n.aadhaarMobile, [{ text: i18n.lblOtp, type: 'otp' }]);
  renderedDocNames.add('aadhaar-linked mobile');
  renderedDocNames.add('आधार-लिंक');

  // 9. Process Document Sections from Central Rule Engine
  sections.forEach(section => {
    if (!section.docs || section.docs.length === 0) return;

    // Filter out duplicates and already-rendered prerequisites
    const validDocs = section.docs.filter(docItem => {
      const normalized = docItem.name.toLowerCase().trim();
      if (
        normalized.includes('mahaid') ||
        normalized.includes('aadhaar') ||
        renderedDocNames.has(normalized)
      ) {
        return false;
      }
      renderedDocNames.add(normalized);
      return true;
    });

    if (validDocs.length === 0) return;

    // Draw Section Header
    drawSectionHeader(section.title);

    validDocs.forEach(docItem => {
      const pills: PillData[] = [];
      let subName: string | undefined = undefined;

      // Determine appropriate labels
      if (docItem.badge === 'mandatory') {
        pills.push({ text: i18n.lblRequired, type: 'required' });
        // Marksheets and certificates require original scan for verification
        const lower = docItem.name.toLowerCase();
        if (
          lower.includes('cert') ||
          lower.includes('प्रमाणपत्र') ||
          lower.includes('marksheet') ||
          lower.includes('मार्कशीट') ||
          lower.includes('passbook') ||
          lower.includes('पासबुक') ||
          lower.includes('tc') ||
          lower.includes('lc') ||
          lower.includes('दाखला')
        ) {
          pills.push({ text: i18n.lblOriginal, type: 'default' });
        }
      } else if (docItem.badge === 'merge' || docItem.badge === 'onepdf') {
        pills.push({ text: i18n.lblCreateOnePdf, type: 'create_one_pdf' });
      } else if (docItem.badge === 'anyone') {
        pills.push({ text: i18n.lblAnyOne, type: 'anyone' });
      } else if (docItem.badge === 'dsy') {
        pills.push({ text: i18n.lblAnyOne, type: 'anyone' });
      } else if (
        docItem.name.toLowerCase().includes('gap') ||
        docItem.name.toLowerCase().includes('गॅप')
      ) {
        pills.push({ text: i18n.lblIfApp, type: 'default' });
      } else if (docItem.badge) {
        pills.push({ text: docItem.badge.toUpperCase(), type: 'default' });
      }

      // Handle DSY Qualifying Document sub-options
      if (docItem.isDsyQualifying) {
        if (state.courseType === CourseType.Poly_Diploma) {
          subName =
            lang === 'mr'
              ? '• ITI मार्कशीट किंवा १२ वी मार्कशीट (फक्त एक आवश्यक)'
              : lang === 'hi'
              ? '• ITI मार्कशीट या १२ वीं मार्कशीट (केवल एक आवश्यक)'
              : '• ITI Marksheet OR 12th Marksheet (Only 1 required)';
        } else {
          subName =
            lang === 'mr'
              ? '• पॉलिटेक्निक / डिप्लोमा किंवा समकक्ष पात्रता (फक्त एक आवश्यक)'
              : lang === 'hi'
              ? '• पॉलिटेक्निक / डिप्लोमा या समकक्ष योग्यता (केवल एक आवश्यक)'
              : '• Polytechnic / Diploma Marksheet OR Equivalent Qualification (Only 1 required)';
        }

        if (state.dsyQualification) {
          const selectedText =
            state.dsyQualification === 'iti'
              ? t.dsyItiMarksheet || 'ITI Marksheet'
              : state.dsyQualification === '12th'
              ? t.dsy12thMarksheet || '12th Marksheet'
              : state.dsyQualification === 'diploma'
              ? t.dsyDiplomaMarksheet || 'Polytechnic / Diploma Marksheet'
              : t.dsyEquivalentDoc || 'Equivalent Qualification Document';
          const selPrefix = lang === 'mr' ? 'निवडलेले:' : lang === 'hi' ? 'चयनित:' : 'Selected:';
          subName = `• ${selPrefix} ${selectedText} (${i18n.lblAnyOne})`;
        }
      } else if (docItem.subName && !docItem.subName.includes('[')) {
        subName = `• ${docItem.subName}`;
      }

      drawRow(docItem.name, pills, subName);
    });
  });

  // 10. Brief Footer Submission Protocol Note
  checkPageBreak(10);
  currentY += 2;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);

  currentY += 3.2;
  doc.setFont('NotoSansDevanagari', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const titleW = doc.getTextWidth(i18n.subInstructions);
  doc.text(i18n.subInstructions, marginX, currentY);

  doc.setFont('NotoSansDevanagari', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const textX = marginX + titleW + 2.5;
  const maxBodyW = contentWidth - (titleW + 2.5);
  const wrappedLines = doc.splitTextToSize(i18n.subInstructionsBody, maxBodyW);
  doc.text(wrappedLines, textX, currentY);

  // 11. Sanitize file name: {StudentName}_Document_Checklist.pdf
  const sanitized = studentName
    .trim()
    .replace(/[^a-zA-Z0-9_\u0900-\u097F\s-]/g, '')
    .replace(/\s+/g, '_');
  const filename = `${sanitized || 'Student'}_Document_Checklist.pdf`;

  doc.save(filename);
  return filename;
}
