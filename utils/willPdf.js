const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const COLORS = {
  forestDeep: '#1b3a2d',
  forestMid: '#2d5a42',
  forestLight: '#3d7a5a',
  cream: '#f5ead8',
  creamLight: '#fdf6ec',
  sand: '#e8d9c0',
  sandDeep: '#d4c4a0',
  textDark: '#1a2e22',
  textMuted: '#5a7260',
  accentGreen: '#8cbf9c',
  accentAmber: '#efb347',
  dangerRed: '#a32d2d'
};

const CATEGORY_COLORS = {
  social: { bg: '#ddeaf5', text: '#1a4a6e' },
  finance: { bg: '#d4ead8', text: '#1b3a2d' },
  storage: { bg: '#f0e6d4', text: '#7a4f1a' },
  email: { bg: '#ede8f5', text: '#4a3080' },
  entertainment: { bg: '#fce8d1', text: '#8b4513' },
  default: { bg: '#e8d9c0', text: '#5a7260' }
};

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (!date || Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateISO(value) {
  const date = value ? new Date(value) : new Date();
  if (!date || Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}

function maskPassword(password) {
  return '●●●●●●●●●●';
}

function drawBox(doc, x, y, width, height, options = {}) {
  const { bgColor = COLORS.creamLight, borderColor = COLORS.sandDeep, borderWidth = 1 } = options;
  
  doc.rect(x, y, width, height).fill(bgColor);
  doc.rect(x, y, width, height)
    .strokeColor(borderColor)
    .lineWidth(borderWidth)
    .stroke();
}

function drawHeaderBlock(doc, user, willId) {
  const margin = 48;
  const pageWidth = 595; // A4 width
  const headerHeight = 140;
  
  // Background
  doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.forestDeep);
  
  // Title and subtitle
  doc.font('Helvetica-Bold').fontSize(28).fillColor(COLORS.creamLight);
  doc.text('DIGIPASS', margin, 25, { width: 200 });
  
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.accentGreen);
  doc.text('Digital Will & Estate Declaration', margin, 60, { width: 300 });
  
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.cream);
  doc.text('A structured record of digital assets, executor assignments, and final instructions', margin, 85, { width: 300 });
  
  // Legal Document badge (top right)
  const badgeX = pageWidth - margin - 80;
  const badgeY = 20;
  doc.rect(badgeX, badgeY, 70, 24).fill(COLORS.accentAmber);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark);
  doc.text('Legal\nDocument', badgeX + 5, badgeY + 4, { width: 60, align: 'center' });
  
  // Meta info (bottom of header)
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.sand);
  const metaY = headerHeight - 20;
  
  const dateStr = formatDate(new Date());
  const docId = `DW-${formatDateISO(new Date()).replace(/-/g, '')}-U${user.id || user.user_id}`;
  
  doc.text(`Generated: ${dateStr}`, margin, metaY);
  doc.text(`Document ID: ${docId}`, margin + 180, metaY);
  doc.text(`Status: Active`, margin + 350, metaY);
  
  return headerHeight + 20;
}

function drawSectionTitle(doc, title, y) {
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.forestDeep);
  doc.text(title, 48, y);
  doc.moveDown(0.2);
  
  const currentY = doc.y;
  doc.strokeColor(COLORS.forestMid).lineWidth(2);
  doc.moveTo(48, currentY).lineTo(547, currentY).stroke();
  
  return doc.y + 12;
}

function drawUserDetailsSection(doc, user, startY) {
  const margin = 48;
  const sectionWidth = 499;
  const boxHeight = 100;
  
  drawBox(doc, margin, startY, sectionWidth, boxHeight, {
    bgColor: COLORS.creamLight,
    borderColor: COLORS.sandDeep,
    borderWidth: 1.5
  });
  
  const col1X = margin + 15;
  const col2X = margin + 250;
  const contentY = startY + 12;
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.textDark);
  
  doc.text('Full Name', col1X, contentY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(user.full_name || 'Not provided', col1X, contentY + 12, { width: 220 });
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.textDark);
  doc.text('Email', col1X, contentY + 35);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(user.email || 'Not provided', col1X, contentY + 47, { width: 220 });
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.textDark);
  doc.text('User ID', col2X, contentY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(user.id || user.user_id || 'N/A', col2X, contentY + 12);
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.textDark);
  doc.text('Phone', col2X, contentY + 35);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(user.phone || 'Not provided', col2X, contentY + 47, { width: 220 });
  
  return startY + boxHeight + 15;
}

