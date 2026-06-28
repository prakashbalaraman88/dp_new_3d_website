import emailjs from '@emailjs/browser';

emailjs.init("98i8Pncvl-khTXgn5");

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
      template_params,
      user_id
    );
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};