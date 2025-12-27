"use client";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>

                <p className="mb-6 text-sm text-gray-500">
                    Last updated: December 27, 2025
                </p>

                <div className="space-y-8 text-gray-700">
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Introduction</h2>
                        <p>
                            Welcome to PickMyClasses, a timetable generator for students!

                            We are committed to protecting your privacy and being transparent about how we handle your data.
                            This Privacy Policy explains what information we collect, how we use it, and your rights
                            regarding your personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">What Our App Does</h2>
                        <p>
                            PickMyClasses is a tool that helps students create and manage their class
                            schedules. Users can input their courses, set constraints (such as blocked time slots or
                            course limits), and generate all possible timetable combinations. Optionally, users can export
                            their selected timetable to Google Calendar.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Information We Collect</h2>

                        <h3 className="mb-2 mt-4 text-lg font-medium text-gray-800">Data Stored Locally</h3>
                        <p className="mb-4">
                            All timetable configuration data (course groups, constraints, and preferences) is stored
                            locally in your browser using localStorage. This data never leaves your device unless you
                            choose to export your timetable to Google Calendar.
                        </p>

                        <h3 className="mb-2 mt-4 text-lg font-medium text-gray-800">Google Account Information</h3>
                        <p>
                            If you choose to use the Google Calendar export feature, we request access to your Google
                            account through Google&apos;s OAuth 2.0 authentication. We receive a temporary access token that
                            allows us to create calendar events on your behalf. We do not store your Google credentials,
                            and the access token is used only for the immediate export operation.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Google Calendar Integration &amp; Data Usage</h2>
                        <p className="mb-4">
                            Our App uses the Google Calendar API with the <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">calendar.events</code> scope.
                            We want to be completely transparent about how we use this access:
                        </p>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-green-800">What We DO:</h3>
                            <ul className="list-inside list-disc space-y-2 text-green-700">
                                <li>
                                    <strong>Create new calendar events only:</strong> When you export your timetable, we
                                    create recurring events for each of your classes in a new calendar dedicated to your
                                    timetable. These events only recur for the duration of your academic term, which you define at the time of export.
                                </li>
                                <li>
                                    <strong>Use your access token temporarily:</strong> The access token is used only
                                    during the export process and is not stored on our servers.
                                </li>
                            </ul>
                        </div>

                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="mb-2 text-lg font-semibold text-red-800">What We DO NOT Do:</h3>
                            <ul className="list-inside list-disc space-y-2 text-red-700">
                                <li>
                                    <strong>We never view your existing calendar events.</strong> We have no interest in
                                    your personal schedule, appointments, or any pre-existing calendar data.
                                </li>
                                <li>
                                    <strong>We never delete any calendar events.</strong> We only create new events; we
                                    never modify or remove any existing events from your calendar.
                                </li>
                                <li>
                                    <strong>We never share your data with third parties.</strong> Your calendar
                                    information and timetable data are not sold, shared, or disclosed to anyone.
                                </li>
                                <li>
                                    <strong>We do not store your Google account credentials.</strong> Authentication is
                                    handled entirely by Google&apos;s secure OAuth system.
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Data Storage &amp; Security</h2>
                        <ul className="list-inside list-disc space-y-2">
                            <li>
                                <strong>Local Storage:</strong> Your timetable configuration is stored in your
                                browser&apos;s localStorage. This data remains on your device and is not transmitted to our
                                servers.
                            </li>
                            <li>
                                <strong>No Server-Side Storage:</strong> We do not maintain a database of user
                                information. Each session is independent, and we do not track or store personal data
                                on our servers.
                            </li>
                            <li>
                                <strong>Secure Transmission:</strong> All communication with Google&apos;s APIs occurs over
                                HTTPS, ensuring your data is encrypted in transit.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Rights &amp; Choices</h2>
                        <ul className="list-inside list-disc space-y-2">
                            <li>
                                <strong>Revoke Access:</strong> You can revoke our App&apos;s access to your Google Calendar
                                at any time by visiting your{" "}
                                <a
                                    href="https://myaccount.google.com/permissions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Google Account Permissions
                                </a>.
                            </li>
                            <li>
                                <strong>Clear Local Data:</strong> You can clear your timetable configuration by
                                clearing your browser&apos;s localStorage or using your browser&apos;s privacy settings.
                            </li>
                            <li>
                                <strong>Use Without Google:</strong> The timetable generation feature works entirely
                                without Google integration. Google Calendar export is optional.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Third-Party Services</h2>
                        <p>
                            Our App integrates with Google Calendar through Google&apos;s official APIs. When you use the
                            calendar export feature, you are also subject to{" "}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Google&apos;s Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://policies.google.com/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Terms of Service
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Children&apos;s Privacy</h2>
                        <p>
                            Our App is designed for students of all ages. We do not knowingly collect personal
                            information from children. As noted above, we do not collect or store personal data on
                            our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will be reflected on
                            this page with an updated revision date. We encourage you to review this policy
                            periodically.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Contact Us</h2>
                        <p>
                            If you have any questions or concerns about this Privacy Policy or our data practices,
                            please open an issue on our GitHub repository or contact us through the app.
                        </p>
                    </section>
                </div>

                <div className="mt-12 border-t border-gray-200 pt-8">
                    <a
                        href="/"
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Timetable Generator
                    </a>
                </div>
            </div>
        </div>
    );
}
