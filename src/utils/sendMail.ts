import nodemailer from 'nodemailer';
import { config } from '../config/env';

/** Shared Nodemailer transporter (Gmail + app password from env). */
export const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.mailFrom,
    pass: config.mailPassword,
  },
});
