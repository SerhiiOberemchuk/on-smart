<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div class="flex gap-2">
	<button class=" cursor-pointer rounded-2xl bg-amber-300 px-3 py-2" onclick={() => setLocale('en')}
		>en</button
	>
	<button class=" cursor-pointer rounded-2xl bg-amber-300 px-3 py-2" onclick={() => setLocale('uk')}
		>uk</button
	>
	<button class=" cursor-pointer rounded-2xl bg-amber-300 px-3 py-2" onclick={() => setLocale('it')}
		>it</button
	>
</div>
<p>
	If you use VSCode, install the <a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	> for a better i18n experience.
</p>
<span>{m.app_span()}</span>
