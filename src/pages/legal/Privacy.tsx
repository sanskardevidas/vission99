import LegalPage from '../../components/LegalPage';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="21 November 2026">
      <p>
        VISSION99 AQAAR ("we", "us") respects your privacy. This page explains what personal information we collect
        through this website and the partner portal, and how we use it.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Contact details you submit in forms: name, mobile number, email address, budget, country and preferred date.</li>
        <li>Partner account details: name, mobile number and a securely hashed password. We never store your password in plain text.</li>
        <li>Partner activity needed to run the programme, such as site visits, bookings and payment records.</li>
        <li>Basic technical data such as IP address, used for security and abuse prevention.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To respond to consultation and callback requests.</li>
        <li>To create and secure partner accounts, including sending one-time passwords by SMS.</li>
        <li>To manage site visits, bookings, payments and commissions.</li>
        <li>To prevent fraud and meet legal and accounting obligations.</li>
      </ul>
      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We share it only with service providers who help us operate the
        service (for example hosting, database and SMS delivery) and where the law requires it.
      </p>
      <h2>Retention and your choices</h2>
      <p>
        We keep information for as long as needed for the purposes above. You may ask us to access, correct or delete
        your information by contacting us at the address below.
      </p>
    </LegalPage>
  );
}
