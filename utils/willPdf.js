const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatAssetType(type) {
  return String(type || 'other')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function addSectionTitle(doc, title) {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#1f2937').text(title);
  doc.moveDown(0.35);
  doc.fillColor('#111827').font('Helvetica').fontSize(11);
}

function addBulletList(doc, items, emptyMessage) {
  if (!items.length) {
    doc.text(emptyMessage);
    return;
  }

  items.forEach((item) => {
    doc.text(`• ${item}`, {
      indent: 10
    });
    doc.moveDown(0.25);
  });
}

function generateWillPdf({ outputPath, user, assets, executors, actions }) {
  return new Promise((resolve, reject) => {
    ensureDirectory(path.dirname(outputPath));

    const stream = fs.createWriteStream(outputPath);
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text('DIGIPASS Digital Will', {
      align: 'center'
    });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('#4b5563').text(`Generated on ${formatDate(new Date())}`, {
      align: 'center'
    });

    addSectionTitle(doc, 'User Details');
    doc.text(`Full Name: ${user.full_name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`User ID: ${user.user_id}`);

    addSectionTitle(doc, 'Digital Assets Summary');
    addBulletList(
      doc,
      assets.map((asset, index) => `${index + 1}. ${asset.asset_name} (${formatAssetType(asset.asset_type)}) - Added ${formatDate(asset.created_at)}`),
      'No digital assets were found for this user.'
    );

    addSectionTitle(doc, 'Executors');
    addBulletList(
      doc,
      executors.map((executor, index) => {
        const status = `${executor.verification_status}, access granted: ${executor.access_granted ? 'yes' : 'no'}`;
        const relationship = executor.relationship ? `, relationship: ${executor.relationship}` : '';
        const phone = executor.executor_phone ? `, phone: ${executor.executor_phone}` : '';
        return `${index + 1}. ${executor.executor_name} (${executor.executor_email}${phone}${relationship}) - ${status}`;
      }),
      'No executors were found for this user.'
    );

    addSectionTitle(doc, 'Actions And Instructions');
    addBulletList(doc, actions, 'No action items are available.');

    addSectionTitle(doc, 'Declaration');
    doc.text(
      'This document is a structured summary of the user profile, digital assets, and executor assignments currently stored in DIGIPASS. Sensitive encrypted asset contents are intentionally excluded from this will.'
    );

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.on('error', reject);
  });
}

module.exports = {
  generateWillPdf
};
