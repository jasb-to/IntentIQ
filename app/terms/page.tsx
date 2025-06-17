import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">Last Updated: June 6, 2025</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ShadowStack's services, you agree to be bound by these Terms of Service. If you do not
            agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>
            ShadowStack provides cybersecurity monitoring services that scan public sources for mentions of your
            specified keywords and assets. Our service alerts you to potential security threats and breaches related to
            your digital assets.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Subscription and Billing</h2>
          <p>
            ShadowStack offers various subscription tiers with different features and limitations. By subscribing to our
            service, you agree to pay the applicable fees as described on our pricing page. Subscription fees are billed
            in advance on a monthly or annual basis.
          </p>
          <p className="mt-4">
            You may cancel your subscription at any time, but no refunds will be provided for any unused portion of your
            current billing period unless otherwise required by law.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring that your use of our service complies with all applicable laws and regulations</li>
            <li>Providing accurate and complete information when setting up monitoring parameters</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitations of Service</h2>
          <p>
            ShadowStack monitors publicly available sources but cannot guarantee that all potential threats will be
            detected. Our service is provided on an "as is" and "as available" basis without warranties of any kind.
          </p>
          <p className="mt-4">
            We do not guarantee that our service will be uninterrupted, timely, secure, or error-free. We are not
            responsible for any damages resulting from your reliance on information provided by our service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of our service, including but not limited to text, graphics, logos,
            and software, are owned by ShadowStack and are protected by intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, ShadowStack shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including but not limited to loss of profits, data, or business
            opportunities.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our service immediately, without prior notice or
            liability, for any reason, including but not limited to a breach of these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new
            Terms on our website and updating the "Last Updated" date.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
            ShadowStack is established, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            <a href="mailto:legal@shadowstack.com" className="text-primary hover:underline">
              legal@shadowstack.com
            </a>
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
