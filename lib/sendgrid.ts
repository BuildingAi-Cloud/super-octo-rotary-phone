import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
  sendgridApiKey,
  from = "no-reply@buildings.com"
}: {
  to: string;
  subject: string;
  html: string;
  sendgridApiKey: string;
  from?: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
      pass: sendgridApiKey,
    },
  });

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
