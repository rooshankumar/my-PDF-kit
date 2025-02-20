import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PDF Kit, you accept and agree to be bound by the terms and provision of this agreement.
            Additionally, when using this website's specific services, you shall be subject to any posted guidelines or rules
            applicable to such services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            PDF Kit provides an online platform for converting images to PDF format. The service is provided "as is" and on an
            "as available" basis. We reserve the right to modify, suspend or discontinue the service at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Conduct and Responsibilities</h2>
          <p>You agree that you will:</p>
          <ul className="list-disc list-inside mt-4">
            <li>Not use the service for any illegal purposes</li>
            <li>Not upload any malicious files or content</li>
            <li>Not attempt to breach or circumvent our security measures</li>
            <li>Not interfere with the proper working of the service</li>
            <li>Not impose an unreasonable load on our infrastructure</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
          <p>
            The service and its original content, features, and functionality are owned by PDF Kit and are protected by
            international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall PDF Kit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for
            any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits,
            data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or
            use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a
            material change will be determined at our sole discretion. By continuing to access or use our service after those
            revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="list-disc list-inside mt-4">
            <li>By email: isthisroshan@gmail.com</li>
            <li>By visiting our contact page</li>
            <li>Connect on <a href="https://www.linkedin.com/in/roshaankumar/" className="text-blue-500 hover:text-blue-600">LinkedIn</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
