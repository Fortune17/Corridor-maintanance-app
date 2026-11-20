import { RequestCategory, RequestPriority } from '../types/database';

export interface IssuePreset {
  id: string;
  label: string;
  shortDesc: string;
  title: string;
  category: RequestCategory;
  priority: RequestPriority;
  descriptionHint: string;
  selfChecks: string[];
}

export const ISSUE_PRESETS: IssuePreset[] = [
  {
    id: 'plumbing_leak',
    label: 'Leaking Tap / Drain',
    shortDesc: 'Dripping faucet, blocked shower or sink',
    title: 'Tap / Drain Maintenance Needed',
    category: 'Plumbing and water leaks',
    priority: 'High',
    descriptionHint:
      'Describe whether water is actively pooling on the floor, dripping continuously, or draining slowly.',
    selfChecks: [
      'If water is flooding rapidly, turn the isolation valve under the basin clockwise and call 24/7 Security immediately.',
      'Check if a removable hair catcher in the shower drain can be cleared safely.',
    ],
  },
  {
    id: 'power_lighting',
    label: 'Lights / Wall Socket',
    shortDesc: 'Dead outlet, flickering tube or desk lamp',
    title: 'Lighting / Power Socket Not Working',
    category: 'Electricity and lighting',
    priority: 'Normal',
    descriptionHint:
      'Specify which light fixture or wall socket has failed and whether other outlets in the room still work.',
    selfChecks: [
      'Check your room distribution board (DB) inside the entrance cupboard to see if a breaker switch has tripped downward.',
      'Test the wall socket with another device (like a phone charger) to confirm the fault is the outlet and not the appliance.',
    ],
  },
  {
    id: 'door_lock',
    label: 'Door Lock / Keycard',
    shortDesc: 'Sticking latch, loose handle or reader error',
    title: 'Room Door Lock / Access Issue',
    category: 'Doors, locks and security',
    priority: 'High',
    descriptionHint:
      'Note whether the door still locks securely from the inside and if the keycard reader flashes red or amber.',
    selfChecks: [
      'If you are locked out right now or the door cannot lock at all, contact Block B Reception (+27 11 555-0199) for immediate security assistance.',
      'Wipe the keycard gently and hold it flat against the reader for 2 full seconds.',
    ],
  },
  {
    id: 'wifi_network',
    label: 'Wi-Fi / Ethernet Down',
    shortDesc: 'No signal, dropping connection or wall port',
    title: 'Internet Connectivity Disruption',
    category: 'Internet and connectivity',
    priority: 'Normal',
    descriptionHint:
      'Mention whether both Wi-Fi and the wired Ethernet wall port are down, and which devices are affected.',
    selfChecks: [
      'Forget the residence Wi-Fi network on your device and reconnect using your student credentials.',
      'If using the wall Ethernet socket, ensure the cable clicks firmly into both the wall port and your laptop.',
    ],
  },
  {
    id: 'hot_water',
    label: 'No Hot Water',
    shortDesc: 'Cold shower or geyser pressure drop',
    title: 'No Hot Water Supply in Room',
    category: 'Plumbing and water leaks',
    priority: 'High',
    descriptionHint:
      'Let us know if the water is lukewarm or completely cold, and since what time this started.',
    selfChecks: [
      'Run the hot tap for 45–60 seconds during peak morning/evening hours to allow hot water to reach upper floors.',
      'Check if neighboring rooms on your corridor are also affected and mention it in your description.',
    ],
  },
  {
    id: 'furniture_fixture',
    label: 'Desk / Chair / Wardrobe',
    shortDesc: 'Loose hinge, wobbly desk or broken blind',
    title: 'Room Furniture / Fixture Repair',
    category: 'Furniture and fixtures',
    priority: 'Low',
    descriptionHint:
      'Specify which item needs repair (chair gas lift, wardrobe hinge, curtain rail, bed frame) and any missing screws.',
    selfChecks: [
      'Avoid forcing jammed wardrobe tracks or window latches—our carpenter will bring replacement hardware.',
    ],
  },
];

export const ACCESS_WINDOW_SUGGESTIONS: string[] = [
  'Weekdays 09:00 - 12:00',
  'Weekdays after 14:00',
  'Anytime with Security Escort',
  'Mornings before 11:00',
];

