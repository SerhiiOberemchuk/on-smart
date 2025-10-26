export default function Footer() {
  return (
    <footer className="container mt-8 border-t bg-header-footer py-4 text-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} OnSmart. Tutti i diritti riservati.
      </p>
    </footer>
  );
}
