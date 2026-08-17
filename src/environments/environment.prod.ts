export const environment = {
  production: process.env.PRODUCTION === 'false',
  url: process.env.API_URL || '',
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  isAppointmentProduction: process.env.IS_APPOINTMENT_PRODUCTION !== 'false'
};
