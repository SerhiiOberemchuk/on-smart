export type InputsCheckoutStep1 = {
  client_type: "privato" | "azienda";
  email: string;
  numeroTelefono: string;
  nome: string;
  cognome: string;
  indirizzo: string;
  città: string;
  cap: string;
  nazione: string;
  provincia_regione: string;
  codice_fiscale: string;
  referente_contatto: string;
  ragione_sociale: string;
  partita_iva: string;
  request_invoice?: boolean;
};
