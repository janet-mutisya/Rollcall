
const nodemailer = require('nodemailer');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.adminEmails = process.env.ADMIN_EMAILS ? 
      process.env.ADMIN_EMAILS.split(',') : 
      ['admin@company.com'];
  }

  // Send email notification
  async sendEmail(options) {
    try {
      const emailOptions = {
        from: process.env.SMTP_USER,
        ...options
      };

      await this.emailTransporter.sendMail(emailOptions);
      console.log(`Email sent successfully to: ${options.to}`);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate standardized email template
  generateEmailTemplate(title, content, type = 'info') {
    const colors = {
      emergency: '#ef4444',
      sicksheet: '#f59e0b', 
      approval: '#10b981',
      rejection: '#ef4444',
      info: '#3b82f6'
    };

    const icons = {
      emergency: '🚨',
      sicksheet: '🏥',
      approval: '✅',
      rejection: '❌',
      info: 'ℹ️'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${colors[type]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">${icons[type]} ${title}</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
          ${content}
        </div>
        
        <div style="background: #343a40; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px;">
            This is an automated notification from the Attendance Management System
          </p>
        </div>
      </div>
    `;
  }

  // Notify admins about new emergency request
  async notifyAdminEmergency(emergencyData, userData) {
    const content = `
      <h3 style="color: #333; margin-top: 0;">Employee Details</h3>
      <p><strong>Name:</strong> ${userData.name}</p>
      <p><strong>Service Number:</strong> ${userData.serviceNumber}</p>
      <p><strong>Department:</strong> ${userData.department || 'N/A'}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      
      <h3 style="color: #333; margin-top: 30px;">Emergency Details</h3>
      <p><strong>Type:</strong> ${emergencyData.type || 'General Emergency'}</p>
      <p><strong>Emergency Date:</strong> ${new Date(emergencyData.emergencyDate).toLocaleDateString()}</p>
      ${emergencyData.returnDate ? `<p><strong>Expected Return:</strong> ${new Date(emergencyData.returnDate).toLocaleDateString()}</p>` : ''}
      <p><strong>Reason:</strong> ${emergencyData.reason}</p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; color: #856404;">
          <strong>⏰ Action Required:</strong> Please review and approve/reject this emergency request in the admin portal.
        </p>
      </div>
    `;

    const template = this.generateEmailTemplate(
      `Emergency Request - ${emergencyData.type || 'General'} | ${userData.name}`,
      content,
      'emergency'
    );

    return await this.sendEmail({
      to: this.adminEmails,
      subject: `🚨 Emergency Request - ${emergencyData.type || 'General'} | ${userData.name}`,
      html: template
    });
  }

  // Notify admins about new sick sheet
  async notifyAdminSickSheet(sickSheetData, userData) {
    const content = `
      <h3 style="color: #333; margin-top: 0;">Employee Details</h3>
      <p><strong>Name:</strong> ${userData.name}</p>
      <p><strong>Service Number:</strong> ${userData.serviceNumber}</p>
      <p><strong>Department:</strong> ${userData.department || 'N/A'}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      
      <h3 style="color: #333; margin-top: 30px;">Sick Leave Details</h3>
      ${sickSheetData.startDate ? `<p><strong>Start Date:</strong> ${new Date(sickSheetData.startDate).toLocaleDateString()}</p>` : ''}
      ${sickSheetData.endDate ? `<p><strong>End Date:</strong> ${new Date(sickSheetData.endDate).toLocaleDateString()}</p>` : ''}
      <p><strong>Reason:</strong> ${sickSheetData.reason}</p>
      
      <h3 style="color: #333; margin-top: 30px;">Attachments</h3>
      ${sickSheetData.attachmentUrl ? 
        '<p style="color: #10b981;">✓ Medical certificate attached</p>' : 
        '<p style="color: #666; font-style: italic;">No attachments provided</p>'
      }
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; color: #856404;">
          <strong>⏰ Action Required:</strong> Please review and approve/reject this sick sheet in the admin portal.
        </p>
      </div>
    `;

    const template = this.generateEmailTemplate(
      `Sick Sheet Submitted | ${userData.name}`,
      content,
      'sicksheet'
    );

    return await this.sendEmail({
      to: this.adminEmails,
      subject: `🏥 Sick Sheet Submitted | ${userData.name}`,
      html: template
    });
  }

  // Notify employee about request approval/rejection
  async notifyEmployeeStatusUpdate(requestData, userData, type = 'emergency', status) {
    const isApproved = status.toLowerCase() === 'approved';
    const requestType = type === 'emergency' ? 'Emergency Request' : 'Sick Sheet';

    const content = `
      <p>Dear ${userData.name},</p>
      <p>Your ${requestType.toLowerCase()} has been <strong>${status.toLowerCase()}</strong>.</p>
      
      <h3 style="color: #333; margin-top: 20px;">Request Details</h3>
      ${type === 'emergency' ? `
        <p><strong>Type:</strong> ${requestData.type || 'General'}</p>
        <p><strong>Date:</strong> ${new Date(requestData.emergencyDate).toLocaleDateString()}</p>
      ` : `
        ${requestData.startDate ? `<p><strong>Start Date:</strong> ${new Date(requestData.startDate).toLocaleDateString()}</p>` : ''}
        ${requestData.endDate ? `<p><strong>End Date:</strong> ${new Date(requestData.endDate).toLocaleDateString()}</p>` : ''}
      `}
      <p><strong>Reason:</strong> ${requestData.reason}</p>
      
      ${requestData.notes ? `
        <div style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0;"><strong>Admin Notes:</strong></p>
          <p style="margin: 10px 0 0 0;">${requestData.notes}</p>
        </div>
      ` : ''}
      
      <p style="margin-top: 20px;">If you have any questions, please contact your supervisor or HR department.</p>
    `;

    const template = this.generateEmailTemplate(
      `${requestType} ${status}`,
      content,
      isApproved ? 'approval' : 'rejection'
    );

    return await this.sendEmail({
      to: userData.email,
      subject: `${requestType} ${status} - ${userData.name}`,
      html: template
    });
  }

  // Send bulk notifications to multiple users
  async sendBulkNotification(userIds, subject, content, type = 'info') {
    try {
      const users = await User.find({ _id: { $in: userIds } }).select('email name');
      const results = [];

      for (const user of users) {
        const personalizedContent = content.replace(/{{name}}/g, user.name);
        const template = this.generateEmailTemplate(subject, personalizedContent, type);
        
        const result = await this.sendEmail({
          to: user.email,
          subject,
          html: template
        });

        results.push({
          userId: user._id,
          email: user.email,
          success: result.success
        });
      }

      return results;
    } catch (error) {
      console.error('Bulk notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get admin users for notifications
  async getAdminUsers() {
    try {
      const admins = await User.find({ role: 'admin' }).select('email name');
      return admins;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }

  // Real-time notification methods (for Socket.IO integration)
  async sendRealTimeNotification(io, userId, notificationData) {
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        ...notificationData,
        timestamp: new Date()
      });
    }
  }

  // Send notification to all admins via Socket.IO
  async notifyAllAdmins(io, notificationData) {
    if (io) {
      const admins = await this.getAdminUsers();
      admins.forEach(admin => {
        io.to(`user_${admin._id}`).emit('admin_notification', {
          ...notificationData,
          timestamp: new Date()
        });
      });
    }
  }

  // Create system notification (for in-app notifications)
  async createSystemNotification(userId, title, message, type = 'info', actionUrl = null) {
    // This would integrate with your notification storage system
    const notification = {
      userId,
      title,
      message,
      type,
      actionUrl,
      read: false,
      createdAt: new Date()
    };

    // Save to database (implement based on your notification schema)
    // await Notification.create(notification);

    return notification;
  }
}

// Export singleton instance
module.exports = new NotificationService();