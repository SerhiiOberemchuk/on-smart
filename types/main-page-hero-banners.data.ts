export type MainPageHeroBanner = {
  title: string;
  src: string;
  srcMob: string;
  href: string;
  ctaLabel: string;
  ariaLabel: string;
};

export const slidesBanners: MainPageHeroBanner[] = [
  {
    title: "AJAX: la difesa perfetta per ogni ambiente.",
    src: "/hero-baner/banner1.jpg",
    srcMob: "/hero-baner/banner1mob.jpg",
    href: "/catalogo",
    ctaLabel: "Scopri Ajax",
    ariaLabel: "Apri il catalogo Ajax per sistemi di sicurezza",
  },
  {
    title: "Ogni dettaglio sotto controllo. Sempre.",
    src: "/hero-baner/banner2.jpg",
    srcMob: "/hero-baner/banner2mob.jpg",
    href: "/catalogo",
    ctaLabel: "Vai alla videosorveglianza",
    ariaLabel: "Apri il catalogo dei prodotti di videosorveglianza",
  },
  {
    title: "La forza dell'energia, la certezza della protezione.",
    src: "/hero-baner/banner3.jpg",
    srcMob: "/hero-baner/banner3mob.jpg",
    href: "/catalogo",
    ctaLabel: "Scopri i prodotti",
    ariaLabel: "Apri il catalogo prodotti consigliati per energia e protezione",
  },
  {
    title: "Cavi, alimentatori e accessori per ogni installazione.",
    src: "/hero-baner/banner4.jpg",
    srcMob: "/hero-baner/banner4mob.jpg",
    href: "/catalogo",
    ctaLabel: "Vedi accessori",
    ariaLabel: "Apri il catalogo accessori per installazione",
  },
];
