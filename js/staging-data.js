/* Staging release checklist data.
   Build under test: origin/staging @ 8d80ea63 (2026-11-10).
   Placeholders such as <staging-host> are intentional. */
window.STAGING_DATA = {
  meta: {
    title: "Staging release",
    build: "origin/staging @ 8d80ea63",
    date: "2026-11-10",
    note: "Built against the release diff main...origin/staging. Replace the staging URL, build SHA and test accounts before execution."
  },
  accounts: [
    { id: "A1", role: "Owner", company: "Company A", notes: "Full modules, receipts/SAR/petty cash enabled, website published" },
    { id: "A2", role: "Manager", company: "Company A", notes: "Full operational access" },
    { id: "A3", role: "Elevated staff", company: "Company A", notes: "booking_write_all, customer_full, calendar_write_all" },
    { id: "A4", role: "Limited staff", company: "Company A", notes: "booking_read_own, customer_partial, customers module hidden" },
    { id: "A5", role: "Reception", company: "Company A", notes: "Reception landing/metrics" },
    { id: "A6", role: "Owner", company: "Company B", notes: "Cross-company isolation tests" },
    { id: "C1", role: "Linked customer", company: "Company A", notes: "Has user_uid" },
    { id: "C2", role: "Guest customer", company: "Company A", notes: "Empty user_uid" }
  ],
  dataNeeds: [
    "60+ bookings across all statuses and dates, including 2 confirmed future, 1 paid future, 1 completed past, 1 pay-later future, 1 pending-payment future, 1 cancelled, 1 no-show, 1 draft and 1 confirmed but trashed.",
    "2 services, 2 staff and 2 categories.",
    "1 active deal and 1 expired deal.",
    "1 future confirmed booking linked to a service, a staff member and a customer.",
    "Inbox access for owner and customer emails.",
    "Firebase console read access for companies/{companyId}.booking_counts, companies/{companyId}.booking_month_counts and suppressed_phones/{E.164}."
  ],
  executionOrder: [
    "Read-only smoke and role checks.",
    "Snapshot booking counts before mutations.",
    "Run counts and pagination tests.",
    "Run create/edit booking tests.",
    "Run trash and SMS tests.",
    "Restore data and re-check counts.",
    "Run backfill only on a dedicated company or after snapshot."
  ],
  signoff: [
    "Staging build SHA verified as 8d80ea63 or later release candidate.",
    "All 22 Critical cases pass.",
    "All Medium failures triaged with ticket and owner.",
    "Role matrix tested: owner, manager, elevated staff, limited staff, reception.",
    "Cross-company isolation verified.",
    "Language switching, persistence and fallback verified.",
    "Arabic RTL verified desktop and mobile.",
    "Ethiopia-only language gating verified.",
    "Email verification and reset flows verified, including expired/used/invalid.",
    "Booking counts reconciled before and after mutations.",
    "Backfill run twice with identical results.",
    "Trash blocks, warnings, badges and restore verified.",
    "Service blocks and staff-hours rules verified.",
    "SMS suppression documents verified.",
    "Inventory webhook validation verified.",
    "Website support contact privacy verified.",
    "No unexpected console errors or 5xx responses.",
    "Performance thresholds met.",
    "Known limitations documented in release notes.",
    "QA sign-off name/date.",
    "Product sign-off name/date.",
    "Engineering sign-off name/date."
  ],
  limitations: [
    "Staging URL and credentials are not in the repo; fill them in before execution.",
    "Jev search depends on the Nest/JEV backend. If it is down, mark the case Blocked, not Failed.",
    "Ethiopia IP gating requires a VPN or a controlled /api/ip override; do not test it only from one location.",
    "Email flows require inbox access and staging email delivery.",
    "Booking counts and SMS suppression verification needs Firebase console read access; otherwise use API/debug output.",
    "Backfill may require a developer to trigger the route.",
    "Payments, SMS and receipts must be in test mode; do not use real cards or phone numbers.",
    "WordPress/Nest booking paths require the linked test site.",
    "Some UI copy may differ from this script; assert behavior and log copy differences as Medium defects."
  ],
  cases: [
    {
      id: "C-01", group: "Critical", module: "Auth & portal", priority: "Critical",
      check: "Login, portal and company switching",
      pre: "A1 and A4 exist.",
      steps: [
        "Open https://<staging-host>/login.",
        "Log in as A1.",
        "Confirm landing on /portal or /dashboard.",
        "Switch to Company B from the portal.",
        "Log out.",
        "Log in as A4."
      ],
      expected: "Login succeeds without console errors.\nCorrect company name and data appear; no flash of another company's data.\nCompany switch updates sidebar, bookings and settings context.\nLogout clears the session; protected routes redirect to login.\nLimited staff lands on an allowed page, not a blank dashboard."
    },
    {
      id: "C-02", group: "Critical", module: "Auth & email", priority: "Critical",
      check: "Email verification link succeeds",
      pre: "Unverified test user, inbox access, business app open in one tab.",
      steps: [
        "Trigger the verification email from signup or the verification banner.",
        "Open the email link in the same browser.",
        "Confirm the page is /auth/action?mode=verifyEmail&oobCode=...&continueUrl=....",
        "Click the verify/continue action.",
        "Check Firebase Auth that emailVerified is true."
      ],
      expected: "Verification screen shows a clear success state.\nContinue goes only to the allowlisted app URL.\nIf a business tab is already open, that tab is focused instead of creating a duplicate flow.\nIf no business tab is open, a Continue button is shown.\nlang=en or lang=sv is respected; no raw translation keys."
    },
    {
      id: "C-03", group: "Critical", module: "Auth & email", priority: "Critical",
      check: "Email verification expired, used and invalid links",
      steps: [
        "Open the same verification link a second time.",
        "Use an old/expired verification link.",
        "Modify one character in oobCode and open it."
      ],
      expected: "Second use shows a used/invalid state, not a crash.\nExpired link shows an expired state with a way to request a new email.\nTampered code shows an invalid state.\nBack to login works in all three states.\nNo user is verified by an invalid or reused link."
    },
    {
      id: "C-04", group: "Critical", module: "Auth & email", priority: "Critical",
      check: "Password reset success and validation",
      steps: [
        "Go to /forgot-password.",
        "Request a reset email and open the link.",
        "Enter a password shorter than 8 characters.",
        "Enter two different passwords.",
        "Enter a valid password twice and submit.",
        "Log in with the new password, then try the old password."
      ],
      expected: "Short password shows an inline minimum-length error.\nMismatched passwords show a confirmation error.\nValid reset shows success and redirects to login.\nNew password works; old password fails.\nNo automatic login unless explicitly designed; no raw error codes shown to the user."
    },
    {
      id: "C-05", group: "Critical", module: "Auth & email", priority: "Critical",
      check: "Password reset expired, used and unsafe continue URL",
      steps: [
        "Reuse the reset link.",
        "Use an expired reset link.",
        "Tamper with oobCode.",
        "Open a reset link with continueUrl=https://evil.example.com.",
        "Open one with continueUrl=https://business.aspio.io/... and one with a staging *.vercel.app URL."
      ],
      expected: "Reused link shows used/invalid state.\nExpired link shows expired state.\nTampered code shows invalid state.\nNon-allowlisted continue URL is ignored or blocked; user stays on the app domain.\nAllowlisted URLs continue correctly.\nNo open redirect."
    },
    {
      id: "C-06", group: "Critical", module: "Jev search", priority: "Critical",
      check: "Jev Cmd/Ctrl+K search and deep links",
      pre: "A1, Company A with customers, services and bookings.",
      steps: [
        "Open /dashboard.",
        "Press Ctrl+K on Windows or Cmd+K on macOS.",
        "Type an exact customer name.",
        "Select the customer result.",
        "Reopen the palette and type an intent such as create booking for Anna tomorrow 14:00.",
        "Try an ambiguous intent such as edit service.",
        "Press Esc.",
        "Navigate to /dashboard/calendar and press the shortcut again."
      ],
      expected: "Palette opens with the input focused.\nResults are grouped by type: customers, services, bookings, settings.\nSelecting a customer navigates to the correct module and opens the record; URL contains the identifier.\nIntent query either opens Add Booking prefilled or shows an entity pick list when ambiguous.\nBack button returns to the previous page.\nEsc closes the palette and restores focus.\nCalendar hides the trigger and does not open the palette."
    },
    {
      id: "C-07", group: "Critical", module: "Jev search", priority: "Critical",
      check: "Jev authentication, tenant isolation and kill switch",
      steps: [
        "Call POST /api/search/jev without an Authorization header.",
        "Log in as A6 (Company B) and request results for Company A's companyId.",
        "On a preview deploy with NEXT_PUBLIC_JEV_SEARCH_ENABLED=false, reload the dashboard.",
        "Search for a customer that exists only in Company B while logged into Company A."
      ],
      expected: "No token returns 401.\nCross-company request returns 403 or empty result; never returns Company A data.\nDisabled flag hides the trigger and the proxy returns 404.\nResults never include other companies' customers, services or bookings.\nJEV API key and service secret never appear in browser network payloads."
    },
    {
      id: "C-08", group: "Critical", module: "Localization", priority: "Critical",
      check: "New language switching, persistence and fallback",
      steps: [
        "Open the language switcher.",
        "Switch to Spanish, then Hindi, Italian, Turkish and Somali.",
        "Reload after each switch.",
        "Log out and log back in.",
        "Open a page likely to have missing keys in a new language."
      ],
      expected: "All 8 global languages are listed: English, Swedish, Somali, Turkish, Arabic, Spanish, Hindi, Italian.\nUI strings change to the selected language.\nSelection persists across reload and re-login.\nMissing keys fall back to English, then Swedish; no raw keys such as settingsPage.title appear.\nFirst visit without a saved choice defaults to Swedish.\nAuth pages also respect the selected language."
    },
    {
      id: "C-09", group: "Critical", module: "Localization", priority: "Critical",
      check: "Arabic RTL layout",
      steps: [
        "Switch to العربية.",
        "Inspect document.documentElement.dir.",
        "Open bookings list, Add Booking, Settings and the Jev palette.",
        "Repeat at 1280px and 390px width.",
        "Switch back to English."
      ],
      expected: "dir=\"rtl\" is applied.\nSidebar, forms, dialogs, tables and icons mirror correctly.\nText aligns right; inputs accept Arabic and Latin text.\nNo horizontal overflow, clipped buttons or overlapping labels.\nDates and numbers use the Arabic locale.\nSwitching back restores LTR without a reload."
    },
    {
      id: "C-10", group: "Critical", module: "Localization", priority: "Critical",
      check: "Ethiopia-only Amharic and Tigrinya gating",
      steps: [
        "With a non-Ethiopia IP/VPN, open the language switcher.",
        "With an Ethiopia IP/VPN, reload and open the switcher.",
        "Select Amharic, then reload from a non-Ethiopia IP.",
        "Check Amharic and Tigrinya script rendering."
      ],
      expected: "Non-Ethiopia: Amharic and Tigrinya are absent.\nEthiopia: both appear alongside the global languages.\nPreviously selected Amharic/Tigrinya falls back to an available language when outside Ethiopia; no blank UI.\nScripts render correctly with no missing-glyph boxes."
    },
    {
      id: "C-11", group: "Critical", module: "Bookings", priority: "Critical",
      check: "Booking tab counts are accurate",
      pre: "Fixture from the test data section.",
      steps: [
        "Open /dashboard/bookings.",
        "Record the count on each tab.",
        "Compare with the visible rows and Firestore booking_counts.",
        "Open the trashed booking and confirm it is excluded.",
        "Open the draft and confirm it appears in All and Drafts only.",
        "Check the month badge for the fixture month."
      ],
      expected: "All includes non-trashed drafts and excludes trashed rows.\nConfirmed includes confirmed, paid and completed.\nPay later includes pay-later, pending-payment and pending.\nDrafts includes the draft only.\nCancelled and no-show rows appear in All and their filter tabs.\nMonth count excludes drafts, includes cancelled/no-show and excludes trashed bookings.\nTrash wins over every status.\nCounts do not flicker to zero when switching tabs."
    },
    {
      id: "C-12", group: "Critical", module: "Bookings", priority: "Critical",
      check: "Booking pagination, search and empty-result caching",
      steps: [
        "Open All with more than one page of bookings.",
        "Go to page 2 and back.",
        "Search a customer prefix of 1-3 characters.",
        "Search a full two-word name such as Anna Berg.",
        "Paste a query longer than 15 characters.",
        "Search a name with no results, then create a matching booking and search again.",
        "Clear the search."
      ],
      expected: "Pagination shows no duplicates or missing rows.\nPage size control works and resets to page 1 on a new search.\nSearch is debounced (~0.5s) and sends one request per settled query.\nPrefix is capped at 15 characters.\nTwo-word query matches first name + last name.\nEmpty results are not cached; the newly created booking appears on the next search.\nClearing search restores the full list."
    },
    {
      id: "C-13", group: "Critical", module: "Bookings", priority: "Critical",
      check: "Booking counts backfill and live increments",
      pre: "Company with booking_counts_backfilled missing. Dev support may be needed to trigger the route.",
      steps: [
        "Snapshot current rows and manually count them.",
        "Trigger backfill via the in-app control if present, or POST /api/bookings/backfill-counts with an owner token.",
        "Check booking_counts and booking_counts_backfilled.",
        "Run backfill a second time.",
        "Create a confirmed booking.",
        "Trash it.",
        "Restore it.",
        "Create a booking through a WordPress/Nest path if available."
      ],
      expected: "Backfill writes counts matching the manual count and sets booking_counts_backfilled: true.\nSecond run produces identical values; no double increment.\nNew booking increments All and Confirmed.\nTrash decrements; restore re-increments.\nWordPress/Nest booking also updates counts through the trigger.\nNo false is written to the backfill stamp."
    },
    {
      id: "C-14", group: "Critical", module: "Bookings", priority: "Critical",
      check: "Create and edit booking: draft to publish",
      steps: [
        "Bookings -> Add booking.",
        "On Client, search an existing customer and try to proceed with required fields empty.",
        "On Service & Staff, choose service, staff, date and time; add a second service.",
        "On Total, verify the sum and apply a discount if available.",
        "On Notes, save as draft.",
        "Reopen the draft and publish it.",
        "Edit the time and status.",
        "Attempt an overlapping booking for the same staff and time."
      ],
      expected: "Required-field validation blocks progression with a clear message.\nCustomer name/email/phone fields are not overwritten by browser autofill.\nUnavailable slots are disabled.\nTotal updates when services or discounts change.\nDraft appears in Drafts and All, not Confirmed.\nPublish creates a confirmed booking, updates counts and appears on the calendar.\nEditing updates counts and calendar.\nOverlap is blocked with a clear conflict message."
    },
    {
      id: "C-15", group: "Critical", module: "Trash", priority: "Critical",
      check: "Upcoming booking cannot be trashed",
      steps: [
        "Create a future confirmed booking.",
        "Open the row menu -> Delete / Move to trash.",
        "Observe the result.",
        "Change the booking to Cancelled or No-show.",
        "Try trashing again."
      ],
      expected: "Upcoming booking is blocked with the message: Cannot move to trash: cancel or mark as no-show before trashing an upcoming booking.\nBooking remains unchanged after the block.\nAfter cancelling/no-show, trashing succeeds and the booking appears in booking trash.\nCounts decrement correctly.\nPast completed bookings can be trashed."
    },
    {
      id: "C-16", group: "Critical", module: "Trash", priority: "Critical",
      check: "Linked service, staff and customer trash warnings",
      steps: [
        "Open a service with a future booking -> Delete.",
        "Confirm the warning lists the linked upcoming booking.",
        "Proceed with trashing.",
        "Open the booking and inspect the service name.",
        "Repeat for a staff member with a future booking.",
        "Repeat for a customer with a future booking.",
        "Link a service to an active deal and try to delete it.",
        "Expire the deal and try again.",
        "Permanently delete the trashed service and inspect the booking again."
      ],
      expected: "Service/staff/customer with an upcoming booking shows a warning and can be trashed after confirmation.\nBooking remains functional and shows a deleted/trashed badge for the linked record.\nActive deal blocks deletion with: Cannot delete: item is linked to a deal that has not expired.\nAfter the deal expires, deletion is allowed.\nPermanent delete changes the badge to deleted without breaking the booking view."
    },
    {
      id: "C-17", group: "Critical", module: "Trash", priority: "Critical",
      check: "Category with active services is blocked",
      steps: [
        "Open a category that has at least one active service -> Delete.",
        "Move the service to another category, or trash the service.",
        "Delete the category again.",
        "Restore the category and service."
      ],
      expected: "First attempt is blocked: Cannot delete: active services are still assigned to this category.\nAfter services are moved or trashed, the category can be trashed.\nRestore preserves the category-service link.\nNo orphaned service category IDs."
    },
    {
      id: "C-18", group: "Critical", module: "Services & staff", priority: "Critical",
      check: "Service blocks with multiple staff",
      steps: [
        "Services -> edit a service -> Block service.",
        "Save with no staff selected.",
        "Select two staff and a valid date/time range -> save.",
        "Create an overlapping block for one of the same staff.",
        "Set end time before start time.",
        "Open the calendar for both staff.",
        "Delete one block."
      ],
      expected: "No staff -> validation error.\nTwo staff -> two block rows, one per staff.\nOverlap for the same staff -> error.\nEnd before start -> error.\nCalendar shows both staff unavailable for the block.\nBooking creation inside the block is prevented.\nDeleting one block leaves the other intact."
    },
    {
      id: "C-19", group: "Critical", module: "Customers & SMS", priority: "Critical",
      check: "SMS preference suppression",
      pre: "Customer with a phone number; SMS logs or emulator access.",
      steps: [
        "Open customer detail -> SMS section.",
        "Confirm all switches are on when fields are missing/null.",
        "Turn off Reminder and save.",
        "Check suppressed_phones/{E.164}.",
        "Turn it back on and save.",
        "Repeat with a guest customer (empty user_uid).",
        "Trigger a reminder for a booking.",
        "Save a conflicting preference for the same phone from another customer."
      ],
      expected: "Missing/null fields display as ON.\nOnly explicit false disables a channel.\nSaving writes the six preferences to suppressed_phones/{E.164}, including for guest customers.\nReminder is not sent for the disabled channel; other channels still send.\nLatest save for the same phone wins.\nNo duplicate suppression documents for the same normalized phone."
    },
    {
      id: "C-20", group: "Critical", module: "Settings", priority: "Critical",
      check: "Company name uniqueness",
      steps: [
        "Settings -> Edit company info.",
        "Change the name to an existing company's name with different case and spacing.",
        "Try to save.",
        "Change to a unique name and save.",
        "Re-enter your own name with different case.",
        "Open two tabs, set the same new name in both, and save both."
      ],
      expected: "Existing name -> inline already in use error; no write.\nUnique name -> saves and updates portal/sidebar.\nOwn name with different case -> allowed.\nRace: one save succeeds, the other gets a conflict; no duplicate lookup records."
    },
    {
      id: "C-21", group: "Critical", module: "Settings & inventory", priority: "Critical",
      check: "Inventory webhook and API endpoint validation",
      steps: [
        "Settings -> Advanced settings -> Inventory.",
        "Try these webhook URLs one at a time:\nhttp://example.com/hook\nhttps://localhost/hook\nhttps://127.0.0.1/hook\nhttps://169.254.169.254/hook\nhttps://metadata.google.internal/hook\nhttps://foo.local/hook\nhttps://10.0.0.5/hook\nhttps://192.168.1.10/hook\nhttps://172.16.0.1/hook\nnot-a-url\nhttps://example.com/hook",
        "Save a valid URL and reload.",
        "Inspect secret fields.",
        "Leave the masked secret unchanged and save.",
        "Enter a new secret and save.",
        "Repeat the same checks for the API endpoint field."
      ],
      expected: "HTTP -> HTTPS required error.\nLocalhost, metadata hosts, .local, .internal and private IPv4 -> blocked-host error.\nInvalid string -> invalid URL error.\nValid HTTPS URL saves.\nSecrets are masked after save.\nSaving a masked secret unchanged does not overwrite it.\nEntering a new secret updates it.\nAPI endpoint follows the same rules."
    },
    {
      id: "C-22", group: "Critical", module: "Website", priority: "Critical",
      check: "Website support contact privacy",
      pre: "Signup email differs from support email; both phone fields exist.",
      steps: [
        "Settings -> Edit company info -> Support Information: signup email owner@example.com, support email support@example.com, signup phone +46 111, support phone +46 222.",
        "Publish the website.",
        "Open the public website footer/contact page.",
        "View page source and network payloads.",
        "Set hide_email_on_website=true and publish.",
        "Set it to false, then delete the support email, and publish each time.",
        "In the website editor, edit the footer support email and save/publish.",
        "Repeat with the phone fields."
      ],
      expected: "Public site shows only support@example.com and +46 222.\nSignup email and phone never appear in the DOM or API payload.\nHide flag works only when exactly true; false, null or missing shows the value.\nDeleting support email shows nothing; it does not fall back to signup email.\nEditor edits update company support fields only after Save/Publish.\nCancel leaves company fields unchanged."
    },

    {
      id: "M-01", group: "Medium", module: "Staff", priority: "Medium",
      check: "Staff hours follow company schedule",
      steps: [
        "Staff -> edit a staff member -> Hours.",
        "With availability_source = company, try setting 07:00 outside company hours 09:00-17:00.",
        "Save and reload.",
        "Switch to custom and set 07:00.",
        "Change company hours and re-check both staff."
      ],
      expected: "Company-follow staff times are clamped or blocked outside company hours.\nCustom staff can keep outside-company hours.\nReload preserves the source and times.\nBooking availability matches the resolved schedule.\nCompany hours changes propagate to company-follow staff only."
    },
    {
      id: "M-02", group: "Medium", module: "Calendar", priority: "Medium",
      check: "Calendar views, month counts and timezone",
      steps: [
        "Open /dashboard/calendar.",
        "Check month, week and day views.",
        "Compare month badges with bookings.",
        "Create a booking from an empty slot.",
        "Use Block time.",
        "Test bookings at 23:30 and 00:30 around a month boundary.",
        "Log in as limited staff and check the staff filter."
      ],
      expected: "Views render without console errors.\nMonth badges exclude drafts and trashed bookings; include cancelled/no-show.\nSlot click opens Add Booking prefilled with date/time/staff.\nBlock time appears on the calendar.\nBookings land on the correct day in Europe/Stockholm.\nLimited staff sees only own calendar; manager sees all.\nJev is hidden on calendar."
    },
    {
      id: "M-03", group: "Medium", module: "Customers", priority: "Medium",
      check: "Customer search optimization",
      steps: [
        "Open /dashboard/customers.",
        "Search 1 character, then 2-3 characters.",
        "Search by email and phone.",
        "Search a two-word full name.",
        "Paste a prefix longer than 15 characters.",
        "Search a missing name, create that customer, and search again.",
        "Repeat as limited staff."
      ],
      expected: "Prefix matching is case-insensitive.\nDebounce produces one request per settled query.\nTwo-word query matches first + last name.\nEmail/phone derived entries work.\nEmpty results are not cached.\nLimited staff gets partial results only; no full customer list leak."
    },
    {
      id: "M-04", group: "Medium", module: "Customers", priority: "Medium",
      check: "Customer fields resist browser autofill",
      steps: [
        "In Chrome with saved addresses, open Add Booking -> Client.",
        "Focus name, email and phone fields.",
        "Select a browser autofill suggestion.",
        "Repeat on Add Customer."
      ],
      expected: "Browser autofill does not overwrite the customer fields.\nManually entered values persist.\nNo hidden autofill dropdown covers the form.\nValidation still works after autofill attempts."
    },
    {
      id: "M-05", group: "Medium", module: "Trash", priority: "Medium",
      check: "Trash pagination, search and restore",
      steps: [
        "Trash more than one page of services, staff, customers and discounts.",
        "Open each trash view and go to page 2.",
        "Search a deleted item.",
        "Restore one item.",
        "Permanently delete one item.",
        "Use Empty Trash and cancel, then confirm."
      ],
      expected: "Pagination has no duplicates or missing rows.\nSearch finds deleted items by name.\nRestore returns the item to its module and clears the deleted badge.\nPermanent delete removes it and updates linked badges.\nEmpty Trash requires confirmation; Cancel does nothing.\nCounts update after each action."
    },
    {
      id: "M-06", group: "Medium", module: "Trash", priority: "Medium",
      check: "Booking trash pagination and search",
      steps: [
        "Trash more than one page of bookings.",
        "Paginate and search by customer/booking ID.",
        "Restore a booking.",
        "Permanently delete another."
      ],
      expected: "Pagination and search work.\nRestore returns the booking to its correct tab and updates counts.\nPermanent delete does not leave orphaned references.\nUpcoming bookings never appear in trash."
    },
    {
      id: "M-07", group: "Medium", module: "Website", priority: "Medium",
      check: "Website image compression",
      steps: [
        "Open /website-edit.",
        "Upload an 8-12 MB JPEG to a hero/gallery section.",
        "Upload a large PNG and a logo.",
        "Inspect the uploaded asset size and dimensions in DevTools/network.",
        "Replace an image and publish.",
        "Try an unsupported file type."
      ],
      expected: "Upload succeeds within a reasonable time.\nStored image is materially smaller than the source with acceptable visual quality.\nDimensions are capped appropriately; no stretched images.\nReplacing an image updates the published site.\nUnsupported types show a clear error.\nIf no compression is observable, log source vs stored size as a defect."
    },
    {
      id: "M-08", group: "Medium", module: "Website", priority: "Medium",
      check: "Hide support flags: exact-true behavior",
      steps: [
        "In Firestore, set hide_email_on_website to missing, null, false, then true.",
        "Publish and check the public site each time.",
        "Repeat for hide_phone_on_website."
      ],
      expected: "Only boolean true hides the value.\nMissing, null and false all show the value.\nChanges require publish/refresh to appear publicly.\nNo fallback to signup contact fields."
    },
    {
      id: "M-09", group: "Medium", module: "Website", priority: "Medium",
      check: "Website editor save, preview and publish",
      steps: [
        "Edit Home, About, Services and Contact.",
        "Navigate away with unsaved changes.",
        "Use Preview.",
        "Publish.",
        "Edit footer support contact and social links.",
        "Publish and inspect the public site."
      ],
      expected: "Unsaved-changes prompt appears.\nPreview shows staged changes without affecting the public site.\nPublish updates the public site.\nSupport contact and social links sync correctly.\nNo stale content after hard refresh."
    },
    {
      id: "M-10", group: "Medium", module: "Reviews", priority: "Medium",
      check: "Reviews after completed booking",
      steps: [
        "Complete a booking.",
        "Use Ask for review from the booking row.",
        "Open the review link as the customer.",
        "Submit rating and comment.",
        "Request a review again for the same booking.",
        "Open an expired/invalid review link."
      ],
      expected: "Review request sends once; duplicate request is blocked with a clear message.\nReview form validates rating and comment.\nSubmitted review appears in /dashboard/reviews with booking/customer/staff.\nInvalid/expired link shows a friendly error.\nOwner reply works if enabled."
    },
    {
      id: "M-11", group: "Medium", module: "Reviews & SAR", priority: "Medium",
      check: "Staff reviews and SAR",
      steps: [
        "Open /dashboard/staff-reviews; filter by staff and date.",
        "Compare averages with submitted reviews.",
        "Open /dashboard/sar; change period.",
        "Log in as staff with SAR access, then without.",
        "Disable SAR in Advanced settings."
      ],
      expected: "Staff review filters and averages are correct.\nSAR totals match bookings/payments for the period.\nStaff with SAR role sees permitted data; others are blocked.\nDisabling SAR hides the sidebar item and direct route returns NotFound.\nRe-enabling restores access."
    },
    {
      id: "M-12", group: "Medium", module: "Receipts & petty cash", priority: "Medium",
      check: "Receipts and petty cash toggles",
      steps: [
        "Enable receipts in Advanced settings.",
        "Create a receipt from a payment/booking; download and email it.",
        "Disable receipts.",
        "Enable petty cash; add an expense with a receipt image.",
        "Edit and delete the expense."
      ],
      expected: "Receipts module appears when enabled; PDF downloads and emails correctly.\nDisabling hides the sidebar item and direct route returns NotFound.\nPetty cash balance updates on add/edit/delete.\nReceipt attachment uploads and previews.\nRole restrictions are enforced."
    },
    {
      id: "M-13", group: "Medium", module: "Payments & deals", priority: "Medium",
      check: "Payments and deal linkage",
      steps: [
        "Record a full payment and a partial payment.",
        "Check booking status and balance.",
        "Create an active deal linked to a service.",
        "Try trashing the service.",
        "Expire the deal and retry.",
        "Open the deal detail page."
      ],
      expected: "Payments update balance/status correctly.\nReceipt can be generated from the payment.\nActive deal blocks service deletion.\nExpired deal allows deletion.\nDeal detail shows linked services/staff and status."
    },
    {
      id: "M-14", group: "Medium", module: "Journal", priority: "Medium",
      check: "Journal access",
      steps: [
        "As staff, request journal access.",
        "As owner, approve the request.",
        "Create, edit and delete a journal entry.",
        "Revoke access and retry."
      ],
      expected: "Request appears to the owner.\nApproved staff can access journal; unapproved staff cannot.\nEntries save and persist.\nRevoked access blocks the module and direct route.\nNo cross-company journal data."
    },
    {
      id: "M-15", group: "Medium", module: "Loyalty & discounts", priority: "Medium",
      check: "Loyalty and discounts",
      steps: [
        "Add a loyalty stamp to a customer.",
        "Complete a booking and check auto-stamp.",
        "Try adding the same stamp twice.",
        "Test phone formats +46... and 0....",
        "Create a discount campaign and apply it to a booking.",
        "Exceed the usage limit and test an expired campaign.",
        "Trash the discount."
      ],
      expected: "Stamp balance updates correctly.\nAuto-stamp triggers once per completed booking.\nDuplicate stamp is prevented.\nPhone normalization links to the same customer.\nDiscount applies and respects limits/expiry.\nTrash follows the normal warning rules."
    },
    {
      id: "M-16", group: "Medium", module: "Plans", priority: "Medium",
      check: "Plans and booking limits",
      steps: [
        "Open /dashboard/plans.",
        "Check current plan and limits.",
        "Create bookings up to the limit.",
        "Exceed the limit.",
        "Click the upgrade CTA."
      ],
      expected: "Plan page loads with correct current plan.\nBooking limit modal appears at the limit.\nUpgrade CTA routes correctly.\nNo console errors or stale plan data after switching companies."
    },
    {
      id: "M-17", group: "Medium", module: "AI Studio & Academy", priority: "Medium",
      check: "AI Studio and Academy flags",
      steps: [
        "Open /dashboard/ai-studio with the feature enabled.",
        "Generate content and test an invalid/quota-limited request.",
        "Disable the feature and reload.",
        "Open /dashboard/academy; browse catalog and open a lesson."
      ],
      expected: "AI Studio generates output when enabled.\nQuota/validation errors are user-friendly.\nDisabled feature hides the sidebar item and route.\nAcademy catalog and lessons load for permitted users.\nStaff without roles are blocked."
    },
    {
      id: "M-18", group: "Medium", module: "Portal", priority: "Medium",
      check: "Portal performance and company switching",
      steps: [
        "Open /portal with several companies.",
        "Measure load time.",
        "Switch companies repeatedly.",
        "Refresh the page.",
        "Open a deep link to Company B while logged into Company A."
      ],
      expected: "Portal loads in under ~2 seconds on staging.\nCompany switch updates all modules; no stale Company A data.\nRefresh preserves the selected company.\nDeep link either switches context safely or shows access denied.\nNo duplicate company cards or flicker."
    },
    {
      id: "M-19", group: "Medium", module: "Roles & privacy", priority: "Medium",
      check: "Limited staff privacy and counts",
      steps: [
        "Log in as A4.",
        "Check sidebar modules.",
        "Open /dashboard/bookings.",
        "Directly open /dashboard/customers.",
        "Compare tab counts with visible rows.",
        "Open Jev and search a customer."
      ],
      expected: "Only allowed modules appear.\nDirect customer URL redirects or returns NotFound.\nBookings show only own/all permitted rows.\nCustomer names are masked and phones show -.\nCounts are computed from rows, not stale stored counts.\nJev results respect the same restrictions."
    },
    {
      id: "M-20", group: "Medium", module: "Notifications", priority: "Medium",
      check: "Notifications",
      steps: [
        "Create/update a booking as another user.",
        "Check the bell as owner and as staff.",
        "Mark notifications read.",
        "Log in as staff without notification permission."
      ],
      expected: "Bell updates in near real time.\nMark-read persists.\nStaff without permission does not see the bell.\nNo cross-company notifications.\nClicking a notification opens the correct record."
    },
    {
      id: "M-21", group: "Medium", module: "Email", priority: "Medium",
      check: "Booking emails and locale",
      steps: [
        "Create and cancel a booking for a Swedish customer.",
        "Repeat for an English customer and a guest customer.",
        "Check owner and staff emails.",
        "Open the add-to-calendar links for Google, Outlook and Apple.",
        "Check verification and reset emails."
      ],
      expected: "Emails use the customer's locale; guest defaults to Swedish.\nConfirmation and cancellation content is correct.\nOwner/staff recipients are correct.\nAdd-to-calendar links open the right event.\nNo PII leak to the wrong recipient.\nLinks point to staging and pass the continue-URL allowlist."
    },
    {
      id: "M-22", group: "Medium", module: "Website", priority: "Medium",
      check: "Social links in website editor",
      steps: [
        "Add Instagram, Facebook and TikTok links.",
        "Enter an invalid URL.",
        "Publish.",
        "Click each icon on the public site.",
        "Remove one link and publish."
      ],
      expected: "Valid links save and open correctly.\nInvalid URL shows validation.\nEmpty links are hidden, not rendered as dead icons.\nPublish updates the public site."
    },
    {
      id: "M-23", group: "Medium", module: "Calendar", priority: "Medium",
      check: "Google Calendar connection",
      steps: [
        "Settings -> Notifications/Calendar -> Connect Google Calendar.",
        "Complete consent.",
        "Check connected status and disconnect.",
        "Test a staff account without a staff record.",
        "Test an email mismatch.",
        "Test with a trashed staff record."
      ],
      expected: "Connect succeeds and shows the connected email.\nDisconnect clears the connection.\nMissing staff record shows the specific error.\nEmail mismatch is blocked.\nTrashed staff shows the specific error.\nPopup-blocked case shows guidance.\nEvents sync correctly if enabled."
    },
    {
      id: "M-24", group: "Medium", module: "Responsive", priority: "Medium",
      check: "Responsive and mobile checks",
      steps: [
        "At 390x844, test login, dashboard, bookings, Add Booking, calendar, settings, trash and Jev.",
        "Repeat in Arabic RTL.",
        "Test keyboard-only navigation for Jev and forms."
      ],
      expected: "No horizontal page scroll.\nTables scroll inside their container.\nButtons and tabs remain reachable.\nJev palette fits the viewport and traps focus.\nRTL mobile layout is usable.\nKeyboard: arrows move results, Enter selects, Esc closes."
    },

    {
      id: "S-01", group: "Core smoke", module: "Auth", priority: "High",
      check: "Auth smoke: login, logout and forgot password",
      steps: ["Open /login.", "Log in and log out.", "Open forgot password and submit a test email."],
      expected: "Session works; redirects are correct; reset email is accepted without errors."
    },
    {
      id: "S-02", group: "Core smoke", module: "Portal", priority: "High",
      check: "Portal smoke: company cards and switch",
      steps: ["Open /portal.", "Check company cards.", "Switch company."],
      expected: "Portal loads and the context switches correctly."
    },
    {
      id: "S-03", group: "Core smoke", module: "Dashboard", priority: "High",
      check: "Dashboard smoke: cards and charts",
      steps: ["Open /dashboard.", "Check cards and charts.", "Refresh."],
      expected: "Data loads without console errors."
    },
    {
      id: "S-04", group: "Core smoke", module: "Bookings", priority: "High",
      check: "Bookings smoke: tabs and row detail",
      steps: ["Open /dashboard/bookings.", "Switch tabs.", "Open a booking row."],
      expected: "Rows and counts are correct."
    },
    {
      id: "S-05", group: "Core smoke", module: "Calendar", priority: "High",
      check: "Calendar smoke: month, week and day",
      steps: ["Open /dashboard/calendar.", "Switch month, week and day views."],
      expected: "Bookings and blocks render."
    },
    {
      id: "S-06", group: "Core smoke", module: "Services", priority: "High",
      check: "Services smoke: create, edit and trash",
      steps: ["Open /dashboard/services.", "Create a service.", "Edit it.", "Move it to trash."],
      expected: "Changes persist and validations work."
    },
    {
      id: "S-07", group: "Core smoke", module: "Categories", priority: "High",
      check: "Categories smoke: create and assign",
      steps: ["Open /dashboard/categories.", "Create a category.", "Assign a service.", "Try deleting the category."],
      expected: "Changes persist and the trash block works."
    },
    {
      id: "S-08", group: "Core smoke", module: "Staff", priority: "High",
      check: "Staff smoke: create, edit and roles",
      steps: ["Open /dashboard/staff.", "Create a staff member.", "Edit roles.", "Log in as that staff member."],
      expected: "Changes persist and access is enforced."
    },
    {
      id: "S-09", group: "Core smoke", module: "Customers", priority: "High",
      check: "Customers smoke: create, edit and search",
      steps: ["Open /dashboard/customers.", "Create a customer.", "Edit it.", "Search for it."],
      expected: "Changes persist and search works."
    },
    {
      id: "S-10", group: "Core smoke", module: "Deals", priority: "High",
      check: "Deals smoke: create and expire",
      steps: ["Open /dashboard/deals.", "Create a deal.", "Expire it.", "Open the detail page."],
      expected: "Status and links are correct."
    },
    {
      id: "S-11", group: "Core smoke", module: "Journal", priority: "High",
      check: "Journal smoke: create an entry",
      steps: ["Open /dashboard/journal.", "Create an entry.", "Reopen it."],
      expected: "Entry saves and access is enforced."
    },
    {
      id: "S-12", group: "Core smoke", module: "Loyalty", priority: "High",
      check: "Loyalty smoke: add a stamp",
      steps: ["Open /dashboard/loyalty-cards.", "Add a stamp to a customer."],
      expected: "Balance updates."
    },
    {
      id: "S-13", group: "Core smoke", module: "Discounts", priority: "High",
      check: "Discounts smoke: create and apply",
      steps: ["Open /dashboard/discounts.", "Create a campaign.", "Apply it to a booking."],
      expected: "Discount applies and limits are enforced."
    },
    {
      id: "S-14", group: "Core smoke", module: "Receipts", priority: "High",
      check: "Receipts smoke: create and download",
      steps: ["Open /dashboard/receipts.", "Create a receipt.", "Download the PDF."],
      expected: "PDF and email work."
    },
    {
      id: "S-15", group: "Core smoke", module: "Payments", priority: "High",
      check: "Payments smoke: record a payment",
      steps: ["Open /dashboard/payments.", "Record a full payment."],
      expected: "Balance and status update."
    },
    {
      id: "S-16", group: "Core smoke", module: "Petty cash", priority: "High",
      check: "Petty cash smoke: add an expense",
      steps: ["Open /dashboard/petty-cash.", "Add an expense."],
      expected: "Balance updates."
    },
    {
      id: "S-17", group: "Core smoke", module: "Settings", priority: "High",
      check: "Settings smoke: tabs and save",
      steps: ["Open /dashboard/settings.", "Open each tab.", "Save a harmless change."],
      expected: "Changes persist without errors."
    },
    {
      id: "S-18", group: "Core smoke", module: "Website", priority: "High",
      check: "Website editor smoke: edit and publish",
      steps: ["Open /website-edit.", "Edit a section.", "Publish."],
      expected: "Public site updates."
    },
    {
      id: "S-19", group: "Core smoke", module: "Reviews", priority: "High",
      check: "Reviews smoke: list and filter",
      steps: ["Open /dashboard/reviews.", "List and filter reviews."],
      expected: "Data is correct."
    },
    {
      id: "S-20", group: "Core smoke", module: "Staff reviews", priority: "High",
      check: "Staff reviews smoke: filter and averages",
      steps: ["Open /dashboard/staff-reviews.", "Filter by staff and date."],
      expected: "Data and averages are correct."
    },
    {
      id: "S-21", group: "Core smoke", module: "SAR", priority: "High",
      check: "SAR smoke: change period",
      steps: ["Open /dashboard/sar.", "Change the reporting period."],
      expected: "Totals are correct."
    },
    {
      id: "S-22", group: "Core smoke", module: "Plans", priority: "High",
      check: "Plans smoke: load and limits",
      steps: ["Open /dashboard/plans.", "Check the current plan and limits."],
      expected: "Correct plan is shown."
    },
    {
      id: "S-23", group: "Core smoke", module: "AI Studio", priority: "High",
      check: "AI Studio smoke: generate content",
      steps: ["Open /dashboard/ai-studio.", "Generate content."],
      expected: "Output is generated or a clear error is shown."
    },
    {
      id: "S-24", group: "Core smoke", module: "Academy", priority: "High",
      check: "Academy smoke: browse a lesson",
      steps: ["Open /dashboard/academy.", "Browse the catalog and open a lesson."],
      expected: "Content loads and access is enforced."
    },
    {
      id: "S-25", group: "Core smoke", module: "Settings", priority: "High",
      check: "Sidebar module toggles",
      steps: ["Settings -> Advanced settings -> hide a module.", "Confirm the sidebar item disappears.", "Open the direct route.", "Re-enable the module."],
      expected: "Direct route returns NotFound while hidden; re-enabling restores it."
    },

    {
      id: "X-01", group: "Cross-cutting", module: "Security", priority: "Critical",
      check: "Security boundaries",
      steps: ["Attempt API calls without a token.", "Attempt cross-company reads.", "Inspect JEV and SMTP secrets in browser traffic.", "Try an off-allowlist continueUrl.", "Try an SSRF-style inventory webhook.", "Open a hidden module URL as limited staff."],
      expected: "No API returns another company's data.\n401 without a token; 403 for the wrong company.\nJEV key, service account and SMTP secrets are server-only.\ncontinueUrl cannot redirect off the allowlist.\nInventory webhook rejects SSRF-style hosts.\nLimited staff cannot reach hidden modules by URL."
    },
    {
      id: "X-02", group: "Cross-cutting", module: "Data integrity", priority: "Critical",
      check: "Data integrity",
      steps: ["Create, edit, trash and restore a booking.", "Restore a trashed service with a linked booking.", "Save the same SMS preference twice.", "Run the counts backfill twice.", "Create a duplicate company name."],
      expected: "Booking counts always reconcile with rows after create/edit/trash/restore.\nTrash restore preserves links.\nNo duplicate suppressed_phones documents.\nBackfill is idempotent.\nCompany name uniqueness has no duplicate lookup records."
    },
    {
      id: "X-03", group: "Cross-cutting", module: "Performance", priority: "Medium",
      check: "Performance thresholds",
      steps: ["Measure bookings first page.", "Measure a normal Jev search.", "Measure portal load.", "Measure calendar month load.", "Inspect DevTools for repeated polling."],
      expected: "Bookings first page under ~2 seconds on staging.\nJev search under ~1.5 seconds for a normal query.\nPortal under ~2 seconds.\nCalendar month under ~2 seconds.\nNo unbounded requests or repeated polling."
    },
    {
      id: "X-04", group: "Cross-cutting", module: "Browser matrix", priority: "Medium",
      check: "Browser and device matrix",
      steps: ["Run the smoke suite in Chrome latest on desktop.", "Repeat in Safari latest on macOS and iOS.", "Repeat in Firefox latest.", "Repeat in Edge latest.", "Repeat in Android Chrome."],
      expected: "Core flows work in every browser.\nNo browser-specific layout breaks.\nNo console errors that block the flow."
    },
    {
      id: "X-05", group: "Cross-cutting", module: "Email matrix", priority: "Medium",
      check: "Email client matrix",
      steps: ["Open verification, reset, booking and receipt emails in Gmail web.", "Repeat in Outlook web.", "Repeat in Apple Mail/iOS."],
      expected: "Links work in every client.\nLayout is readable.\nNo PII leak to the wrong recipient."
    }
  ]
};
