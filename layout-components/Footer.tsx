export default function Footer() {
  return (
    <footer className="mt-8 border-t bg-header-footer py-4 text-center">
      <div className="container">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} OnSmart. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
