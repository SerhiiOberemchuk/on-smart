import { transporter } from '$lib/utils/send-email';
import type { Actions } from './$types';

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email') as string;
		const name = data.get('name') as string;
		const text = data.get('text') as string;

		if (!email) return;
		try {
			const sendEmail = await transporter.sendMail({
				from: 'Serhii',
				to: [email],
				text,
				subject: `Hello ${name}`
			});
			return { status: true, data: { response: sendEmail.response } };
		} catch (error) {
			return { status: false, data: { response: error } };
		}
	}
} satisfies Actions;
