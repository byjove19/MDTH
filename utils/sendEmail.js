const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email text message
 * @param {string} [options.html] - HTML version of the email (optional)
 * @returns {Promise<Object>} - Nodemailer response
 */
const sendEmail = async (options) => {
  try {
    // Use different transport based on environment
    let transporter;
    
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      // Development: Use ethereal.email (fake SMTP service for testing)
      // OR use console logging if no credentials provided
      
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        // Development mode: Log email to console instead of sending
        console.log('\n' + '='.repeat(60));
        console.log('📧 EMAIL WOULD BE SENT (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        
        if (options.html) {
          console.log(`HTML: ${options.html.substring(0, 100)}...`);
        }
        
        // Log password reset URLs if present in message
        const urlMatch = options.message.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          console.log(`🔗 Reset URL: ${urlMatch[0]}`);
        }
        
        console.log('='.repeat(60) + '\n');
        
        // Simulate successful email sending
        return {
          messageId: `dev-${Date.now()}`,
          accepted: [options.email],
          response: 'Email logged to console (development mode)'
        };
      }
      
      // If credentials are provided in development, use them
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    // Define email options
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || '"MDTH System" <noreply@mdth.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${options.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MDTH System</h1>
            </div>
            <div class="content">
              ${options.message.replace(/\n/g, '<br>')}
              ${options.message.includes('reset of a password') ? 
                `<p><a href="${urlMatch ? urlMatch[0] : '#'}" class="button">Reset Password</a></p>
                 <p>Or copy and paste this link in your browser:</p>
                 <div class="code">${urlMatch ? urlMatch[0] : 'Reset URL'}</div>` 
                : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from MDTH System. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} MDTH. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to ${options.email}: ${info.messageId}`);
    return info;
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // For development, still return success even if email fails
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Email failed, but continuing in development mode');
      return {
        messageId: `error-${Date.now()}`,
        accepted: [options.email],
        response: 'Email failed but proceeding in development mode'
      };
    }
    
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;