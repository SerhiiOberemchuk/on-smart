<script>
	import { setLocale } from '$lib/paraglide/runtime';
	import HeroSection from '../components/pages/home/HeroSection.svelte';
	import NovitaSection from '../components/pages/home/novita-section/NovitaSection.svelte';
</script>

<HeroSection />
<NovitaSection />

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
	<button class=" cursor-pointer rounded-2xl bg-amber-300 px-3 py-2" onclick={() => setLocale('de')}
		>de</button
	>
</div>
