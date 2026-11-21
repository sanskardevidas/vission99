import LegalPage from '../../components/LegalPage';

export default function ReraDisclaimer() {
  return (
    <LegalPage title="RERA Disclaimer" updated="21 November 2026">
      <p>
        Under the Real Estate (Regulation and Development) Act, 2016, projects in India must be registered with the
        relevant state Real Estate Regulatory Authority (for Maharashtra, MahaRERA) before they are advertised or sold.
      </p>
      <ul>
        <li>Project information on this website is provided for guidance only and does not constitute an offer.</li>
        <li>Please verify each project's registration number and approved details on the official RERA website before booking.</li>
        <li>Images, walkthroughs and VR tours are indicative and may differ from the final development.</li>
        <li>Prices, availability and possession timelines are subject to change and to the developer's confirmation.</li>
      </ul>
      <p>
        Properties outside India (for example in Dubai or the UK) are governed by the laws and regulators of those
        jurisdictions, not by RERA.
      </p>
    </LegalPage>
  );
}
