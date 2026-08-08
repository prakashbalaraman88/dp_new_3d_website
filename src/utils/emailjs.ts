import emailjs from '@emailjs/browser';
import { emailjsEnv } from '../config/environment';

emailjs.init(emailjsEnv.PUBLIC_KEY);

const withContactAliases = (templateParams: Record<string, unknown>) => {
  const params = { ...templateParams };

  if (params.from_name && !params.name) params.name = params.from_name;
  if (params.from_email && !params.email) params.email = params.from_email;
  if (params.phone && !params.phone_number) params.phone_number = params.phone;

  return params;
};

export const sendEmail = async ({ template_id, service_id, user_id, template_params }: {
  template_id: string;
  service_id: string;
  user_id: string;
  template_params: Record<string, unknown>;
}) => {
  try {
    return await emailjs.send(
      service_id,
      template_id,
      withContactAliases(template_params),
      user_id
    );
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendChatLead = async (phone: string, transcript: string) => {
  // Credentials provided by user
  const SERVICE_ID = "service_353wo3d";
  const TEMPLATE_ID = "template_h3kdg86";
  const PUBLIC_KEY = "98i8Pncvl-khTXgn5";

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        phone_number: phone,
        chat_transcript: transcript,
        source: "AI Chat Widget",
        date: new Date().toLocaleString()
      },
      PUBLIC_KEY
    );
    console.log("Lead sent successfully!", response.status, response.text);
    return response;
  } catch (error: any) {
    console.error("Failed to send lead:", error);
    if (error.text) console.error("EmailJS Error Text:", error.text);
    // Silent fail so we don't break the chat UI
    return null;
  }
};
