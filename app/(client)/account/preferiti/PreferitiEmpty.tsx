import Link from "next/link";

export default function PreferitiEmpty() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="helper_text">Non hai ancora prodotti tra i preferiti.</p>
      <Link href="/catalogo" className="rounded-sm bg-yellow-500 px-4 py-2 font-medium text-black">
        Vai al catalogo
      </Link>
    </div>
  );
}
