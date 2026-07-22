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
    <LegalLayout title="Impressum" intro="Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).">
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
        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

      <section>
        <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section>
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
          verantwortlich. Spielerstatistiken und verwandte Informationen werden aus öffentlich zugänglichen Quellen
          aggregiert; für deren Richtigkeit und Vollständigkeit übernehmen wir keine Gewähr.
        </p>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
          <a href="/privacy">Datenschutzerklärung</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