function drawAssetCard(doc, asset, index, y) {
  const margin = 48;
  const cardWidth = 499;
  const cardHeight = 160;
  
  drawBox(doc, margin, y, cardWidth, cardHeight, {
    bgColor: '#ffffff',
    borderColor: COLORS.sandDeep,
    borderWidth: 1
  });
  
  const contentX = margin + 15;
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.forestDeep);
  const assetNumberText = `${String(index + 1).padStart(2, '0')}. ${asset.asset_name}`;
  doc.text(assetNumberText, contentX, y + 12, { width: 350 });
  
  const categoryColors = getCategoryColor(asset.asset_type);
  const tagHeight = 18;
  const tagWidth = 60;
  const tagX = margin + cardWidth - tagWidth - 12;
  const tagY = y + 12;
  
  doc.rect(tagX, tagY, tagWidth, tagHeight).fill(categoryColors.bg);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(categoryColors.text);
  doc.text(asset.asset_type.substring(0, 8), tagX + 2, tagY + 4, { width: tagWidth - 4, align: 'center' });
  
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.accentGreen);
  doc.text('● Secured', contentX, y + 34);
  
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMuted);
  doc.text(`Added: ${formatDateISO(asset.created_at)}`, tagX, tagY + 20, { width: tagWidth, align: 'right' });
  
  const detailY = y + 55;
  const col1DetailX = contentX;
  const col2DetailX = contentX + 240;
  
  const details = [
    { label: 'Account / Username', value: asset.username || asset.account_identifier || 'Not provided' },
    { label: 'Password', value: maskPassword(asset.password_encrypted || '') },
    { label: 'Recovery Email', value: asset.recovery_email || 'Not provided' },
    { label: '2FA Enabled', value: asset.two_factor_method ? 'Yes' : 'No' },
    { label: 'Preferred Action', value: asset.preferred_action || 'Not specified' }
  ];
  
  details.forEach((detail, idx) => {
    const colX = idx % 2 === 0 ? col1DetailX : col2DetailX;
    const detailRowY = detailY + Math.floor(idx / 2) * 17;
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
    doc.text(detail.label + ':', colX, detailRowY);
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMuted);
    doc.text(detail.value, colX, detailRowY + 8, { width: 220 });
  });
  
  if (asset.access_instructions) {
    const msgBoxY = y + cardHeight - 25;
    drawBox(doc, margin + 12, msgBoxY, cardWidth - 24, 20, {
      bgColor: COLORS.sand,
      borderColor: '#ccc',
      borderWidth: 0.5
    });
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLORS.textMuted);
    doc.text(`"${asset.access_instructions}"`, margin + 17, msgBoxY + 4, { width: cardWidth - 34 });
  }
  
  return y + cardHeight + 15;
}

