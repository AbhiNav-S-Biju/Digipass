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
  // Use Unicode bullet - properly set before rendering
  return '\u25CF'.repeat(12); // ● character repeated 12 times
}

function drawBox(doc, x, y, width, height, options = {}) {
  const { bgColor = COLORS.creamLight, borderColor = COLORS.sandDeep, borderWidth = 1 } = options;
  
  // Fill background - SET COLOR FIRST, then fill
  doc.fillColor(bgColor);
  doc.rect(x, y, width, height).fill();
  
  // Draw border
  doc.strokeColor(borderColor);
  doc.lineWidth(borderWidth);
  doc.rect(x, y, width, height).stroke();
}

function drawVaultIcon(doc, x, y, size = 36) {
  // Convert SVG to pdfkit drawing commands
  const scale = size / 48;
  
  // Rounded square background with semi-transparent white
  doc.fillColor(COLORS.creamLight).fillOpacity(0.12);
  doc.rect(x, y, size, size, 4).fill();
  doc.fillOpacity(1); // Reset opacity
  
  doc.strokeColor(COLORS.creamLight).lineWidth(0.5);
  doc.rect(x, y, size, size, 4).stroke();
  
  // Main vault box (rounded rectangle)
  const vaultX = x + (11 * scale);
  const vaultY = y + (13 * scale);
  const vaultW = 22 * scale;
  const vaultH = 17 * scale;
  doc.strokeColor(COLORS.creamLight).lineWidth(1.2);
  doc.rect(vaultX, vaultY, vaultW, vaultH, 2).stroke();
  
  // Divider line through vault
  const dividerY = y + (21 * scale);
  doc.strokeColor(COLORS.creamLight).lineWidth(1);
  doc.moveTo(x + (11 * scale), dividerY).lineTo(x + (33 * scale), dividerY).stroke();
  
  // Left key slot
  doc.fillColor(COLORS.accentGreen);
  doc.rect(x + (14 * scale), y + (25 * scale), 6 * scale, 4 * scale, 0.5).fill();
  
  // Right key slot (semi-transparent)
  doc.fillColor(COLORS.accentGreen).fillOpacity(0.45);
  doc.rect(x + (22 * scale), y + (25 * scale), 6 * scale, 4 * scale, 0.5).fill();
  doc.fillOpacity(1); // Reset opacity
  
  // Shackle (vertical line)
  const shackleX = x + (31 * scale);
  doc.strokeColor(COLORS.creamLight).lineWidth(1.5);
  doc.moveTo(shackleX, y + (9 * scale)).lineTo(shackleX, y + (14 * scale)).stroke();
  
  // Lock top (circle)
  doc.fillColor(COLORS.creamLight);
  doc.circle(x + (31 * scale), y + (8 * scale), 2.5 * scale).fill();
}


function drawHeaderBlock(doc, user, willId) {
  const margin = 48;
  const pageWidth = 595; // A4 width
  const headerHeight = 140;
  
  // Draw background - SET COLOR FIRST
  doc.fillColor(COLORS.forestDeep);
  doc.rect(0, 0, pageWidth, headerHeight).fill();
  
  // Draw vault icon
  drawVaultIcon(doc, margin, 22, 40);
  
  // Logo text next to icon
  doc.fillColor(COLORS.creamLight);
  doc.font('Helvetica-Bold').fontSize(24);
  doc.text('DIGIPASS', margin + 50, 28, { width: 150 });
  
  // Subtitle and description
  doc.fillColor(COLORS.accentGreen);
  doc.font('Helvetica-Bold').fontSize(16);
  doc.text('Digital Will & Estate Declaration', margin, 62, { width: 300 });
  
  doc.fillColor(COLORS.cream);
  doc.font('Helvetica').fontSize(9);
  doc.text('A structured record of digital assets, executor assignments, and final instructions', margin, 84, { width: 400 });
  
  // Legal Document badge (top right)
  const badgeX = pageWidth - margin - 80;
  const badgeY = 20;
  doc.fillColor(COLORS.accentAmber);
  doc.rect(badgeX, badgeY, 70, 24).fill();
  doc.fillColor(COLORS.textDark);
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('Legal\nDocument', badgeX + 5, badgeY + 4, { width: 60, align: 'center' });
  
  // Meta info (bottom of header)
  doc.fillColor(COLORS.sand);
  doc.font('Helvetica').fontSize(9);
  const metaY = headerHeight - 20;
  
  const dateStr = formatDate(new Date());
  const docId = `DW-${formatDateISO(new Date()).replace(/-/g, '')}-U${user.id || user.user_id}`;
  
  doc.text(`Generated: ${dateStr}`, margin, metaY);
  doc.text(`Document ID: ${docId}`, margin + 180, metaY);
  doc.text(`Status: Active`, margin + 350, metaY);
  
  return headerHeight + 20;
}