export const QUICK_REPLY_TEMPLATES: string[] = [
  'I am currently in my room and available for access.',
  'Please enter with Residence Security escort if I am in lectures.',
  'The issue has worsened since I submitted this ticket.',
  'Thank you for the update!',
];

export interface TriageOption {
  id: string;
  symptom: string;
  recommendedPriority: RequestPriority;
  slaTarget: string;
  actionType: 'emergency_call' | 'ticket';
  guidance: string;
  presetCategory: RequestCategory;
}

export const TRIAGE_ADVISOR_OPTIONS: TriageOption[] = [
  {
    id: 'flooding_sparks',
    symptom: 'Burst pipe flooding floor, sparking socket, or gas/smoke smell',
    recommendedPriority: 'Urgent',
    slaTarget: 'Immediate (< 2 Hours)',
    actionType: 'emergency_call',
    guidance:
      'Call 24/7 Residence Security immediately at +27 (0)11 555-0199 before submitting a ticket so maintenance can isolate water or power.',
    presetCategory: 'Plumbing and water leaks',
  },
  {
    id: 'security_lockout',
    symptom: 'Room door will not lock, broken ground-floor window latch, or total room power loss',
    recommendedPriority: 'High',
    slaTarget: '< 24 Hours',
    actionType: 'ticket',
    guidance:
      'Submit a High Priority ticket immediately. If your door cannot secure overnight, notify Block B Security Desk for temporary escort.',
    presetCategory: 'Doors, locks and security',
  },
  {
    id: 'hot_water_leak',
    symptom: 'No hot water, continuous tap drip, or bathroom drain backing up',
    recommendedPriority: 'High',
    slaTarget: '< 24 Hours',
    actionType: 'ticket',
    guidance:
      'Log a High Priority plumbing ticket and attach a quick photo of the affected tap or drain so the plumber brings the right seals.',
    presetCategory: 'Plumbing and water leaks',
  },
  {
    id: 'wifi_lighting',
    symptom: 'Desk lamp out, slow Wi-Fi signal, or cupboard door hinge loose',
    recommendedPriority: 'Normal',
    slaTarget: '48 - 72 Hours',
    actionType: 'ticket',
    guidance:
      'Submit a Normal Priority ticket and include your preferred lecture-free access window for smooth entry.',
    presetCategory: 'Electricity and lighting',
  },
  {
    id: 'cosmetic',
    symptom: 'Wall paint scuff, pinboard replacement, or loose drawer handle',
    recommendedPriority: 'Low',
    slaTarget: '3 - 5 Working Days',
    actionType: 'ticket',
    guidance:
      'Log a Low Priority ticket. These repairs are scheduled in weekly preventive maintenance blocks.',
    presetCategory: 'Furniture and fixtures',
  },
];

export interface ResidenceFaq {
  id: string;
  question: string;
  answer: string;
}

export const RESIDENCE_FAQS: ResidenceFaq[] = [
  {
    id: 'faq_access',
    question: 'What if I am in lectures when the technician arrives?',
    answer:
      'If you select "Anytime with Security Escort" in your Preferred Access Window, an authorized Corridor Hill technician may enter accompanied by Residence Security, inspect only the reported fixture, and log photo proof upon completion.',
  },
  {
    id: 'faq_photos',
    question: 'Why should I attach a photo of the problem?',
    answer:
      'Clear photos help maintenance staff identify exact replacement parts (such as valve sizes, bulb fittings, or lock models) before visiting your room, reducing repeat visits and Awaiting Parts delays.',
  },
  {
    id: 'faq_reopen',
    question: 'What happens if a repaired issue breaks again?',
    answer:
      'When a ticket is marked Resolved, you have 5 calendar days to test the fix. If the problem persists, open the ticket and click "Still Unresolved?" or "Reopen Request" to send it straight back to the active queue.',
  },
  {
    id: 'faq_room_change',
    question: 'I moved to a new room—how do I update my details?',
    answer:
      'Click your name/profile badge in the top navigation bar (or the "Update Room Details" button on your dashboard) to change your Block, Room Number, and Phone Number. New requests will auto-fill your updated room.',
  },
];
