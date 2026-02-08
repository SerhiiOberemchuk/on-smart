export type InputsCheckoutStep1 = {
  client_type: "privato" | "azienda";
  email: string;
  numeroTelefono: string;
  nome: string;
  cognome: string;
  indirizzo: string;
  numero_civico: string;
  città: string;
  cap: string;
  nazione: string;
  provincia_regione: string;
  codice_fiscale: string;
  referente_contatto: string;
  ragione_sociale: string;
  partita_iva: string;
  request_invoice?: boolean;
  pec_azzienda: string;
  codice_unico: string;
};
export type InputsCheckoutStep2Consegna = {
  deliveryMethod: "consegna_corriere" | "ritiro_negozio";
  sameAsBilling: boolean;
} & Pick<
  InputsCheckoutStep1,
  | "referente_contatto"
  | "ragione_sociale"
  | "partita_iva"
  | "indirizzo"
  | "città"
  | "cap"
  | "nazione"
  | "provincia_regione"
>;
