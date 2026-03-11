import iconDocument from "@/assets/icons/icon_file.svg";
import iconDownload from "@/assets/icons/icon_download.svg";
import type { BundleMetaDocument } from "@/db/schemas/bundle-meta.schema";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function BundleTabDocuments({
  className,
  documents = [],
}: {
  className?: string;
  documents?: BundleMetaDocument[];
}) {
  const documentsToRender = documents
    .map((item) => ({
      title: item.title.trim(),
      link: item.link.trim(),
    }))
    .filter((item) => item.title.length > 0 && item.link.length > 0);
  const hasDocuments = documentsToRender.length > 0;

  return (
    <div className={twMerge("rounded-sm bg-background p-4 md:p-6", className)}>
      <h2 className="H4">Documenti</h2>
      {!hasDocuments ? (
        <p className="text_R mt-3 text-text-grey">
          Al momento non sono disponibili documenti per questo bundle.
        </p>
      ) : null}

      {hasDocuments ? (
        <ul className="mt-4 flex flex-col gap-2">
          {documentsToRender.map((item) => (
            <li key={`${item.title}-${item.link}`}>
              <Link
                href={item.link}
                download={true}
                className="input_R_18 flex items-center gap-2 rounded-sm border border-stroke-grey px-3 py-2 hover:text-yellow-500"
                rel="noopener noreferrer"
              >
                <SmartImage src={iconDocument} alt="Document icon" />
                <span className="flex-1">{item.title}</span>
                <SmartImage src={iconDownload} alt="Download icon" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

