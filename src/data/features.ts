import type { ChecklistItem } from "./types";

export const FEAT: ChecklistItem[] = [
["NF-01","Access","Feature can be found and opened from its expected entry point","1. Log in as a user who should have access. 2. Open the feature from the menu, button or link where users would expect it.","The feature opens quickly with no error or blank screen.","High"],
["NF-02","Happy path","Main flow works end to end","1. Complete the main task from start to finish using valid data. 2. Check the confirmation or result.","The task completes and the result is shown correctly.","High"],
["NF-03","Validation","Missing and invalid input is handled","1. Leave required fields empty. 2. Enter invalid values (wrong format, too long, negative numbers). 3. Submit.","Clear messages appear and nothing invalid is saved.","High"],
["NF-04","Saved data","Data persists after refresh","1. Create or change something. 2. Refresh the page. 3. Check related screens and lists.","Changes are still there and appear everywhere they should.","High"],
["NF-05","Permissions","Each role sees only what it should","1. Test as owner, manager and staff (or other roles). 2. Try opening the feature through a direct link.","Allowed roles can use it; others are blocked with a clear message.","High"],
["NF-06","Empty and edge cases","Empty states and large data look right","1. Open the feature with no data. 2. Try very long names and many records.","A helpful empty message shows and the layout does not break.","Medium"],
["NF-07","Content","Text, labels and translations are correct","1. Read every label, message and button. 2. Check spelling and tone. 3. Switch language if supported.","No typos, placeholder text or untranslated strings.","Medium"],
["NF-08","Layout","Works on mobile and desktop","1. Open on a phone-sized screen and on desktop. 2. Rotate and resize the window.","Nothing overlaps, is cut off or unreachable, and buttons are easy to tap.","Medium"],
["NF-09","Errors","Failures are handled gracefully","1. Go offline or interrupt a save. 2. Retry.","A clear error is shown and no data is lost or duplicated.","Medium"],
["NF-10","Related features","Existing related features still work","1. Run the related tests from the main checklist.","No existing behavior changed unexpectedly.","High"]
].map(a=>({id:a[0],module:"New feature · "+a[1],check:a[2],steps:a[3],expected:a[4],priority:a[5],grp:0}));
