import Spiner from "@/components/Spiner";

export default function Loading() {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center">
      <Spiner />
    </div>
  );
}
