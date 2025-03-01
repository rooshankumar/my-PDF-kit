import { SEO } from '@/components/shared/SEO';

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About My PDF Kit",
  "description": "Learn about My PDF Kit, our mission, and why we're the best choice for your PDF needs."
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title="About Us | My PDF Kit"
        description="Learn about My PDF Kit, our mission, and why we're the best choice for your PDF needs."
        keywords="about my pdf kit, pdf tools company, online pdf service"
        schema={aboutSchema}
      />
      <h1 className="text-4xl font-bold mb-6">About PDF Kit</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg mb-4">
          PDF Kit is dedicated to providing fast, secure, and efficient image to PDF conversion tools for everyone. 
          Our platform combines cutting-edge technology with user-friendly design to make document conversion seamless and accessible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Fast and reliable image to PDF conversion</li>
          <li>Multiple format support</li>
          <li>Customizable PDF outputs</li>
          <li>Secure file processing</li>
          <li>User-friendly interface</li>
          <li>Free basic conversions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Security First</h3>
            <p>Your files are processed securely and deleted immediately after conversion.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p>Simple drag-and-drop interface with instant conversion.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">High Quality</h3>
            <p>Maintain original image quality in your PDF documents.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Free Service</h3>
            <p>Basic conversions are always free for everyone.</p>
          </div>
        </div>
      </section>
    </div>
  );
}