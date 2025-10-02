import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
});
