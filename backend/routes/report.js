// routes/report.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { getScanResults } = require('../utils/exposureService');

// Helper function to strip HTML tags and format text
const cleanHTMLText = (htmlText) => {
  if (!htmlText) return '';
  
  return htmlText
    .replace(/<h[1-6][^>]*>/g, '\n\n') // Replace headers with line breaks
    .replace(/<\/h[1-6]>/g, '\n') // Close headers with line break
    .replace(/<p[^>]*>/g, '') // Remove opening p tags
    .replace(/<\/p>/g, '\n') // Replace closing p tags with line breaks
    .replace(/<br\s*\/?>/g, '\n') // Replace br tags with line breaks
    .replace(/<li[^>]*>/g, '• ') // Replace li tags with bullet points
    .replace(/<\/li>/g, '\n') // Close li with line break
    .replace(/<ul[^>]*>|<\/ul>/g, '\n') // Replace ul tags with line breaks
    .replace(/<ol[^>]*>|<\/ol>/g, '\n') // Replace ol tags with line breaks
    .replace(/<strong[^>]*>|<\/strong>/g, '') // Remove strong tags
    .replace(/<b[^>]*>|<\/b>/g, '') // Remove bold tags
    .replace(/<em[^>]*>|<\/em>/g, '') // Remove em tags
    .replace(/<i[^>]*>|<\/i>/g, '') // Remove italic tags
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .trim();
};

// PDF Helper to format and stream
const generatePDF = (res, results) => {
  const doc = new PDFDocument({ 
    margin: 50,
    info: {
      Title: 'PEAT Privacy Analysis Report',
      Author: 'PEAT Privacy Analysis Tool',
      Subject: 'Digital Privacy Footprint Analysis',
      Creator: 'PEAT - Kadir Has University'
    }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="PEAT_Report_${results.email || results.username || 'user'}_${new Date().toISOString().split('T')[0]}.pdf"`);

  doc.pipe(res);

  // Title and Header
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('PEAT Privacy Analysis Report', { align: 'center' })
     .moveDown();
     
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
     .text(`Target: ${results.email || results.username || 'Unknown'}`, { align: 'center' })
     .moveDown(2);

  // Email Breaches Section
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('BREACH ANALYSIS', { underline: true })
     .moveDown(0.5);
     
  if (results.breaches?.length) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('red')
       .text(`⚠ ${results.breaches.length} Data Breach${results.breaches.length !== 1 ? 'es' : ''} Found`)
       .fillColor('black')
       .moveDown();
       
    results.breaches.forEach((breach, index) => {
      const title = breach.Title || breach.title || 'Unknown Breach';
      const breachDate = breach.BreachDate || breach.breachDate || 'Unknown Date';
      const domain = breach.Domain || breach.domain || 'N/A';
      const dataClasses = breach.DataClasses || breach.dataClasses || [];
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${title}`)
         .font('Helvetica')
         .text(`   Date: ${breachDate}`)
         .text(`   Domain: ${domain}`)
         .text(`   Exposed Data: ${Array.isArray(dataClasses) ? dataClasses.join(', ') : 'Not specified'}`)
         .moveDown();
    });
  } else {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('green')
       .text('✓ Good news! No data breaches found.')
       .fillColor('black');
  }

  doc.moveDown(1);

  // Platform Registrations Section
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('PLATFORM REGISTRATIONS', { underline: true })
     .moveDown(0.5);
     
  if (results.used_on?.length) {
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Found on ${results.used_on.length} platform(s):`)
       .moveDown(0.3);
       
    results.used_on.forEach(platform => {
      doc.text(`• ${platform}`);
    });
  } else {
    doc.fontSize(12)
       .font('Helvetica')
       .text('No platform registrations detected.');
  }

  doc.moveDown(1);

  // Social Media Profiles Section
  if (results.sherlock?.length) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('SOCIAL MEDIA PROFILES', { underline: true })
       .moveDown(0.5);
       
    doc.fontSize(12)
       .font('Helvetica')
       .text(`${results.sherlock.length} public profile(s) discovered:`)
       .moveDown(0.3);
       
    results.sherlock.forEach(profile => {
      doc.text(`• ${profile.platform}: ${profile.url}`);
    });
    
    doc.moveDown(1);
  }

  // AI Risk Assessment Section - FIXED HTML CLEANING
  if (results.explanation) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('AI RISK ASSESSMENT', { underline: true })
       .moveDown(0.5);
       
    // Clean the HTML content
    const cleanExplanation = cleanHTMLText(results.explanation);
    
    doc.fontSize(11)
       .font('Helvetica')
       .text(cleanExplanation, {
         width: 500,
         align: 'left',
         lineGap: 2
       });
       
    doc.moveDown(1);
  }

  // Privacy Recommendations
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('PRIVACY RECOMMENDATIONS', { underline: true })
     .moveDown(0.5);
     
  const recommendations = [
    'Change passwords on all affected platforms immediately',
    'Enable two-factor authentication where available', 
    'Review and update privacy settings on social media accounts',
    'Monitor accounts for suspicious activity regularly',
    'Use unique, strong passwords for each platform',
    'Consider using a reputable password manager',
    'Be cautious of phishing attempts via email or social media'
  ];
  
  recommendations.forEach((rec, index) => {
    doc.fontSize(12)
       .font('Helvetica')
       .text(`${index + 1}. ${rec}`);
  });

  doc.moveDown(2);

  // Footer
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('gray')
     .text('═'.repeat(60), { align: 'center' })
     .text('Report generated by PEAT Privacy Analysis Tool', { align: 'center' })
     .text('Developed by Lydiah Muigwa • Kadir Has University', { align: 'center' })
     .text('© 2025 PEAT Privacy Analysis Tool', { align: 'center' });

  doc.end();
};

router.get('/pdf', async (req, res) => {
  const { email, username } = req.query;

  try {
    if (!email && !username) {
      return res.status(400).json({ error: 'Email or username is required.' });
    }

    const results = await getScanResults(email || null, false, username ? [username] : []);
    if (!results) {
      return res.status(404).json({ error: 'No scan data found.' });
    }

    generatePDF(res, results);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

module.exports = router;