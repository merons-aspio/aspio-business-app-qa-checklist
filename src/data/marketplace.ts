import type { ChecklistItem } from "./types";

export const MARKETPLACE: ChecklistItem[] = [
["MKT-01","Smoke","Open the home page","Visit the marketplace URL.","Home page loads; deals, businesses, and navigation appear. No JavaScript errors in the console.","Critical"],
["MKT-02","Smoke","Log in / sign up","Use the login modal or create a new account.","User is logged in; \"My Favorites\" and \"Book Now\" become available.","Critical"],
["MKT-03","Smoke","Browse deals","Click any deal card.","Deal-detail page opens, showing title, price, and \"Save / Book Now\" buttons.","Critical"],
["MKT-04","Smoke","Save a deal","Click the heart icon on a deal.","Heart fills in; a snackbar says \"Saved for later\".","Critical"],
["MKT-05","Smoke","View favorites","Go to the Favorites section.","List of saved businesses appears; each shows name, rating, address, and category.","Critical"],
["MKT-06","Smoke","Book a service","Start a booking (pick date \u2192 time \u2192 staff \u2192 continue).","Booking steps progress. If you\u2019re a guest you\u2019re asked for email/mobile; if logged in the flow proceeds.","Critical"],
["MKT-07","Smoke","Leave a review (if you have a past booking)","Find a past booking and select \u201cLeave Review\u201d.","Review form opens with a 1\u20135 star selector and a text box. Submitting shows a confirmation.","Critical"],
["MKT-08","Smoke","Change language","Open the language dropdown and pick a different language.","All visible text switches to the selected language (English, Swedish, Spanish, Arabic, etc.).","Critical"],
["MKT-09","Smoke","Dark / light mode","Toggle the theme switch (if present).","Colors swap between light and dark; readability stays good.","Critical"],
["MKT-10","Smoke","Cookie-consent banner","First visit (or clear cache).","Banner appears at the bottom; Accepting or Dismissing it works.","Critical"],

["MKT-11","Deals","Deal shows starting price","Open a deal detail page. Look near the price area.","A \u201cStarting at:\u201d line appears if the deal has a starting price; if not, no extra line shows.","High"],
["MKT-12","Deals","Save / remove deal","Click the heart to save, click again to remove.","Heart toggles; snackbar messages: \u201cSaved for later\u201d / \u201cRemoved from saved\u201d.","High"],
["MKT-13","Deals","Book from deal","On a deal detail page, click \u201cBook Now\u201d.","You\u2019re taken to the booking page pre-filled with the deal; the discount should apply.","High"],
["MKT-14","Deals","Deal usage counter","If you\u2019ve used a deal before, view its detail.","A badge shows \u201cActive\u201d or \u201cUsed X times\u201d. If the deal is exhausted, an \u201cexhausted\u201d message appears.","Medium"],
["MKT-15","Deals","Deal expiration","Check a deal with a valid-until date.","Date displays correctly; past-due deals get an \u201cExpired\u201d badge and \u201cBook Now\u201d becomes disabled.","Medium"],
["MKT-16","Deals","Edge: Deal exhausted (max uses reached)","Open a deal that has reached its maximum uses.","Exhausted message shows and booking is blocked.","Medium"],

["MKT-17","Favorites","View favorites","Log in \u2192 go to Favorites page.","List of saved businesses appears; each shows name, rating, address, category.","High"],
["MKT-18","Favorites","Search favorites","Type in the search box.","List filters to show only businesses matching the text (name, address, category).","Medium"],
["MKT-19","Favorites","Filter by category","Use the category dropdown.","Only businesses in the selected category stay visible.","Medium"],
["MKT-20","Favorites","Remove a favorite","Hover over a business card and click the remove (X).","The business is removed immediately (optimistic update); after a moment the database is updated. If the removal fails, the list reverts to the previous state.","High"],
["MKT-21","Favorites","View business from favorite","Click a business card in favorites.","A popup slides in with full details (opening hours, phone, website, etc.).","Medium"],
["MKT-22","Favorites","Edge: Remove favorite while page loading","Remove a favorite while the page is still loading.","The removal should still work and the list should update correctly.","Low"],

["MKT-23","Booking","Start a new booking","Go to a company\u2019s booking page.","Calendar appears with upcoming dates. If the company uses the Nest backend, staff availability is shown.","Critical"],
["MKT-24","Booking","Select a date","Pick a date from the calendar.","Available time slots for that date load. If no slots are available, a message \u201cNo available times\u201d shows.","High"],
["MKT-25","Booking","Select a time","Click a time slot.","Slot is highlighted. If the booking requires a specific staff member, the staff list appears.","High"],
["MKT-26","Booking","Select staff (if shown)","Choose a staff member from the list.","The chosen staff member is remembered; booking continues to the next step.","Medium"],
["MKT-27","Booking","Complete booking","Fill in name, email, mobile, and submit.","A booking confirmation appears. You receive a confirmation message (and possibly email, depending on settings).","Critical"],
["MKT-28","Booking","Mobile view","Resize the browser to phone width or open on a mobile device.","UI adjusts \u2013 calendar strips rearrange, buttons resize, touch targets are large enough.","Medium"],
["MKT-29","Booking","Edge: Staff unavailable for selected date","Book a service that requires a specific staff member, but that staff is unavailable for the selected date.","Message like \u201cThis staff member is not available at this time\u201d appears.","Low"],

["MKT-30","Reviews","Open review form","From a booking confirmation or \u201cMy Bookings\u201d page, click \u201cLeave Review\u201d.","Form appears with a rating selector (1\u20135) and a text box.","High"],
["MKT-31","Reviews","Submit a rating","Choose 5 stars and write \u201cGreat service!\u201d then submit.","Review submits successfully; the average rating for the company updates.","High"],
["MKT-32","Reviews","Edit own review","After submitting, click \u201cEdit\u201d on your review.","Form pre-fills with your previous rating and text; you can change and resubmit.","Medium"],
["MKT-33","Reviews","Guest review (no login)","Use a guest booking link from email.","Form asks for an email confirmation. After entering the matching email, you can submit the review.","Medium"],
["MKT-34","Reviews","Ineligible booking","Try to review a booking you haven\u2019t made or is too old.","An error message appears: \u201cThis booking is not eligible for a review yet\u201d or similar.","Medium"],
["MKT-35","Reviews","Edge: Invalid rating (0 or 6)","Submit a review with a rating of 0 or 6.","The system should reject it and show \u201cRating must be between 1 and 5\u201d.","Low"],

["MKT-36","Layout/Design","Page loads without shift","Refresh the page a few times.","Layout doesn\u2019t jump around (no \u201clayout shift\u201d where elements move as resources load).","Medium"],
["MKT-37","Layout/Design","Dark mode","Toggle the dark/light mode switch.","Colors switch between light and dark themes; text remains readable.","Medium"],
["MKT-38","Layout/Design","Cookie consent banner","First visit (or clear cache).","Banner appears at the bottom asking to accept cookies. Accepting or dismissing it works.","Medium"],
["MKT-39","Layout/Design","Restaurant menu preview","If a business has a menu, look for a \u201cPreview Menu\u201d button.","A modal opens showing the menu PDF. The PDF loads within the modal. If the menu URL is invalid, a fallback message appears.","High"],
["MKT-40","Layout/Design","Business popup on home/favorites","Click on a business card anywhere.","A popup slides in with business details (rating, address, hours, contact). Closing the popup returns you to where you were.","Medium"],
["MKT-41","Layout/Design","Responsive design","Rotate phone to landscape, or resize browser window.","Content reflows gracefully; no horizontal scrolling unless intended; text stays readable.","Medium"],
["MKT-42","Layout/Design","Edge: Slow network menu preview","Open the restaurant menu preview on a slow network.","Modal shows a loading indicator; if PDF can\u2019t load, an error message appears (not a blank screen).","Low"],

["MKT-43","Search & Discovery","Search businesses","Use the search bar at the top of the homepage or marketplace.","Results appear matching the typed text (business name, category, location).","High"],
["MKT-44","Search & Discovery","Filter by category","Use the category dropdown.","Only businesses in the selected category show.","Medium"],
["MKT-45","Search & Discovery","Location-based search","If the page asks for location permission or you enter a city, results should reflect that area.","Businesses in the entered location appear.","Medium"],
["MKT-46","Search & Discovery","Edge: No results found","Search for a very specific or uncommon term.","No results shows the \u201cno results found\u201d message, not an error.","Low"],

["MKT-47","Languages/Localization","Switch language","Open the language dropdown and select a different language.","All visible text changes to the selected language (menus, buttons, labels, error messages).","Critical"],
["MKT-48","Languages/Localization","Read right-to-left languages (Arabic)","Select Arabic.","The layout adjusts \u2013 text direction becomes right-to-left, navigation mirrors, numbers and dates format correctly.","Critical"],
["MKT-49","Languages/Localization","All modules multilingual","Switch between languages and check: home, deals, favorites, booking, reviews.","Text in all these areas translates; no keys missing (no \u201cKEY_NOT_FOUND\u201d or English text remains).","High"],
["MKT-50","Languages/Localization","Edge: Long translations overflow","Switch to a language that has longer words (like German, if added).","Buttons and inputs don\u2019t overflow or cut off text.","Low"],

["MKT-51","API/Backend","Availability API","Try to fetch availability for a company (e.g., open the booking page).","The app fetches available dates/times without error. No \u201cFailed to fetch availability\u201d messages.","Medium"],
["MKT-52","API/Backend","Deal activation API","Save or book a deal.","The request succeeds (HTTP 200). The deal\u2019s usage count updates on the server.","Medium"],
["MKT-53","API/Backend","Review submission API","Submit a review.","The review appears in the system (check the company\u2019s review list after a few moments).","Medium"],
["MKT-54","API/Backend","Email verification sync","If you have a Google account, complete email verification in another tab, then come back.","The verification status updates automatically (the broadcast channel or polling detects it).","Medium"],
["MKT-55","API/Backend","Edge: In-flight request handling","While a booking-availability request is in progress, click around or go to another page.","The app should handle the in-flight request gracefully (not crash, not show stale data).","Low"]
].map(a=>({id:a[0],module:"Marketplace \u00b7 "+a[1],check:a[2],steps:a[3],expected:a[4],priority:a[5],grp:0}));

export const MGRP=["Smoke","Deals","Favorites","Booking","Reviews","Layout/Design","Search & Discovery","Languages/Localization","API/Backend"];
export const MGSUB=[
"Critical path \u2013 run first",
"Price, saving, booking from deals",
"Saved businesses management",
"Staff, date, time selection",
"Leave & edit reviews",
"Pages, components, responsive",
"Search, filter, location",
"Language switching, RTL",
"Availability, deal activation, reviews, email sync"
];
