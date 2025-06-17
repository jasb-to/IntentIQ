import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">Last Updated: June 6, 2025</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">30-Day Money-Back Guarantee</h2>
          <p>
            ShadowStack offers a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with our
            service for any reason, you can request a full refund within 30 days of your initial purchase.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Eligibility for Refunds</h2>
          <p>To be eligible for a refund:</p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>The refund request must be made within 30 days of the initial subscription purchase</li>
            <li>The request must be submitted through our official support channels</li>
            <li>You must provide your account information and reason for requesting a refund</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Process</h2>
          <p>
            Once we receive your refund request, our team will review it and process it within 5-7 business days.
            Refunds will be issued to the original payment method used for the purchase.
          </p>
          <p className="mt-4">
            Please note that processing times may vary depending on your payment provider. It may take an additional
            5-10 business days for the refund to appear on your statement.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Exceptions</h2>
          <p>The following situations are not eligible for refunds:</p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Requests made after the 30-day period has expired</li>
            <li>Subscription renewals (only initial purchases are eligible)</li>
            <li>Accounts that have violated our Terms of Service</li>
            <li>Accounts with excessive usage significantly beyond normal patterns</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cancellation Policy</h2>
          <p>
            You may cancel your subscription at any time through your account settings or by contacting our support
            team. When you cancel:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Your subscription will remain active until the end of your current billing period</li>
            <li>You will not be charged for future billing periods</li>
            <li>
              No partial refunds are provided for the unused portion of your current billing period (unless you're
              within the 30-day money-back guarantee period)
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Annual Subscriptions</h2>
          <p>
            For annual subscriptions, the 30-day money-back guarantee applies from the date of purchase. After this
            period, we do not provide prorated refunds for the unused portion of your annual subscription if you decide
            to cancel.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our refund policy or would like to request a refund, please contact our
            support team at:
            <br />
            <a href="mailto:support@shadowstack.com" className="text-primary hover:underline">
              support@shadowstack.com
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
