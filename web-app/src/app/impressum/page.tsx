import type { Metadata } from "next"
import { LegalLayout } from "@/components/layout/legal-layout"
import { IMPRESSUM, LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${LEGAL.appName} gemäß § 5 DDG.`,
}

// Legal notice (Impressum) — mandatory in Germany under § 5 DDG and § 18 MStV.
export default function ImpressumPage() {
  return (
    <LegalLayout
      title="Impressum"
      intro={`Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) für die Website und die iOS-/Android-Apps von ${LEGAL.appName}.`}
    >
      <section>
        <h2>Diensteanbieter</h2>
        <p>
          {IMPRESSUM.name}
          <br />
          {IMPRESSUM.street}
          <br />
          {IMPRESSUM.postalCity}
          <br />
          {IMPRESSUM.country}
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${IMPRESSUM.email}`}>{IMPRESSUM.email}</a>
          {IMPRESSUM.phone ? (
            <>
              <br />
              Telefon: {IMPRESSUM.phone}
            </>
          ) : null}
        </p>
      </section>

      {IMPRESSUM.vatId ? (
        <section>
          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {IMPRESSUM.vatId}</p>
        </section>
      ) : null}

      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          {IMPRESSUM.name}
          <br />
          {IMPRESSUM.street}, {IMPRESSUM.postalCity}
        </p>
      </section>

      <section>
        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
        </p>
      </section>

      <section>
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Wir sind
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei
          Bekanntwerden konkreter Rechtsverletzungen entfernen wir die betreffenden Inhalte umgehend.
        </p>
        <p>
          Spielerprofile, Statistiken, Marktwerte und Bilder werden aus öffentlich zugänglichen Quellen
          zusammengeführt. Für deren Richtigkeit, Vollständigkeit und Aktualität übernehmen wir keine Gewähr. Die
          Inhalte dienen der Information und stellen keine Beratung dar.
        </p>
      </section>

      <section>
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für
          diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen
          entfernen wir derartige Links umgehend.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die von uns erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Spielerbilder,
          Vereinslogos und Marken sind Eigentum der jeweiligen Rechteinhaber. Sollten Sie der Ansicht sein, dass
          Inhalte Ihre Rechte verletzen, kontaktieren Sie uns bitte unter{" "}
          <a href={`mailto:${IMPRESSUM.email}`}>{IMPRESSUM.email}</a>. Wir entfernen betroffene Inhalte umgehend.
        </p>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
          <a href="/privacy">Datenschutzerklärung (Privacy Policy)</a> und in der{" "}
          <a href="/cookies">Cookie-Richtlinie</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