function drawSectionTitle(doc, sectionNum, title, y) {
  const margin = 48;
  
  // Numbered circle - SET COLOR FIRST
  const circleX = margin - 25;
  const circleY = y + 3;
  const circleRadius = 8;
  
  doc.fillColor(COLORS.forestDeep);
  doc.circle(circleX, circleY, circleRadius).fill();
  
  // White text inside
  doc.fillColor(COLORS.creamLight);
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text(sectionNum.toString(), circleX - 3, circleY - 5, { width: 6, align: 'center' });
  
  // Title
  doc.fillColor(COLORS.forestDeep);
  doc.font('Helvetica-Bold').fontSize(13);
  doc.text(title, margin + 15, y, { width: 400 });
  
  // Underline
  const currentY = doc.y + 5;
  doc.strokeColor(COLORS.forestMid).lineWidth(1.5);
  doc.moveTo(margin, currentY).lineTo(547, currentY).stroke();
  
  return currentY + 8;
}

function drawUserDetailsSection(doc, user, startY) {
  const margin = 48;
  const sectionWidth = 499;
  const boxHeight = 110;
  
  drawBox(doc, margin, startY, sectionWidth, boxHeight, {
    bgColor: COLORS.creamLight,
    borderColor: COLORS.sandDeep,
    borderWidth: 1.5
  });
  
  const col1X = margin + 15;
  const col2X = margin + 260;
  const contentY = startY + 12;
  const lineHeight = 22;
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('FULL NAME', col1X, contentY);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text(user.full_name || 'Not provided', col1X, contentY + 10);
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('USER ID', col1X, contentY + lineHeight);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text(user.user_id || user.id || 'N/A', col1X, contentY + lineHeight + 10);
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('PHONE NUMBER', col1X, contentY + lineHeight * 2);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text('Not provided', col1X, contentY + lineHeight * 2 + 10);
  
  // Column 2
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('EMAIL ADDRESS', col2X, contentY);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text(user.email || 'Not provided', col2X, contentY + 10);
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('ESTATE NAME', col2X, contentY + lineHeight);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text('Primary Estate', col2X, contentY + lineHeight + 10);
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.textDark).text('WILL VERSION', col2X, contentY + lineHeight * 2);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted).text('v1.0', col2X, contentY + lineHeight * 2 + 10);
  
  return startY + boxHeight + 15;
}

