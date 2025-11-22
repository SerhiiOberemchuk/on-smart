import FormFeedback from "@/components/FormFeedback/FormFeedback";
import { Suspense } from "react";

export default function FeedbackFormSection() {
  return (
    <section className="py-8 lg:py-16">
      <div className="container">
        <div className="flex flex-col justify-between gap-8 rounded-sm bg-background p-3 lg:flex-row">
          <header className="max-w-[474px]">
            <h2 className="H2 mb-3">Richiedi una consulenza</h2>
            <p className="text_R">
              Hai una domanda su una collaborazione o desideri effettuare un ordine aziendale?
              <br />
              Contattami tramite questo modulo.
            </p>
          </header>
          <Suspense>
            <FormFeedback type="general-feedback" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