function drawExecutorCard(doc, executor, index, y) {
  const margin = 48;
  const cardWidth = 499;
  const cardHeight = 90;
  
  drawBox(doc, margin, y, cardWidth, cardHeight, {
    bgColor: '#ffffff',
    borderColor: COLORS.sandDeep,
    borderWidth: 1
  });
  
  const contentX = margin + 15;
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.forestDeep);
  doc.text(`${index + 1}. ${executor.executor_name}`, contentX, y + 12, { width: 350 });
  
  const isVerified = executor.verification_status === 'verified';
  const badgeColor = isVerified ? COLORS.accentGreen : COLORS.accentAmber;
  const badgeText = isVerified ? '✓ Verified' : '⏳ Pending';
  doc.font('Helvetica-Bold').fontSize(9).fillColor(badgeColor);
  doc.text(badgeText, margin + cardWidth - 90, y + 12, { align: 'right' });
  
  const detailY = y + 40;
  const col1X = contentX;
  const col2X = contentX + 160;
  const col3X = contentX + 320;
  
  const contacts = [
    { label: 'Email', value: executor.executor_email, x: col1X },
    { label: 'Phone', value: executor.executor_phone || 'Not provided', x: col2X },
    { label: 'Relationship', value: executor.relationship || 'Not specified', x: col3X }
  ];
  
  contacts.forEach(contact => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
    doc.text(contact.label + ':', contact.x, detailY);
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMuted);
    doc.text(contact.value, contact.x, detailY + 8, { width: 140 });
  });
  
  const accessBg = executor.access_granted ? COLORS.forestMid : COLORS.accentAmber;
  const accessText = executor.access_granted ? 'Full Access Granted' : 'Access Pending';
  const badgeY = y + cardHeight - 16;
  
  doc.rect(contentX, badgeY, 100, 12).fill(accessBg);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.creamLight);
  doc.text(accessText, contentX + 3, badgeY + 2, { width: 94, align: 'center' });
  
  return y + cardHeight + 12;
}

function drawInstructionsSection(doc, user, assets, executors, y) {
  const margin = 48;
  const contentX = margin + 15;
  
  const instructions = [];
  
  instructions.push(`Review and manage ${assets.length} digital asset(s) listed in this will.`);
  
  executors.forEach(executor => {
    const status = executor.verification_status === 'verified' ? 'is verified' : 'is pending verification';
    const access = executor.access_granted ? 'is granted' : 'is not yet granted';
    instructions.push(`${executor.executor_name} ${status} — access ${access}.`);
  });
  
  if (assets.length > 0) {
    const assetTypes = [...new Set(assets.map(a => a.asset_type))];
    instructions.push(`Asset categories covered: ${assetTypes.join(', ')}. Executors should coordinate to avoid duplicate actions.`);
  }
  
  instructions.push('Sensitive credentials are accessible only through the DIGIPASS executor portal. This document does not contain plain-text passwords.');
  
  let currentY = y;
  instructions.forEach((instruction) => {
    const circleX = contentX;
    const circleY = currentY + 2;
    doc.circle(circleX, circleY, 3).fillColor(COLORS.forestMid).fill();
    
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.textDark);
    doc.text(instruction, contentX + 18, currentY, { width: 440 });
    
    currentY = doc.y + 8;
  });
  
  return currentY;
}

function drawDeclarationSection(doc, user, y) {
  const margin = 48;
  const contentX = margin + 15;
  const textWidth = 499 - 30;
  
  const dateStr = formatDate(new Date());
  
  const declarations = [
    `This document is a structured and legally-formatted summary of the digital estate belonging to ${user.full_name} (${user.email}), as stored and maintained within the DIGIPASS platform.`,
    
    `All assets were voluntarily added by the account holder. Executor assignments were confirmed with mutual verification. Sensitive encrypted asset contents are intentionally excluded and remain accessible solely through the secure DIGIPASS executor portal.`,
    
    `This will was generated on ${dateStr} and supersedes any previously generated digital will documents for this account.`
  ];
  
  let currentY = y;
  declarations.forEach((text) => {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.textDark);
    doc.text(text, contentX, currentY, { width: textWidth, align: 'justify' });
    currentY = doc.y + 12;
  });
  
  return currentY + 15;
}

