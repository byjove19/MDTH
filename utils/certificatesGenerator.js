const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Certificate = require('../models/Certificate');

exports.generateCertificate = async (userId, courseId, courseData, userData) => {
  try {
    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const verificationCode = crypto.randomBytes(8).toString('hex');
    
    // Create certificate data
    const certificateData = {
      certificateId,
      verificationCode,
      issuedAt: new Date(),
      downloadUrl: `${process.env.APP_URL}/certificates/${certificateId}/download`,
      metadata: {
        completionDate: new Date(),
        finalScore: courseData.finalScore || 100,
        instructorName: courseData.instructorName || 'MDTH Instructor',
        courseDuration: courseData.duration || 0
      }
    };

    // Generate PDF certificate
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4'
    });

    const fileName = `certificate-${certificateId}.pdf`;
    const filePath = path.join(__dirname, '../public/certificates', fileName);
    
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Certificate design
    doc.image(path.join(__dirname, '../assets/certificate-bg.jpg'), 0, 0, { width: 842, height: 595 });

    // Title
    doc.fontSize(40)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Certificate of Completion', 0, 100, { align: 'center' });

    // Subtitle
    doc.fontSize(20)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text('This certifies that', 0, 180, { align: 'center' });

    // Student name
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#2980b9')
       .text(userData.name.toUpperCase(), 0, 220, { align: 'center' });

    // Course details
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('has successfully completed the course', 0, 280, { align: 'center' });

    // Course title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#e74c3c')
       .text(courseData.title, 0, 320, { align: 'center' });

    // Date and details
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#34495e')
       .text(`Issued on: ${new Date().toLocaleDateString()}`, 0, 380, { align: 'center' });

    doc.fontSize(12)
       .fillColor('#95a5a6')
       .text(`Certificate ID: ${certificateId} | Verification Code: ${verificationCode}`, 0, 500, { align: 'center' });

    doc.end();

    // Save to database
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      ...certificateData
    });

    return {
      certificate,
      filePath: `/certificates/${fileName}`
    };
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw error;
  }
};