"use client";

import { useStore } from "@/store/useStore";
import CustomModal from "./customModal";

export default function TermsCondition() {
  const { isTermsOfServiceOpen, setIsTermsOfServiceOpen } = useStore();
  return (
    <CustomModal
      size="lg"
      isOpen={isTermsOfServiceOpen}
      onOpenChange={setIsTermsOfServiceOpen}
    >
      <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="flex flex-row w-full justify-center items-center">
          <h1 className="text-2xl font-bold">Terms of Service</h1>
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
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Sniply ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">2. Description of Service</h2>
            <p>
              Sniply is a URL shortening service that allows users to create
              shortened links to long URLs. The Service provides analytics and
              tracking features for shortened URLs, including click counts,
              visit statistics, and user agent information.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">3. User Accounts</h2>
            <div className="flex flex-col gap-2">
              <p>
                To use certain features of the Service, you must register for an
                account. You agree to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>Maintain and promptly update your account information</li>
                <li>
                  Maintain the security of your password and identification
                </li>
                <li>
                  Accept all responsibility for activities that occur under your
                  account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You agree not to use the Service:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                In any way that violates any applicable federal, state, local,
                or international law or regulation
              </li>
              <li>
                To transmit, or procure the sending of, any advertising or
                promotional material without our prior written consent
              </li>
              <li>
                To impersonate or attempt to impersonate the Company, a Company
                employee, another user, or any other person or entity
              </li>
              <li>
                In any manner that could disable, overburden, damage, or impair
                the Service
              </li>
              <li>
                To use any robot, spider, or other automatic device to access
                the Service for any purpose
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">5. Prohibited Content</h2>
            <p>
              You are prohibited from using the Service to shorten URLs that
              link to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                Illegal content, including but not limited to content that
                violates copyright, trademark, or other intellectual property
                rights
              </li>
              <li>Malicious software, viruses, or malware</li>
              <li>Phishing websites or content designed to deceive users</li>
              <li>
                Content that promotes violence, hate speech, or discrimination
              </li>
              <li>
                Adult content, gambling, or other content that violates
                applicable laws
              </li>
              <li>Spam or unsolicited commercial communications</li>
              <li>
                Content that infringes upon the privacy or rights of others
              </li>
            </ul>
            <p>
              We reserve the right to remove any shortened URL and terminate
              accounts that violate these prohibitions.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by Sniply and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws. You may not modify, reproduce, distribute, create derivative
              works, publicly display, or in any way exploit any of the content,
              software, or materials available on the Service without our prior
              written permission.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">7. Service Availability</h2>
            <p>
              We reserve the right to withdraw or amend the Service, and any
              service or material we provide on the Service, in our sole
              discretion without notice. We will not be liable if, for any
              reason, all or any part of the Service is unavailable at any time
              or for any period. From time to time, we may restrict access to
              some parts of the Service, or the entire Service, to users,
              including registered users.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">8. User Content</h2>
            <p>
              You retain ownership of any URLs you shorten using the Service.
              However, by using the Service, you grant us a worldwide,
              non-exclusive, royalty-free license to use, store, and display the
              shortened URLs and associated analytics data for the purpose of
              providing and improving the Service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">9. Analytics and Data</h2>
            <p>
              The Service collects and stores analytics data related to your
              shortened URLs, including but not limited to click counts, visit
              timestamps, and user agent information. This data is provided to
              you for your use and is also used by us to improve the Service. We
              reserve the right to use aggregated, anonymized data for
              analytical purposes.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              10. Limitation of Liability
            </h2>
            <p>
              In no event will Sniply, its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              11. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
              Sniply and its suppliers and licensors hereby disclaim all
              warranties of any kind, whether express or implied, statutory, or
              otherwise, including but not limited to any warranties of
              merchantability, non-infringement, and fitness for a particular
              purpose.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">12. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms. If you wish to
              terminate your account, you may simply discontinue using the
              Service or contact us to request account deletion.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">13. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion. By continuing to access or use our Service
              after any revisions become effective, you agree to be bound by the
              revised terms.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">14. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the
              jurisdiction in which Sniply operates, without regard to its
              conflict of law provisions. Our failure to enforce any right or
              provision of these Terms will not be considered a waiver of those
              rights.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">15. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us through the support channels provided in the Service.
            </p>
          </section>

          <section className="flex flex-col gap-3 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              By using Sniply, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </CustomModal>
  );
}
