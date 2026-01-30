import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

type NotificationType = 
  | 'invoice_created'
  | 'quotation_created'
  | 'custom_order_created'
  | 'repair_order_created'
  | 'repair_order_completed'
  | 'loan_created'
  | 'loan_payment'
  | 'loan_closed'
  | 'scheme_enrollment'
  | 'scheme_payment'
  | 'scheme_matured'
  | 'payment_received';

interface NotificationRequest {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
  pdfBase64?: string;
  pdfFilename?: string;
  businessName?: string;
  businessPhone?: string;
}

function getEmailContent(type: NotificationType, data: Record<string, any>, businessName: string): { subject: string; html: string } {
  const templates: Record<NotificationType, { subject: string; html: string }> = {
    invoice_created: {
      subject: `Invoice ${data.invoiceNumber} from ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Thank You for Your Purchase!</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for shopping with us. Please find your invoice attached.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount?.toLocaleString('en-IN')}</p>
            ${data.balanceDue > 0 ? `<p><strong>Balance Due:</strong> ₹${data.balanceDue?.toLocaleString('en-IN')}</p>` : ''}
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    quotation_created: {
      subject: `Quotation ${data.quotationNumber} from ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Your Quotation is Ready!</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your interest. Please find your quotation attached.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Quotation Number:</strong> ${data.quotationNumber}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Valid Until:</strong> ${data.validUntil}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount?.toLocaleString('en-IN')}</p>
          </div>
          <p>This quotation is valid for 7 days. Prices are subject to change based on market rates.</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    custom_order_created: {
      subject: `Custom Order ${data.orderNumber} Confirmed - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Your Custom Order is Confirmed!</h2>
          <p>Dear ${data.customerName},</p>
          <p>We're excited to start working on your custom jewellery order!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Design:</strong> ${data.designDescription}</p>
            <p><strong>Metal:</strong> ${data.metalType} - ${data.purity}</p>
            <p><strong>Expected Weight:</strong> ${data.estimatedWeight}g</p>
            <p><strong>Expected Delivery:</strong> ${data.expectedDate}</p>
            <p><strong>Advance Paid:</strong> ₹${data.advancePaid?.toLocaleString('en-IN')}</p>
          </div>
          <p>We'll keep you updated on the progress. Thank you for trusting us!</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    repair_order_created: {
      subject: `Repair Order ${data.orderNumber} Received - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Repair Order Received</h2>
          <p>Dear ${data.customerName},</p>
          <p>We have received your item for repair.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Item:</strong> ${data.itemDescription}</p>
            <p><strong>Repair Type:</strong> ${data.repairType}</p>
            <p><strong>Expected Completion:</strong> ${data.expectedDate}</p>
            <p><strong>Estimated Cost:</strong> ₹${data.estimatedCost?.toLocaleString('en-IN')}</p>
          </div>
          <p>We'll notify you once your item is ready for pickup.</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    repair_order_completed: {
      subject: `Your Repair is Ready - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Your Repair is Complete!</h2>
          <p>Dear ${data.customerName},</p>
          <p>Great news! Your item has been repaired and is ready for pickup.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Item:</strong> ${data.itemDescription}</p>
            <p><strong>Final Cost:</strong> ₹${data.finalCost?.toLocaleString('en-IN')}</p>
            ${data.balanceDue > 0 ? `<p><strong>Balance Due:</strong> ₹${data.balanceDue?.toLocaleString('en-IN')}</p>` : ''}
          </div>
          <p>Please visit us at your earliest convenience to collect your item.</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    loan_created: {
      subject: `Gold Loan ${data.loanNumber} - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Gold Loan Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>Your gold loan has been successfully processed.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Loan Number:</strong> ${data.loanNumber}</p>
            <p><strong>Loan Amount:</strong> ₹${data.loanAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Interest Rate:</strong> ${data.interestRate}% per month</p>
            <p><strong>Collateral Value:</strong> ₹${data.collateralValue?.toLocaleString('en-IN')}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          <p>Please find the loan agreement attached. Keep this for your records.</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    loan_payment: {
      subject: `Loan Payment Receipt - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Payment Received</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your loan payment.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Loan Number:</strong> ${data.loanNumber}</p>
            <p><strong>Payment Amount:</strong> ₹${data.paymentAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Principal:</strong> ₹${data.principalAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Interest:</strong> ₹${data.interestAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Outstanding Balance:</strong> ₹${data.outstandingBalance?.toLocaleString('en-IN')}</p>
          </div>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    loan_closed: {
      subject: `Loan Closed - ${data.loanNumber} - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Loan Successfully Closed!</h2>
          <p>Dear ${data.customerName},</p>
          <p>Congratulations! Your gold loan has been fully repaid and closed.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Loan Number:</strong> ${data.loanNumber}</p>
            <p><strong>Total Paid:</strong> ₹${data.totalPaid?.toLocaleString('en-IN')}</p>
            <p><strong>Closed Date:</strong> ${data.closedDate}</p>
          </div>
          <p>Your pledged items are now ready for release. Please visit us with a valid ID to collect them.</p>
          <p>Thank you for choosing us!</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    scheme_enrollment: {
      subject: `Savings Scheme Enrollment - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Welcome to ${data.schemeName}!</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for enrolling in our savings scheme!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Enrollment Number:</strong> ${data.enrollmentNumber}</p>
            <p><strong>Scheme:</strong> ${data.schemeName}</p>
            <p><strong>Monthly Amount:</strong> ₹${data.monthlyAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Duration:</strong> ${data.durationMonths} months</p>
            <p><strong>Maturity Date:</strong> ${data.maturityDate}</p>
            <p><strong>Bonus:</strong> ${data.bonusDetails}</p>
          </div>
          <p>Make timely payments to earn your bonus!</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    scheme_payment: {
      subject: `Scheme Payment Receipt - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Payment Received</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your scheme payment!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Enrollment:</strong> ${data.enrollmentNumber}</p>
            <p><strong>Installment:</strong> ${data.installmentNumber} of ${data.totalInstallments}</p>
            <p><strong>Amount Paid:</strong> ₹${data.amountPaid?.toLocaleString('en-IN')}</p>
            <p><strong>Total Paid:</strong> ₹${data.totalPaid?.toLocaleString('en-IN')}</p>
            <p><strong>Remaining:</strong> ${data.installmentsRemaining} installments</p>
          </div>
          <p>Keep up the great savings habit!</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    scheme_matured: {
      subject: `🎉 Your Savings Scheme Has Matured! - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Congratulations! 🎉</h2>
          <p>Dear ${data.customerName},</p>
          <p>Your savings scheme has matured! You've earned your bonus!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Enrollment:</strong> ${data.enrollmentNumber}</p>
            <p><strong>Scheme:</strong> ${data.schemeName}</p>
            <p><strong>Total Paid:</strong> ₹${data.totalPaid?.toLocaleString('en-IN')}</p>
            <p><strong>Bonus Earned:</strong> ${data.bonusEarned}</p>
            <p><strong>Payout Amount:</strong> ₹${data.payoutAmount?.toLocaleString('en-IN')}</p>
          </div>
          <p>Please visit our store to redeem your benefits. We look forward to seeing you!</p>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
    payment_received: {
      subject: `Payment Receipt - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Payment Received</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your payment!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Receipt Number:</strong> ${data.paymentNumber}</p>
            <p><strong>Amount:</strong> ₹${data.amount?.toLocaleString('en-IN')}</p>
            <p><strong>Payment Mode:</strong> ${data.paymentMode}</p>
            <p><strong>Reference:</strong> ${data.referenceNumber || 'N/A'}</p>
            ${data.invoiceNumber ? `<p><strong>Against Invoice:</strong> ${data.invoiceNumber}</p>` : ''}
          </div>
          <p>Best regards,<br/><strong>${businessName}</strong></p>
        </div>
      `,
    },
  };

  return templates[type] || {
    subject: `Notification from ${businessName}`,
    html: `<p>You have a new notification from ${businessName}</p>`,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      recipientEmail,
      recipientName,
      data,
      pdfBase64,
      pdfFilename,
      businessName = "JewelPro",
      businessPhone,
    }: NotificationRequest = await req.json();

    if (!recipientEmail) {
      console.log("No recipient email provided, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, html } = getEmailContent(type, { ...data, customerName: recipientName }, businessName);

    const emailOptions: any = {
      from: `${businessName} <noreply@resend.dev>`,
      to: [recipientEmail],
      subject,
      html,
    };

    // Add PDF attachment if provided
    if (pdfBase64 && pdfFilename) {
      emailOptions.attachments = [
        {
          filename: pdfFilename,
          content: pdfBase64,
        },
      ];
    }

    const emailResponse = await sendEmail(emailOptions);
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