function drawAssetCard(doc, asset, index, y) {
  const margin = 48;
  const cardWidth = 499;
  const cardHeight = 210;
  
  drawBox(doc, margin, y, cardWidth, cardHeight, {
    bgColor: '#ffffff',
    borderColor: COLORS.sandDeep,
    borderWidth: 1.5
  });
  
  const contentX = margin + 15;
  const contentY = y + 12;
  
  // Asset number and name
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.forestDeep);
  doc.text(`${String(index + 1).padStart(2, '0')}. ${asset.platform_name}`, contentX, contentY, { width: 280 });
  
  // Category tag (top right)
  const categoryColors = getCategoryColor(asset.category);
  const tagHeight = 20;
  const tagWidth = 70;
  const tagX = margin + cardWidth - tagWidth - 85;
  const tagY = contentY - 2;
  
  // Category tag - SET COLOR FIRST
  doc.fillColor(categoryColors.bg);
  doc.rect(tagX, tagY, tagWidth, tagHeight).fill();
  doc.fillColor(categoryColors.text);
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text(asset.category.substring(0, 12), tagX + 3, tagY + 5, { width: tagWidth - 6, align: 'center' });
  
  // Secured status badge (top right) - SET COLOR FIRST
  const securedBadgeX = margin + cardWidth - 68;
  const securedBadgeWidth = 60;
  doc.fillColor(COLORS.accentGreen);
  doc.rect(securedBadgeX, tagY, securedBadgeWidth, tagHeight).fill();
  doc.fillColor('#ffffff');
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text('✓ Secured', securedBadgeX + 2, tagY + 5, { width: securedBadgeWidth - 4, align: 'center' });
  
  // Better date format
  doc.fillColor(COLORS.textMuted);
  doc.font('Helvetica').fontSize(8);
  const formattedDate = asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '') : 'N/A';
  doc.text(`Added ${formattedDate}`, contentX, contentY + 22);
  
  // Details grid - 4 fields in 2x2 layout
  const detailsY = contentY + 42;
  const col1X = contentX;
  const col2X = contentX + 245;
  const rowHeight = 28;
  
  // Row 1: Account/Username and Password
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('ACCOUNT / USERNAME', col1X, detailsY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(asset.account_identifier || 'Not provided', col1X, detailsY + 10);
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('PASSWORD', col2X, detailsY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(maskPassword(asset.account_password || ''), col2X, detailsY + 10);
  
  // Row 2: Recovery Email and Action Type
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('RECOVERY EMAIL', col1X, detailsY + rowHeight);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text('Not provided', col1X, detailsY + rowHeight + 10);
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('ACTION', col2X, detailsY + rowHeight);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  const actionLabel = {
    pass: 'Pass to executor',
    delete: 'Delete account',
    last_message: 'Memorialise account'
  };
  doc.text(actionLabel[asset.action_type] || asset.action_type || 'Not specified', col2X, detailsY + rowHeight + 10);
  
  // Final message box
  if (asset.last_message) {
    const msgBoxY = y + cardHeight - 32;
    drawBox(doc, contentX, msgBoxY, cardWidth - 30, 28, {
      bgColor: COLORS.sand,
      borderColor: '#ccc',
      borderWidth: 0.5
    });
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
    doc.text('FINAL MESSAGE TO EXECUTORS', contentX + 6, msgBoxY + 3);
    
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.textMuted);
    const message = asset.last_message.substring(0, 80);
    doc.text(`"${message}"`, contentX + 6, msgBoxY + 13);
  } else {
    const msgBoxY = y + cardHeight - 32;
    drawBox(doc, contentX, msgBoxY, cardWidth - 30, 28, {
      bgColor: COLORS.sand,
      borderColor: '#ccc',
      borderWidth: 0.5
    });
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
    doc.text('FINAL MESSAGE TO EXECUTORS', contentX + 6, msgBoxY + 3);
    
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.textMuted);
    doc.text('No final message left.', contentX + 6, msgBoxY + 13);
  }
  
  return y + cardHeight + 15;
}

