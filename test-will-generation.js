#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test data matching the format sent by willController.js
const testData = {
  user: {
    id: 15,
    full_name: "John Q. Public",
    email: "john.public@example.com",
    created_at: "2026-05-09T10:00:00Z"
  },
  assets: [
    {
      name: "Facebook",
      category: "social",
      platform: "facebook.com",
      account_username: "john.public",
      preferred_action: "memorialize",
      final_message: "Please memorialize my account as a memorial page for family and friends.",
      created_at: "2026-05-10T11:00:00Z"
    },
    {
      name: "Gmail Account",
      category: "email",
      platform: "gmail.com",
      account_username: "john.public@gmail.com",
      preferred_action: "download",
      final_message: "Download all my emails and pass them to my executor.",
      created_at: "2026-05-10T11:05:00Z"
    },
    {
      name: "Coinbase Pro",
      category: "finance",
      platform: "coinbase.com",
      account_username: "john.public@coinbase",
      preferred_action: "transfer",
      final_message: "Transfer all cryptocurrency holdings to the executor account specified in my will.",
      created_at: "2026-05-11T12:00:00Z"
    }
  ],
  executors: [
    {
      name: "Jane M. Doe",
      email: "jane.doe@example.com",
      phone: "555-1234",
      relationship: "Spouse",
      status: "verified",
      access_granted: true,
      created_at: "2026-05-09T10:05:00Z"
    },
    {
      name: "Samuel Smith Jr.",
      email: "sam.smith@example.com",
      phone: "555-5678",
      relationship: "Attorney",
      status: "pending",
      access_granted: false,
      created_at: "2026-05-09T10:10:00Z"
    }
  ]
};

console.log('Testing PDF generation via stdin/stdout...');

const pythonProcess = spawn('python', [
  path.join(process.cwd(), 'generate-will.py')
], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let pdfBuffer = Buffer.alloc(0);
let errorOutput = '';

// Capture PDF from stdout
pythonProcess.stdout.on('data', (chunk) => {
  pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
  console.log(`Received ${chunk.length} bytes...`);
});

// Capture errors from stderr
pythonProcess.stderr.on('data', (chunk) => {
  errorOutput += chunk.toString();
  console.error('Error:', chunk.toString());
});

pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Python process failed with code', code);
    console.error('Error output:', errorOutput);
    process.exit(1);
  }

  console.log(`\nGenerated PDF: ${pdfBuffer.length} bytes`);
  
  // Save to test file
  fs.writeFileSync('integration-test-will.pdf', pdfBuffer);
  console.log('✓ PDF saved to integration-test-will.pdf');
  console.log('✓ PDF generation via stdin/stdout successful!');
});

// Send JSON data to Python process stdin
console.log('Sending test data to Python script...');
pythonProcess.stdin.write(JSON.stringify(testData));
pythonProcess.stdin.end();
