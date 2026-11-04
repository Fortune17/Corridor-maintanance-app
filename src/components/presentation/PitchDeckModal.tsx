import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Presentation, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  AlertTriangle,
  Award
} from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const totalSlides = 12;

  const speakerNotes = [
    "WELCOME & HOOK: 'Good morning/afternoon. Today we are presenting a custom technology solution specifically engineered for student residence owners. As you know, running a multi-block residence isn't just about collecting rent—it's about protecting your physical infrastructure from catastrophic leaks, managing contractor costs, and keeping student satisfaction high enough to secure annual accreditations.'",
    "THE PAIN POINTS: 'Let's be direct about the current reality. In most residences, reporting maintenance is broken. A student notices a damp ceiling in Block B on Friday, but doesn't report it because reception is closed or WhatsApp messages get ignored. By Monday morning, you have a collapsed ceiling board and a R120,000 emergency repair bill. Add to that contractors who charge for 3 hours of plumbing when they only tightened a bolt. Our system eliminates this entire bleed.'",
    "THE THREE-WAY SOLUTION: 'This is not just another contact form. It connects all three sides of your operation: your students, your maintenance technicians, and your executive desk. Everyone sees exactly what they need to see, with complete accountability at every step.'",
    "STUDENT PORTAL DEMO: 'Notice how simple this is for a student. In under 60 seconds, they select their problem, take a photo on their phone, and submit. They don't have to fill in their details again because the system already knows their block and room. And critically, they can ONLY see their own tickets—so private student information is 100% POPIA compliant.'",
    "STAFF CONSOLE: 'Now look at your facilities manager's screen. Instead of 40 WhatsApp messages, they see a clean queue sorted by urgency. They can assign David Nkosi to plumbing, Samir Patel to electrical. Staff can write private internal memos about costs or part numbers that students can never see. And contractors MUST upload a photo of the completed job before they can claim it is fixed.'",
    "THE REOPEN LOOP: 'This is the feature residence owners love most. A technician cannot unilaterally mark a job done and leave. The student receives an alert and must confirm the repair. If the pipe is still dripping, the student clicks Reopen, and it alerts management immediately. You will never again pay a contractor for a half-finished job.'",
    "ANALYTICS: 'As an owner, you get an executive dashboard. You can see at a glance: Block B has had 18 plumbing calls this term. That tells you the pipe infrastructure in Block B needs planned replacement, rather than paying emergency call-out fees every single weekend.'",
    "MOBILE APP & QR CODES: 'We don't just give you a website. We package this as an installable Progressive Web App with Google Play Store support. Even better, we generate custom QR stickers for every single bedroom door. A student scans their door sticker, and the app instantly knows their exact room.'",
    "SECURITY & COMPLIANCE: 'Security was built from the ground up. Passwords are encrypted with salted SHA-256 hashes. Staff registration is protected with a confidential security code so students cannot hack into staff privileges. All data stays private under South African POPIA regulations.'",
    "ROI JUSTIFICATION: 'Let's look at the numbers. On a 400 to 800 bed residence, preventable water damage, contractor invoice disputes, and reception admin time easily cost over R295,000 per year. This platform pays for itself within the first 12 months.'",
    "THE R500K PACKAGE: 'Our commercial proposal is an all-inclusive R500,000 package for the entire year. That includes R320,000 for the full platform build, Play Store app, and QR codes, PLUS R180,000 covering 12 full months of 24/7 database hosting, security backups, and support at R15,000 per month. No hidden IT costs, no unexpected contractor invoices.'",
    "CLOSING THE DEAL: 'We can have your residence audited next week, your staff trained in 3 weeks, and your app live for next month's student intake. Let's sign the agreement today so we can begin the room mapping immediately.'"
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      } else if (e.key.toLowerCase() === 's') {
        setShowNotes((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-6 select-none">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden relative text-slate-100">
        
        {/* Top Control Bar */}
        <header className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">
                Corridor Hill Residence Portal
              </span>
              <span className="text-[11px] text-sky-400">Executive Owner Pitch & Commercial Proposal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showNotes 
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Speaker Script</span>
            </button>

            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
              {currentSlide + 1} / {totalSlides}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close presentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Slide Content Area */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto flex items-center justify-center">
          
          {/* SLIDE 1 */}
          {currentSlide === 0 && (
            <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-200">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                Enterprise Residence Operations & Asset Protection
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Transforming Student Residence Facilities Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">High-Efficiency, High-Yield Asset</span>.
              </h2>
              <p className="text-sm sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
                A centralized, 24/7 digital management ecosystem designed specifically for modern student housing — eliminating paper logs, halting contractor overbilling, preventing water/electrical disasters, and keeping occupancy at 100%.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-3xl font-extrabold text-emerald-400 block">70%</span>
                  <span className="text-xs text-slate-400">Faster repair turnaround</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-3xl font-extrabold text-sky-400 block">100%</span>
                  <span className="text-xs text-slate-400">Photo-proof accountability</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-3xl font-extrabold text-amber-400 block">0</span>
                  <span className="text-xs text-slate-400">Lost student tickets</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2 */}
          {currentSlide === 1 && (
            <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">The Problem</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                The Cost of Traditional Residence Maintenance is Bleeding Profits.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                  <h3 className="text-sm font-bold text-red-300">1. Disastrous Unreported Leaks</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Students ignore minor damp spots until ceilings collapse or geysers burst, costing <strong>R80k–R300k in emergency repairs</strong>.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                  <h3 className="text-sm font-bold text-red-300">2. Contractor Over-Invoicing</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    External plumbers and electricians bill for hours and parts with zero verifiable proof. Owners pay invoices blindly.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                  <h3 className="text-sm font-bold text-red-300">3. WhatsApp & Paper Logbook Chaos</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reception staff drown in conflicting WhatsApp messages and student desk queues. Tickets get lost and staff burn out.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                  <h3 className="text-sm font-bold text-red-300">4. Accreditation & DHET Risk</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unhappy students vent on social media. A single hazard report can trigger DHET audit flags or forfeit university leasing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 */}
          {currentSlide === 2 && (
            <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">The Solution</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                A Dedicated Three-Way Command Hub Built for Student Housing.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-xl bg-slate-900 border border-sky-800/40 space-y-3">
                  <span className="w-9 h-9 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-base">01</span>
                  <h3 className="text-base font-bold text-white">Student Tenant Portal</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    60-second issue reporting, room/block auto-binding, photo uploads, live repair timeline, and student confirmation sign-off.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-amber-800/40 space-y-3">
                  <span className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-base">02</span>
                  <h3 className="text-base font-bold text-white">Technician & Dispatch Console</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Smart triage by priority, technician job assignment, private internal staff notes, and proof-of-completion photos.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-emerald-800/40 space-y-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-base">03</span>
                  <h3 className="text-base font-bold text-white">Owner & Estate Intelligence</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live building-by-building failure analytics, SLA performance metrics, contractor accountability, and immutable audit logs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4 */}
          {currentSlide === 3 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Component 1</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                The Student Experience: Zero Friction, Total Peace of Mind.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <p>✔ <strong>Sub-60 Second Submissions:</strong> Categorized by Plumbing, Electrical, Furniture, Structural, Appliance, or Hygiene.</p>
                  <p>✔ <strong>Photo Evidence Uploads:</strong> Students attach high-res photo proof so technicians arrive with the exact tools and parts.</p>
                  <p>✔ <strong>Strict Privacy Isolation:</strong> Students can ONLY see tickets for their room. Other residents' private data is strictly invisible.</p>
                  <p>✔ <strong>In-App Notifications:</strong> Real-time alerts when a technician is dispatched or arrives.</p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 inline-block">
                    Live Status: In Progress
                  </span>
                  <h4 className="text-sm font-bold text-white">CH-REQ-2026-004: Leaking Bathroom Pipe</h4>
                  <p className="text-xs text-slate-400">Block B (Pine Hall) · Room 204 · Assigned: David Nkosi</p>
                  <div className="p-3 rounded bg-slate-950 text-xs text-slate-300 border border-slate-800">
                    <span className="text-[11px] text-sky-400 font-bold block mb-0.5">Technician Update · 10:15 AM</span>
                    "Replacement 15mm valve fitted. Running pressure test now before signing off."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5 */}
          {currentSlide === 4 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Component 2</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Staff & Dispatch Console: Military-Grade Maintenance Control.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold text-xs uppercase">Automated Triage</span>
                  <p className="text-xs text-slate-400">Filter tickets across Block A through Block E instantly by Emergency, Urgent, or Normal priority.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-sky-400 font-bold text-xs uppercase">Technician Allocation</span>
                  <p className="text-xs text-slate-400">Assign jobs directly to named specialists (David Nkosi for plumbing, Samir Patel for electrical).</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-emerald-400 font-bold text-xs uppercase">Private Internal Notes</span>
                  <p className="text-xs text-slate-400">Staff can record contractor quotes or triage notes that are strictly hidden from students.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs">
                <strong>Anti-Fraud Completion Proof:</strong> Contractors cannot mark a ticket closed without uploading timestamped photo evidence of the finished repair.
              </div>
            </div>
          )}

          {/* SLIDE 6 */}
          {currentSlide === 5 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">The Game-Changer</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                The "Closed Only When Fixed" Guarantee.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Student Confirmation Sign-off</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When a technician marks a ticket Resolved, the student must confirm satisfaction in-app before the ticket permanently moves to Closed.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Reopen Loop with Reason Logging</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If the repair was botched, the student clicks "Reopen Request" with required feedback. The ticket immediately bounces back to In Progress and alerts management.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Every action is recorded in an <strong>immutable audit log</strong> for insurance, board meetings, and accreditation reviews.
              </p>
            </div>
          )}

          {/* SLIDE 7 */}
          {currentSlide === 6 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Executive View</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Analytics & Asset Health: Know Where Every Cent Goes.
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Mean Time to Repair</span>
                  <span className="text-2xl font-bold text-sky-400">3.8 Hours</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">↓ 68% from paper baseline</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block">First-Time Fix Rate</span>
                  <span className="text-2xl font-bold text-emerald-400">92.4%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Verified by photo proof</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Problematic Block</span>
                  <span className="text-2xl font-bold text-amber-400">Block B</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">42% plumbing age related</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Prevented Water Loss</span>
                  <span className="text-2xl font-bold text-purple-400">~R45,000</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Monthly municipal bill savings</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong>Smarter CAPEX Decisions:</strong> Hard data reveals which building needs planned maintenance instead of paying recurring emergency contractor callouts every weekend.
              </div>
            </div>
          )}

          {/* SLIDE 8 */}
          {currentSlide === 7 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Modern Technology</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Installable Progressive Web App & Smart QR Door Tagging.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <Smartphone className="w-6 h-6 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Full Web App & Mobile Installation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Installable directly from the browser onto Android and iOS home screens with zero app store friction, native push alerts, and offline resilience.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <QrCode className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Smart QR Room Tagging</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Students simply scan a sticker on their bedroom door. The web app opens with their building block and room number already pre-populated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 9 */}
          {currentSlide === 8 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Compliance</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Enterprise Security & Full POPIA Data Privacy.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase">Staff Security Passcode</h4>
                  <p className="text-xs text-slate-400">Staff registration is locked behind a confidential code with strict masking to prevent privilege escalation.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase">POPIA Student Isolation</h4>
                  <p className="text-xs text-slate-400">Complies with South African POPIA. Student phone numbers and tickets are strictly isolated from peers.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase">Zero Key Leaks</h4>
                  <p className="text-xs text-slate-400">Salted SHA-256 Web Crypto hashing. Zero plaintext passwords, API keys, or backend secrets are ever exposed.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10 */}
          {currentSlide === 9 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">The Business Case</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Why This Investment Yields a 300%+ Return for the Owner.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold block">Water & Electrical Leaks</span>
                    <span className="text-slate-400">Emergency reporting prevents ceiling collapse</span>
                  </div>
                  <span className="font-bold text-sky-400">Save ~R120,000/yr</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold block">Contractor Over-Invoicing</span>
                    <span className="text-slate-400">Zero payout without photo proof & student sign-off</span>
                  </div>
                  <span className="font-bold text-sky-400">Save ~R80,000/yr</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold block">Reception Staff Hours</span>
                    <span className="text-slate-400">Automated logging replaces paper logbooks</span>
                  </div>
                  <span className="font-bold text-sky-400">Save ~R95,000/yr</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold block">Accreditation Protection</span>
                    <span className="text-slate-400">DHET compliance audit trail</span>
                  </div>
                  <span className="font-bold text-emerald-400">Protects Millions</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">
                Conservative financial benefit to an average 400–800 bed student residence: <strong>R295,000+ saved annually in operational losses alone.</strong>
              </p>
            </div>
          )}

          {/* SLIDE 11 */}
          {currentSlide === 10 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Commercial Proposal</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Complete Package: R500,000 (Inclusive of 12 Months Support & Maintenance).
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <h3 className="font-bold text-sky-400 text-sm">1. Upfront Deployment & Rollout (R320,000)</h3>
                  <p>✔ Full IP & customized branding for your residence</p>
                  <p>✔ Web app & mobile installation configuration</p>
                  <p>✔ Building & room schema configuration (all blocks)</p>
                  <p>✔ Print-ready QR code room asset generation</p>
                  <p>✔ On-site staff and technician onboarding & training</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <h3 className="font-bold text-emerald-400 text-sm">2. 12-Month Managed Maintenance SLA (R180,000)</h3>
                  <p>✔ High-availability PostgreSQL database & backups</p>
                  <p>✔ 24/7 critical system uptime monitoring</p>
                  <p>✔ Monthly browser & mobile compliance updates</p>
                  <p>✔ 10 hours/month operational tweaks & room changes</p>
                  <p>✔ Monthly Executive Asset & SLA PDF report for the board</p>
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <strong>Milestone Terms:</strong> R160k upon signing · R160k upon Go-Live · R15k/month for 12 months.
              </div>
            </div>
          )}

          {/* SLIDE 12 */}
          {currentSlide === 11 && (
            <div className="w-full max-w-4xl space-y-5 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Execution</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                4-Week Fast-Track Deployment Schedule.
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-sky-400 font-bold font-mono">WEEK 1</span>
                  <h4 className="font-bold text-white">Residence Audit</h4>
                  <p className="text-slate-400">Map rooms, blocks, and technician contacts.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-sky-400 font-bold font-mono">WEEK 2</span>
                  <h4 className="font-bold text-white">App & QR Setup</h4>
                  <p className="text-slate-400">Configure web app and print QR stickers.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-sky-400 font-bold font-mono">WEEK 3</span>
                  <h4 className="font-bold text-white">Staff Training</h4>
                  <p className="text-slate-400">Technician & desk triage training workshops.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold font-mono">WEEK 4</span>
                  <h4 className="font-bold text-white">Campus Go-Live</h4>
                  <p className="text-slate-400">Student launch & 24/7 SLA activation.</p>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 border border-sky-800/60 text-center space-y-2">
                <h3 className="text-base font-bold text-white">Ready to Modernize Corridor Hill Student Residence?</h3>
                <p className="text-xs text-slate-300">
                  Sign the agreement this week to begin the room mapping and have the platform live for next intake.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Speaker Notes Drawer */}
        {showNotes && (
          <aside className="border-t border-slate-800 bg-slate-900/95 p-4 z-20 shrink-0">
            <div className="max-w-4xl mx-auto">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                🎙️ Presenter Script & Selling Talking Points:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {speakerNotes[currentSlide]}
              </p>
            </div>
          </aside>
        )}

        {/* Bottom Navigation */}
        <footer className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 hidden sm:block">
            Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">→</kbd> to navigate · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">S</kbd> for notes
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
