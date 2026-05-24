import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-primary text-center">
          Privacy Policy
        </h1>
        <p className="text-sm text-center text-muted-foreground mb-8">
          Last updated: 24 May 2026
        </p>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Who we are</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              This Privacy Policy explains how Rapha Lumina (Pty) Ltd ("we", "us", "our")
              collects and uses your personal information when you visit raphalumina.com
              or buy something from us.
            </p>
            <p className="text-pretty">
              Rapha Lumina is a South African company, registration number
              2024/620336/07, with its registered address at 28 Heide Street,
              Highveld Park, Witbank, 1034.
            </p>
            <p className="text-pretty">
              We take your privacy seriously and we comply with the Protection of
              Personal Information Act 4 of 2013 (POPIA).
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Information Officer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Our Information Officer is Lerato Mogajane. If you have any questions
              about how we handle your personal information, or you want to exercise
              any of the rights set out below, please email{' '}
              <a href="mailto:support@raphalumina.com" className="text-primary underline">
                support@raphalumina.com
              </a>{' '}
              or phone 079 333 0455.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">What we collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We only collect what we need to run the shop and get your order to you.
              The information we typically hold is:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your name and surname</li>
              <li>Your email address</li>
              <li>Your shipping address (street, city, province, postal code, country)</li>
              <li>Your phone number, if you give it to us at checkout</li>
              <li>The details of your orders (products, prices, dates)</li>
              <li>
                Limited technical data your browser sends (IP address, device type,
                pages visited) when you use the site
              </li>
            </ul>
            <p className="text-pretty">
              We do not see or store your full card number, CVV or PIN. Card payments
              are processed by Paystack on their own secure infrastructure. We only
              receive a confirmation that payment was successful or failed, plus a
              reference code.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Why we collect it</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and ship your orders</li>
              <li>Communicate with you about your order (confirmations, shipping updates)</li>
              <li>Answer your questions when you contact us</li>
              <li>Send you marketing emails, but only if you have signed up to our newsletter</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with our legal obligations (for example, keeping records for tax purposes)</li>
            </ul>
            <p className="text-pretty">
              We do not sell your personal information to third parties. Ever.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Who we share it with</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We share the minimum amount of information needed with a small number
              of trusted service providers who help us run the shop:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Paystack</strong> — processes card payments. You provide your
                card details directly to Paystack on their secure checkout. Their
                privacy policy is at paystack.com/privacy.
              </li>
              <li>
                <strong>Supabase</strong> — hosts our database and customer accounts.
                Servers are located in the European Union. See supabase.com/privacy.
              </li>
              <li>
                <strong>Resend</strong> — sends our order confirmation and shipping
                emails on our behalf. See resend.com/legal/privacy-policy.
              </li>
              <li>
                <strong>Cloudflare</strong> — serves the website to your browser and
                protects it from attacks. See cloudflare.com/privacypolicy.
              </li>
              <li>
                <strong>Your courier</strong> — receives your name, address and phone
                number so they can deliver your parcel.
              </li>
            </ul>
            <p className="text-pretty">
              Some of these providers are based outside of South Africa. Where personal
              information leaves South Africa, we make sure the receiving party offers
              an adequate level of protection, as required by POPIA section 72.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">How long we keep it</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We keep order records for at least five years to meet our tax and
              accounting obligations. If you have a customer account, we keep your
              account details for as long as the account is active. You can ask us
              to close your account and delete your data at any time, subject to the
              records we are legally required to retain.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Your rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Under POPIA you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Know what personal information we hold about you</li>
              <li>Ask us to correct anything that is wrong or out of date</li>
              <li>Ask us to delete your information, where we are not required to keep it</li>
              <li>Withdraw consent to marketing emails at any time</li>
              <li>Object to us processing your information</li>
              <li>Complain to the Information Regulator</li>
            </ul>
            <p className="text-pretty">
              To exercise any of these, email{' '}
              <a href="mailto:support@raphalumina.com" className="text-primary underline">
                support@raphalumina.com
              </a>
              . We will respond within a reasonable time, normally within 30 days.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We use a small number of strictly necessary cookies to make the
              website work, for example to keep you signed in and to remember what
              is in your cart. We do not currently use advertising or third-party
              tracking cookies. If we add any in future we will update this policy
              and ask for your consent first.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Children</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Rapha Lumina is not aimed at children under the age of 18. We do not
              knowingly collect personal information from children. If you believe a
              child has provided us with personal information, please contact us so
              we can remove it.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We would prefer to fix any problem ourselves, so please email us first.
              If you are not satisfied with our response, you can lodge a complaint
              with the Information Regulator:
            </p>
            <p className="text-pretty">
              The Information Regulator (South Africa)<br />
              JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001<br />
              Email: complaints.IR@justice.gov.za<br />
              Website: <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-primary underline">inforegulator.org.za</a>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Changes to this policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We may update this policy from time to time. The "Last updated" date
              at the top of the page will tell you when the latest version was
              published. If we make a significant change, we will notify customers
              by email or with a notice on the site.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
