import { transporter } from '$lib/utils/send-email';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const requestData: { name: string; email: string; text: string } = await event.request.json();

	if (!requestData) return json({ status: false, data: { response: 'Send data' } });
	try {
		const sendEmail = await transporter.sendMail({
			from: 'Serhii',
			to: requestData.email,
			text: requestData.text,
			subject: `Hello ${requestData.name}`
		});
		return json({ status: true, data: { response: sendEmail.response } });
	} catch (error) {
		return json({ status: false, data: { error } });
	}
};
