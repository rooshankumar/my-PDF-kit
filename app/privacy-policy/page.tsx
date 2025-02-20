import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to PDF Kit. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc list-inside mt-4">
            <li>Identity Data: includes username or similar identifier</li>
            <li>Contact Data: includes email address</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
            <li>Usage Data: includes information about how you use our website and services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc list-inside mt-4">
            <li>To provide our service to you</li>
            <li>To improve our website and services</li>
            <li>To communicate with you about our services</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. File Processing and Storage</h2>
          <p>
            When you use our image to PDF conversion service:
          </p>
          <ul className="list-disc list-inside mt-4">
            <li>Files are processed in your browser when possible</li>
            <li>Files are never permanently stored on our servers</li>
            <li>Any temporary files are automatically deleted after processing</li>
            <li>We do not access or view the contents of your files</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
            Cookies are files with small amount of data which may include an anonymous unique identifier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
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