function drawSignatureBlock(doc, user, y) {
  const margin = 48;
  const contentX = margin + 15;
  const colWidth = 150;
  const col1X = contentX;
  const col2X = contentX + 170;
  const col3X = contentX + 340;
  
  const lineY = y + 35;
  doc.strokeColor(COLORS.textMuted).lineWidth(1);
  doc.moveTo(col1X, lineY).lineTo(col1X + colWidth, lineY).stroke();
  doc.moveTo(col2X, lineY).lineTo(col2X + colWidth, lineY).stroke();
  doc.moveTo(col3X, lineY).lineTo(col3X + colWidth, lineY).stroke();
  
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMuted);
  doc.text('Account Holder Signature', col1X, lineY + 8, { width: colWidth, align: 'center' });
  doc.text('Date', col2X, lineY + 8, { width: colWidth, align: 'center' });
  doc.text('DIGIPASS Seal', col3X, lineY + 8, { width: colWidth, align: 'center' });
  
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.textDark);
  doc.text(user.full_name, col1X, y, { width: colWidth, align: 'center' });
  
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textDark);
  const dateStr = formatDateISO(new Date());
  doc.text(dateStr, col2X, y, { width: colWidth, align: 'center' });
  
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.forestDeep);
  doc.text('D', col3X + 60, y, { width: 30, align: 'center' });
}

function drawFooter(doc, user) {
  const pageHeight = 842;
  const footerY = pageHeight - 35;
  const margin = 48;
  const pageWidth = 595;
  
  doc.rect(0, footerY - 5, pageWidth, 40).fill(COLORS.forestDeep);
  
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.sand);
  
  doc.text('Digipass · Digital Estate', margin, footerY, { width: 150 });
  
  const docId = `DW-${formatDateISO(new Date()).replace(/-/g, '')}-U${user.id || user.user_id}`;
  doc.text(docId, margin + 150, footerY, { width: 250, align: 'center' });
  
  doc.text('Page 1 of 1', pageWidth - margin - 100, footerY, { width: 100, align: 'right' });
}

function generateWillPdf({ outputPath, user, assets, executors, actions }) {
  return new Promise((resolve, reject) => {
    try {
      ensureDirectory(path.dirname(outputPath));
      
      const stream = fs.createWriteStream(outputPath);
      const doc = new PDFDocument({
        margin: 0,
        size: 'A4'
      });
      
      doc.pipe(stream);
      
      let currentY = drawHeaderBlock(doc, user, `DW-${formatDateISO(new Date()).replace(/-/g, '')}-U${user.id || user.user_id}`);
      
      currentY += 15;
      
      currentY = drawSectionTitle(doc, 'SECTION 1 — TESTATOR / USER DETAILS', currentY);
      currentY = drawUserDetailsSection(doc, user, currentY);
      
      currentY += 15;
      
      currentY = drawSectionTitle(doc, 'SECTION 2 — DIGITAL ASSETS', currentY);
      
      if (assets.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.textMuted);
        doc.text('No digital assets recorded.', 48, currentY);
        currentY = doc.y + 15;
      } else {
        assets.forEach((asset, idx) => {
          if (currentY > 650) {
            doc.addPage();
            currentY = 48;
          }
          currentY = drawAssetCard(doc, asset, idx, currentY);
        });
      }
      
      currentY += 10;
      
      if (currentY > 650) {
        doc.addPage();
        currentY = 48;
      }
      
      currentY = drawSectionTitle(doc, 'SECTION 3 — ASSIGNED EXECUTORS', currentY);
      
      if (executors.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.textMuted);
        doc.text('No executors assigned.', 48, currentY);
        currentY = doc.y + 15;
      } else {
        executors.forEach((executor, idx) => {
          if (currentY > 650) {
            doc.addPage();
            currentY = 48;
          }
          currentY = drawExecutorCard(doc, executor, idx, currentY);
        });
      }
      
      currentY += 10;
      
      if (currentY > 600) {
        doc.addPage();
        currentY = 48;
      }
      
      currentY = drawSectionTitle(doc, 'SECTION 4 — EXECUTOR INSTRUCTIONS', currentY);
      currentY = drawInstructionsSection(doc, user, assets, executors, currentY);
      
      currentY += 15;
      
      if (currentY > 550) {
        doc.addPage();
        currentY = 48;
      }
      
      currentY = drawSectionTitle(doc, 'SECTION 5 — DECLARATION & SIGNATURE', currentY);
      currentY = drawDeclarationSection(doc, user, currentY);
      
      currentY += 15;
      drawSignatureBlock(doc, user, currentY);
      
      drawFooter(doc, user);
      
      doc.end();
      
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateWillPdf
};
