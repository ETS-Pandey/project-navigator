import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface SendEmailOptions {
  type: NotificationType;
  recipientEmail: string | null | undefined;
  recipientName: string;
  data: Record<string, any>;
  pdfBase64?: string;
  pdfFilename?: string;
}

export function useEmailNotifications() {
  const { toast } = useToast();

  const sendNotificationEmail = async ({
    type,
    recipientEmail,
    recipientName,
    data,
    pdfBase64,
    pdfFilename,
  }: SendEmailOptions): Promise<boolean> => {
    if (!recipientEmail) {
      console.log("No email provided, skipping notification");
      return false;
    }

    try {
      const { data: response, error } = await supabase.functions.invoke(
        'send-notification-email',
        {
          body: {
            type,
            recipientEmail,
            recipientName,
            data,
            pdfBase64,
            pdfFilename,
            businessName: "JewelPro",
          },
        }
      );

      if (error) {
        console.error("Failed to send email:", error);
        return false;
      }

      if (response?.success) {
        console.log("Email notification sent successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  };

  // Convenience methods for specific notification types
  const sendInvoiceEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    invoiceData: {
      invoiceNumber: string;
      date: string;
      totalAmount: number;
      balanceDue?: number;
    },
    pdfBase64?: string
  ) => {
    return sendNotificationEmail({
      type: 'invoice_created',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: invoiceData,
      pdfBase64,
      pdfFilename: `Invoice_${invoiceData.invoiceNumber}.pdf`,
    });
  };

  const sendQuotationEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    quotationData: {
      quotationNumber: string;
      date: string;
      validUntil: string;
      totalAmount: number;
    },
    pdfBase64?: string
  ) => {
    return sendNotificationEmail({
      type: 'quotation_created',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: quotationData,
      pdfBase64,
      pdfFilename: `Quotation_${quotationData.quotationNumber}.pdf`,
    });
  };

  const sendCustomOrderEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    orderData: {
      orderNumber: string;
      designDescription: string;
      metalType: string;
      purity: string;
      estimatedWeight: number;
      expectedDate: string;
      advancePaid: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'custom_order_created',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: orderData,
    });
  };

  const sendRepairOrderEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    orderData: {
      orderNumber: string;
      itemDescription: string;
      repairType: string;
      expectedDate: string;
      estimatedCost: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'repair_order_created',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: orderData,
    });
  };

  const sendRepairCompletedEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    orderData: {
      orderNumber: string;
      itemDescription: string;
      finalCost: number;
      balanceDue: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'repair_order_completed',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: orderData,
    });
  };

  const sendLoanCreatedEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    loanData: {
      loanNumber: string;
      loanAmount: number;
      interestRate: number;
      collateralValue: number;
      dueDate: string;
    },
    pdfBase64?: string
  ) => {
    return sendNotificationEmail({
      type: 'loan_created',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: loanData,
      pdfBase64,
      pdfFilename: `LoanAgreement_${loanData.loanNumber}.pdf`,
    });
  };

  const sendLoanPaymentEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    paymentData: {
      loanNumber: string;
      paymentAmount: number;
      principalAmount: number;
      interestAmount: number;
      outstandingBalance: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'loan_payment',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: paymentData,
    });
  };

  const sendLoanClosedEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    loanData: {
      loanNumber: string;
      totalPaid: number;
      closedDate: string;
    }
  ) => {
    return sendNotificationEmail({
      type: 'loan_closed',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: loanData,
    });
  };

  const sendSchemeEnrollmentEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    enrollmentData: {
      enrollmentNumber: string;
      schemeName: string;
      monthlyAmount: number;
      durationMonths: number;
      maturityDate: string;
      bonusDetails: string;
    }
  ) => {
    return sendNotificationEmail({
      type: 'scheme_enrollment',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: enrollmentData,
    });
  };

  const sendSchemePaymentEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    paymentData: {
      enrollmentNumber: string;
      installmentNumber: number;
      totalInstallments: number;
      amountPaid: number;
      totalPaid: number;
      installmentsRemaining: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'scheme_payment',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: paymentData,
    });
  };

  const sendSchemeMaturedEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    maturityData: {
      enrollmentNumber: string;
      schemeName: string;
      totalPaid: number;
      bonusEarned: string;
      payoutAmount: number;
    }
  ) => {
    return sendNotificationEmail({
      type: 'scheme_matured',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: maturityData,
    });
  };

  const sendPaymentReceivedEmail = async (
    customerEmail: string | null | undefined,
    customerName: string,
    paymentData: {
      paymentNumber: string;
      amount: number;
      paymentMode: string;
      referenceNumber?: string;
      invoiceNumber?: string;
    }
  ) => {
    return sendNotificationEmail({
      type: 'payment_received',
      recipientEmail: customerEmail,
      recipientName: customerName,
      data: paymentData,
    });
  };

  return {
    sendNotificationEmail,
    sendInvoiceEmail,
    sendQuotationEmail,
    sendCustomOrderEmail,
    sendRepairOrderEmail,
    sendRepairCompletedEmail,
    sendLoanCreatedEmail,
    sendLoanPaymentEmail,
    sendLoanClosedEmail,
    sendSchemeEnrollmentEmail,
    sendSchemePaymentEmail,
    sendSchemeMaturedEmail,
    sendPaymentReceivedEmail,
  };
}
