<script lang="ts">
	import { enhance } from '$app/forms';
	import clsx from 'clsx';
	import type { PageProps } from './$types';
	// import type { PageProps } from './$types';
	let { form, data }: PageProps = $props();
	$inspect(form, data);
</script>

<form method="POST" use:enhance class=" flex flex-col gap-2">
	<input
		required
		type="text"
		name="name"
		placeholder="nome*"
		class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
	/>
	<input
		required
		type="email"
		name="email"
		id="email_id"
		placeholder="e-mail*"
		class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
	/>
	<textarea
		required
		name="text"
		id="messagio_id"
		placeholder="Messagio*"
		class=" rounded-md bg-gray-400 font-medium text-black focus:border-2 focus:border-green-500 focus:bg-amber-200"
	></textarea>
	<button
		class={clsx(
			'mx-auto rounded-xl px-10 py-2 font-bold text-white uppercase',
			false ? 'bg-green-300' : 'bg-green-700'
		)}
	>
		<span>Inviare</span>
	</button>
</form>
