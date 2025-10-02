import { form } from '$app/server';
import { transporter } from '$lib/utils/send-email';

import * as v from 'valibot';
export const sendEmail = form(
	v.object({
		email: v.pipe(v.string(), v.email()),
		name: v.pipe(v.string()),
		text: v.pipe(v.string())
	}),
	async (rt) => {
		// console.log(rt);
		try {
			const mail = await transporter.sendMail({
				from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
				to: rt.email,
				subject: `Hello ✔ ${rt.name}`,
				text: `Text: ${rt.text}`,
				html: '<b>Hello world?</b>'
			});
			// console.log(mail.response);

			return { status: true, mailInfo: mail };
		} catch (error) {
			return { status: false, error };
		}
	}
);
