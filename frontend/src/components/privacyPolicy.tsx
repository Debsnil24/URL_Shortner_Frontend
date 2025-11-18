"use client";

import { useStore } from "@/store/useStore";
import CustomModal from "./customModal";

export default function PrivacyPolicy() {
  const { isPrivacyPolicyOpen, setIsPrivacyPolicyOpen } = useStore();
  return (
    <CustomModal
      size="lg"
      isOpen={isPrivacyPolicyOpen}
      onOpenChange={setIsPrivacyPolicyOpen}
    >
      <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="flex flex-row w-full justify-center items-center">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>

        <div className="flex flex-col gap-4 text-sm leading-relaxed">
          <p className="text-gray-400 text-xs">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">1. Introduction</h2>
            <p>
              At Sniply ("we," "our," or "us"), we are committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our URL
              shortening service. Please read this privacy policy carefully. If
              you do not agree with the terms of this privacy policy, please do
              not access the service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">2. Information We Collect</h2>
            <div className="flex flex-col gap-2">
              <p>We collect information that you provide directly to us:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Account Information:</strong> When you register for an
                  account, we collect your email address, first name, last name,
                  and password. If you sign up using OAuth providers (Google,
                  Apple), we may collect information provided by those services.
                </li>
                <li>
                  <strong>URL Data:</strong> We collect the original URLs you
                  shorten and the shortened URLs we generate for you.
                </li>
                <li>
                  <strong>Analytics Data:</strong> When users click on your
                  shortened URLs, we collect click counts, visit timestamps,
                  user agent information, and other analytics data.
                </li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              3. Automatically Collected Information
            </h2>
            <p>
              When you use our Service, we automatically collect certain
              information about your device and usage patterns, including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Pages you visit and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">4. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Personalize your experience</li>
              <li>Enforce our Terms of Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our Service and store certain information. Cookies are files with
              a small amount of data which may include an anonymous unique
              identifier. You can instruct your browser to refuse all cookies or
              to indicate when a cookie is being sent. However, if you do not
              accept cookies, you may not be able to use some portions of our
              Service.
            </p>
            <p>
              We use both session cookies (which expire when you close your
              browser) and persistent cookies (which stay on your device until
              you delete them or they expire) to provide you with a more
              personalized experience.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">6. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following situations:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Service Providers:</strong> We may share your information
                with third-party service providers who perform services on our
                behalf, such as hosting, data analysis, and customer service.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your
                information if required to do so by law or in response to valid
                requests by public authorities.
              </li>
              <li>
                <strong>Business Transfers:</strong> If we are involved in a
                merger, acquisition, or asset sale, your information may be
                transferred as part of that transaction.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share your information
                with your consent or at your direction.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the Internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
            <p>
              Your account information is protected by a password. It is important
              that you protect against unauthorized access to your account and
              password. We recommend using a strong password and not sharing it
              with anyone.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to
              provide you with our Service and fulfill the purposes described in
              this Privacy Policy. We will also retain and use your information to
              the extent necessary to comply with our legal obligations, resolve
              disputes, and enforce our policies.
            </p>
            <p>
              When you delete your account, we will delete or anonymize your
              personal information, except where we are required to retain it for
              legal purposes.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">9. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to
                another service
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your personal
                information
              </li>
              <li>
                <strong>Restriction:</strong> Request restriction of processing
                of your information
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us through the support
              channels provided in the Service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">10. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under the age of 13. We do
              not knowingly collect personal information from children under 13.
              If you are a parent or guardian and believe your child has provided
              us with personal information, please contact us immediately. If we
              become aware that we have collected personal information from
              children under 13 without verification of parental consent, we will
              take steps to remove that information from our servers.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers
              located outside of your state, province, country, or other
              governmental jurisdiction where data protection laws may differ from
              those in your jurisdiction. By using our Service, you consent to the
              transfer of your information to our facilities and those third
              parties with whom we share it as described in this Privacy Policy.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">12. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites or services
              that are not owned or controlled by Sniply. We have no control over
              and assume no responsibility for the privacy policies or practices
              of any third-party sites or services. We encourage you to review the
              privacy policy of every site you visit.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">13. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date. You are advised to review this
              Privacy Policy periodically for any changes. Changes to this Privacy
              Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">14. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact
              us through the support channels provided in the Service.
            </p>
          </section>

          <section className="flex flex-col gap-3 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              By using Sniply, you acknowledge that you have read and understood
              this Privacy Policy and agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>
        </div>
      </div>
    </CustomModal>
  );
}