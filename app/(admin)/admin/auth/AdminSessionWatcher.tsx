// "use client";

// import { useEffect, useState } from "react";
// import { authClient } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

// export default function AdminSessionWatcher() {
//   const [checked, setChecked] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     async function check() {
//       try {
//         const session = await authClient.getSession();
//         if (!session) {
//           toast.error("La sessione è scaduta. Effettua di nuovo l’accesso.");
//           router.push("/admin/auth");
//           return;
//         }
//       } catch (err) {
//         toast.error("Errore di autenticazione. Ricarica la pagina.");
//         console.error(err);
//         router.push("/admin/auth");
//       } finally {
//         setChecked(true);
//       }
//     }

//     check();
//   }, [router]);

//   if (!checked) return null;

//   return null;
// }
