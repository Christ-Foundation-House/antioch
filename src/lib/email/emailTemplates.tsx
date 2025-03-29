const WICF_LOGO = `
    <div style="width: 100%; height: 30px; display: flex; align-items: center; justify-content: center; padding: 10px">
        <img src=https://maravianwebservices.com/images/wicf/assets/logo2.png alt="WICF LOGO" width="100px" height="100px" />
    </div>
`;

export function emailTemplateWelcome({
  first_name,
  last_name,
  login_link,
  feedback_link,
}: {
  first_name: string;
  last_name: string;
  login_link: string;
  feedback_link: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WICF</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #0056b3;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007bff;
                  border-radius: 5px;
                  text-align: center;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          ${WICF_LOGO}
            <h1>Welcome to WICF!</h1>
            <p>Dear ${first_name} ${last_name},</p>
            <p>We are happy to officially welcome you to the WICF! We're excited to have you with us, and your involvement will help us stay connected, organize events, and provide support as we continue growing together in Christ.</p>
            <p>As a member, you can log in to our church system at any time to access a range of features, update your informaton, submit prayer requests, connect with leadership, join Bible study groups, follow sunday live streams, explore past events, and much more.</p>
            <p>To begin, simply <a href="${login_link}" class="button">log in to your account</a> and explore all that we have to offer.</p>
            <p>If you have any questions or need assistance, don't hesitate to reach out <a href="${feedback_link}" class="button">here</a>. We're here to support you!</p>
            <p>Blessings,</p>
            <p>The WICF Leadership Team</p>
          </div>
      </body>
      </html>
      `;
}

export function emailTemplateBanned({
  first_name,
  last_name,
  appeal_link,
}: {
  first_name: string;
  last_name: string;
  appeal_link: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Banned</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #b30000;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007bff;
                  border-radius: 5px;
                  text-align: center;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          ${WICF_LOGO}
            <h1>Account Banned</h1>
            <p>Dear ${first_name} ${last_name},</p>
            <p>We regret to inform you that your account has been banned due to a violation of our policies. Your access to the platform has been restricted and you will no longer be able to use the wicf system.</p>
            <p>If you believe this is a mistake or you would like to appeal this decision, please click the link below to submit your appeal:</p>
            <p><a href="${appeal_link}" class="button">Submit Appeal</a></p>
            <p>Please understand that this decision was not made lightly, and we take the safety and well-being of our community very seriously.</p>
            <p>Thank you for your understanding,</p>
            <p>The WICF Leadership Team</p>
          </div>
      </body>
      </html>
      `;
}

export function emailTemplateUnbanned({
  first_name,
  last_name,
  login_link,
  support_link,
}: {
  first_name: string;
  last_name: string;
  login_link: string;
  support_link: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Unbanned</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #28a745;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007bff;
                  border-radius: 5px;
                  text-align: center;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          ${WICF_LOGO}
            <h1>Your Account Has Been Unbanned</h1>
            <p>Dear ${first_name} ${last_name},</p>
            <p>We are pleased to inform you that your account has been restored and the ban has been lifted. You can now log back into your account and continue using our services as normal.</p>
            <p>To access your account, please use the link below:</p>
            <p><a href="${login_link}" class="button">Log in to Your Account</a></p>
            <p>If you encounter any issues or need further assistance, feel free to reach out to our support team <a href="${support_link}">here</a>.</p>
            <p>Thank you for your patience and understanding.</p>
            <p>Best regards,</p>
            <p>The WICF Leadership Team</p>
          </div>
      </body>
      </html>
      `;
}

export function emailTemplateAccountNoMembership({
  first_name,
  retry_link,
}: {
  first_name: string;
  retry_link: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Resolved: Account Creation/Information Update</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #0056b3;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007bff;
                  border-radius: 5px;
                  text-align: center;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          ${WICF_LOGO}
            <h1>Account Issue Resolved</h1>
            <p>Dear ${first_name},</p>
            <p>We noticed that you were unable to complete your account creation or information update due to an error ("AccountNoMembership"). This issue has now been resolved for your account, and you can proceed with your information update.</p>
            <p>Please click the link below to try again:</p>
            <p><a href="${retry_link}" class="button">Complete Information Update</a></p>
            <p>If you encounter any further issues, please use the "Report" button on the system to notify us.</p>
            <p>Thank you for your patience,</p>
            <p>The WICF Support Team</p>
          </div>
      </body>
      </html>
      `;
}

export interface ArgsEmailTemplateIssueResolved {
  email: string;
  name: string;
  title: string;
  subject: string;
  testLink?: string;
  resolvedLink?: string;
  body?: string; // Optional custom text for more flexibility
}
export function emailTemplateIssueResolved({
  name,
  title,
  testLink,
  resolvedLink,
  body,
}: ArgsEmailTemplateIssueResolved): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Issue Resolved - Support Team</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #0056b3;
            }
            p {
                margin: 0 0 20px;
            }
            a {
                color: #007bff;
                text-decoration: none;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #28a745;
                border-radius: 5px;
                text-align: center;
                text-decoration: none;
                margin-top: 10px;
            }
            .button.secondary {
                background-color: #007bff;
            }
            .footer {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
        ${WICF_LOGO}
          <h1>Issue Resolved: ${title}</h1>
          <p>Dear ${name},</p>
          <p>${body ?? ""}</p>
          <div style="text-align: center; margin-top: 20px;">
            ${
              testLink || testLink === ""
                ? `<p>To test the fix, please visit the link below:</p>
            <a href="${testLink}" class="button">Test the Fix</a>`
                : ""
            }
            ${
              resolvedLink || resolvedLink === ""
                ? `<p style="margin-top: 20px;">If the issue is resolved, kindly confirm by clicking the button below:</p>
            <a href="${resolvedLink}" class="button secondary">Click here is problem is Resolved</a>`
                : ""
            }
          </div>
          <br/>
          <p>If you're still experiencing problems or have any questions, feel free to reply to this email.</p>
          <p>Thank you for your patience and cooperation.</p>
          <p>Best regards,</p>
          <p>The WICF Team</p>
        </div>
    </body>
    </html>
    `;
}

export function emailTemplateReportAcknowledgedByUserToAdmin({
  userName,
  reportTitle,
  reportDate,
  reportFixedDate,
  reportLink,
}: {
  userName: string;
  reportTitle: string;
  reportDate: string;
  reportFixedDate: string;
  reportLink: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Marked as Fixed</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #0056b3;
            }
            p {
                margin: 0 0 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #007bff;
                border-radius: 5px;
                text-align: center;
                text-decoration: none;
                margin-top: 10px;
            }
            .footer {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
        ${WICF_LOGO}
          <h1>Report Marked as Fixed</h1>
          <p>Dear ADMIN,</p>
          <p>The user <strong>${userName}</strong> has marked the report titled "<strong>${reportTitle}</strong>", submitted on <strong>${reportDate}</strong>, as acknowledged and fixed on <strong>${reportFixedDate}</strong>.</p>
          <p>You can review the details of this report by clicking the button below:</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${reportLink}" class="button">View Report</a>
          </div>
          <p>If any further action is required, please proceed accordingly. Thank you for overseeing the process and ensuring smooth operations.</p>
          <p>Best regards,</p>
          <p>The WICF Team</p>
        </div>
    </body>
    </html>
    `;
}

export function emailTemplateFeedbackSubmitted({
  adminName,
  feedbackId,
  feedbackName,
  feedbackMessage,
  feedbackContact,
  feedbackUserId,
}: {
  adminName: string;
  feedbackId: number;
  feedbackName: string | null;
  feedbackMessage: string;
  feedbackContact: string | null;
  feedbackUserId: string | null;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Feedback Submitted</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #0056b3;
            }
            p {
                margin: 0 0 20px;
            }
            .footer {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
        ${WICF_LOGO}
          <h1>New Feedback Submitted</h1>
          <p>Dear ${adminName},</p>
          <p>You have received a new feedback submission with the following details:</p>
          <p><strong>Feedback ID:</strong> ${feedbackId}</p>
          <p><strong>Name:</strong> ${feedbackName ? feedbackName : "N/A"}</p>
          <p><strong>Message:</strong> ${feedbackMessage}</p>
          <p><strong>Contact:</strong> ${feedbackContact ? feedbackContact : "N/A"}</p>
          <p><strong>User ID:</strong> ${feedbackUserId ? feedbackUserId : "N/A"}</p>
          <p>Please review the feedback and take any necessary actions.</p>
          <p>Best regards,</p>
          <p>The WICF Team</p>
        </div>
    </body>
    </html>
    `;
}

export function emailTemplatePasswordChanged({
  first_name,
  time_changed,
}: {
  first_name: string;
  time_changed?: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #007bff;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              ${WICF_LOGO}
              <h1>Password Changed</h1>
              <p>Dear ${first_name},</p>
              <p>We wanted to let you know that your account password was successfully changed at <strong>${time_changed}</strong>.</p>
              <p>If you made this change, no further action is required.</p>
              <p>If you did <strong>not</strong> request this change, please contact our media team immediately to secure your account.</p>
              <p>Thank you for being part of the WICF system.</p>
              <p>Sincerely,</p>
              <p>WICF System</p>
              <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
              </div>
          </div>
      </body>
      </html>
    `;
}

export function emailTemplateAppointmentNotification({
  first_name,
  last_name,
  position,
  tenure_from,
  tenure_to,
  accept_link,
}: {
  first_name: string;
  last_name: string;
  position: string;
  tenure_from: string;
  tenure_to: string;
  accept_link: string;
}): string {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Position Appointment</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #0056b3;
              }
              p {
                  margin: 0 0 20px;
              }
              a {
                  color: #007bff;
                  text-decoration: none;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fff;
                  background-color: #28a745;
                  border-radius: 5px;
                  text-align: center;
                  text-decoration: none;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  text-align: center;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          ${WICF_LOGO}
            <h1>New Position Appointment</h1>
            <p>Dear ${first_name} ${last_name},</p>
            <p>We are pleased to inform you that you have been appointed to the position of <strong>${position}</strong> at WICF.</p>
            <p>Your tenure period will be from <strong>${tenure_from}</strong> to <strong>${tenure_to}</strong>.</p>
            <p>This role comes with important responsibilities and opportunities to serve our community. We believe your skills and dedication will be valuable assets in this position.</p>
            <div style="text-align: center; margin: 30px 0;">
              <p>Please click the button below to accept this appointment:</p>
              <a href="${accept_link}" class="button">Accept Appointment</a>
            </div>
            <p>If you have any questions about your new role or responsibilities, please don't hesitate to reach out to the leadership team.</p>
            <p>May God bless you as you serve in this new capacity.</p>
            <p>Best regards,</p>
            <p>The WICF Leadership Team</p>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
      </body>
      </html>
      `;
}