function drawExecutorCard(doc, executor, index, y) {
  const margin = 48;
  const cardWidth = 499;
  const cardHeight = 100;
  
  drawBox(doc, margin, y, cardWidth, cardHeight, {
    bgColor: '#ffffff',
    borderColor: COLORS.sandDeep,
    borderWidth: 1.5
  });
  
  const contentX = margin + 15;
  const contentY = y + 12;
  
  // Executor name
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.forestDeep);
  doc.text(executor.executor_name, contentX, contentY, { width: 350 });
  
  // Verification badge (top right)
  const isVerified = executor.verification_status === 'verified';
  const badgeColor = isVerified ? COLORS.accentGreen : COLORS.accentAmber;
  const badgeText = isVerified ? '✓ Verified' : '⏳ Pending';
  doc.font('Helvetica-Bold').fontSize(9).fillColor(badgeColor);
  doc.text(badgeText, margin + cardWidth - 100, contentY, { align: 'right' });
  
  // Contact info - 3 columns
  const detailY = contentY + 28;
  const col1X = contentX;
  const col2X = contentX + 155;
  const col3X = contentX + 310;
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('EMAIL', col1X, detailY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(executor.executor_email, col1X, detailY + 10);
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('PHONE', col2X, detailY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(executor.executor_phone || 'Not provided', col2X, detailY + 10);
  
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.textDark);
  doc.text('RELATIONSHIP', col3X, detailY);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);
  doc.text(executor.relationship || 'Not specified', col3X, detailY + 10);
  
  // Access badge (bottom left) - SET COLOR FIRST
  const accessBg = executor.access_granted ? COLORS.forestMid : COLORS.accentAmber;
  const accessText = executor.access_granted ? 'Full Access Granted' : 'Access Pending';
  const badgeY = y + cardHeight - 18;
  
  doc.fillColor(accessBg);
  doc.rect(contentX, badgeY, 110, 14).fill();
  doc.fillColor(COLORS.creamLight);
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text(accessText, contentX + 3, badgeY + 2, { width: 104, align: 'center' });
  
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
    const assetTypes = [...new Set(assets.map(a => a.category))];
    instructions.push(`Asset categories covered: ${assetTypes.join(', ')}. Executors should coordinate to avoid duplicate actions.`);
  }
  
  instructions.push('Sensitive credentials are accessible only through the DIGIPASS executor portal. This document does not contain plain-text passwords.');
  
  let currentY = y;
  instructions.forEach((instruction) => {
    const circleX = contentX;
    const circleY = currentY + 2;
    
    // Draw bullet circle - SET COLOR FIRST
    doc.fillColor(COLORS.forestMid);
    doc.circle(circleX, circleY, 3).fill();
    
    doc.fillColor(COLORS.textDark);
    doc.font('Helvetica').fontSize(9);
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
  
  // Draw vault seal icon instead of "D"
  drawVaultIcon(doc, col3X + 57, y - 2, 24);
}

function drawFooter(doc, user) {
  const pageHeight = 842;
  const footerY = pageHeight - 35;
  const margin = 48;
  const pageWidth = 595;
  
  // Draw footer background - SET COLOR FIRST
  doc.fillColor(COLORS.forestDeep);
  doc.rect(0, footerY - 5, pageWidth, 40).fill();
  
  // Footer text
  doc.fillColor(COLORS.sand);
  doc.font('Helvetica').fontSize(8);
  
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
      
      currentY = drawSectionTitle(doc, 1, 'TESTATOR — USER DETAILS', currentY);
      currentY = drawUserDetailsSection(doc, user, currentY);
      
      currentY += 15;
      
      currentY = drawSectionTitle(doc, 2, `DIGITAL ASSETS — ${assets.length} LISTED`, currentY);
      
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
      
      currentY = drawSectionTitle(doc, 3, `ASSIGNED EXECUTORS — ${executors.length} APPOINTED`, currentY);
      
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
      
      currentY = drawSectionTitle(doc, 4, 'EXECUTOR INSTRUCTIONS', currentY);
      currentY = drawInstructionsSection(doc, user, assets, executors, currentY);
      
      currentY += 15;
      
      if (currentY > 550) {
        doc.addPage();
        currentY = 48;
      }
      
      currentY = drawSectionTitle(doc, 5, 'DECLARATION & SIGNATURE', currentY);
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
