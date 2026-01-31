import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

type Province = "ON" | "Other";
type AgeRange = "Under70" | "70to79" | "80plus";
type Adl = "Independent" | "SomeHelp" | "NeedsDailyHelp";
type Cognitive = "None" | "Mild" | "Diagnosed";
type Assessed = "Yes" | "No" | "NotSure";
type Budget = "Low" | "Mid" | "High" | "PreferNot";

type CarePath = "Home Care" | "Retirement Home" | "Long-Term Care (LTC)";

type Assessment = {
  province: Province;
  age: AgeRange;
  adl: Adl;
  cognitive: Cognitive;
  assessed: Assessed;
  budget: Budget;
};

type Recommendation = {
  path: CarePath;
  reason: string[];
  nextSteps: string[];
  cautions?: string[];
};

type WaitlistItem = {
  id: string;
  facility: string;
  dateApplied: string; // yyyy-mm-dd
  contactName?: string;
  contactPhoneOrEmail?: string;
  notes?: string;
  followUpEveryDays: number;
  lastFollowUp?: string; // yyyy-mm-dd
};

const STORAGE_KEY = "scg_v1";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(aISO: string, bISO: string) {
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  const diff = Math.floor((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}

function buildRecommendation(a: Assessment): Recommendation {
  // Guardrail: this MVP is Ontario-only, but still works elsewhere with a note.
  const provinceNote =
    a.province !== "ON"
      ? [
          "This MVP is Ontario-focused. If you're outside Ontario, the care categories still apply, but the system steps will differ.",
        ]
      : [];

  // Rules (simple + explainable)
  // High need signals for LTC:
  const highNeed =
    a.adl === "NeedsDailyHelp" ||
    a.cognitive === "Diagnosed" ||
    (a.cognitive === "Mild" && a.adl !== "Independent");

  const moderateNeed =
    a.adl === "SomeHelp" || a.cognitive === "Mild" || a.assessed === "NotSure";

  let path: CarePath = "Home Care";
  const reason: string[] = [];
  const cautions: string[] = [];

  if (highNeed) {
    path = "Long-Term Care (LTC)";
    reason.push(
      "Daily living support needs appear significant (mobility, personal care, or supervision)."
    );
    if (a.cognitive !== "None") reason.push("Cognitive concerns increase care complexity.");
    if (a.assessed !== "Yes")
      reason.push("A formal needs assessment/referral will help start LTC-related processes.");
    cautions.push("Wait times can be long; start early and consider interim support.");
  } else if (moderateNeed) {
    // Choose between Home Care and Retirement Home based on budget + ADL
    if (a.adl === "SomeHelp" && (a.budget === "Mid" || a.budget === "High")) {
      path = "Retirement Home";
      reason.push("Some help is needed, but not necessarily 24/7 clinical care.");
      reason.push("A retirement home can cover meals, housekeeping, and support services.");
      if (a.cognitive === "Mild") cautions.push("Ask specifically about memory care options.");
    } else {
      path = "Home Care";
      reason.push("Needs appear moderate and may be supported at home with services.");
      reason.push("Starting with home care can reduce urgency while options are explored.");
    }
  } else {
    path = "Home Care";
    reason.push("Based on your inputs, your parent appears mostly independent right now.");
    reason.push("Home care + community support is often the least disruptive first step.");
  }

  // Ontario-focused next steps (plain English)
  const nextStepsCommon = [
    "Create a one-page summary: diagnoses, medications, mobility, recent hospital visits, and your top concerns.",
    "Collect key documents: health card, ID, medication list, and a brief medical history.",
    "Write down 3 realistic goals (e.g., safe bathing, meals, supervision, medication adherence).",
  ];

  const nextStepsON = {
    "Home Care": [
      "Contact Ontario Health atHome (formerly Home and Community Care) to ask about home care assessment/services.",
      "Book a family doctor appointment to discuss support needs and referrals (OT/PT, home care).",
      "Explore interim options: personal support worker (PSW), meal delivery, adult day programs.",
    ],
    "Retirement Home": [
      "Shortlist 5–10 nearby retirement homes; schedule tours (in person or virtual).",
      "Ask about: monthly cost breakdown, care packages, staffing, medication help, emergency response, and memory care.",
      "Plan a transition: trial stays (if available), move-in checklist, and safety review of current home.",
    ],
    "Long-Term Care (LTC)": [
      "Ask a hospital social worker or family doctor about starting an LTC application/assessment process in Ontario.",
      "Prepare for wait times: arrange interim support (home care, retirement home, short-stay respite).",
      "Make a shortlist of LTC homes and track communications carefully (dates, contacts, follow-ups).",
    ],
  } as const;

  const budgetHint =
    a.budget === "Low"
      ? [
          "Budget note: prioritize publicly supported options and ask about subsidies, eligibility, and community programs.",
        ]
      : [];

  return {
    path,
    reason: [...provinceNote, ...reason, ...budgetHint],
    nextSteps: [...nextStepsCommon, ...(a.province === "ON" ? nextStepsON[path] : [])],
    cautions: cautions.length ? cautions : undefined,
  };
}

function badgeClass(path: CarePath) {
  if (path === "Long-Term Care (LTC)") return "badge-red";
  if (path === "Retirement Home") return "badge-amber";
  return "badge-green";
}

export default function App() {
  const [step, setStep] = useState<"Assess" | "Result">("Assess");

  const [assessment, setAssessment] = useState<Assessment>({
    province: "ON",
    age: "70to79",
    adl: "SomeHelp",
    cognitive: "None",
    assessed: "NotSure",
    budget: "PreferNot",
  });

  const rec = useMemo(() => buildRecommendation(assessment), [assessment]);

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<WaitlistItem>>({
    facility: "",
    dateApplied: todayISO(),
    followUpEveryDays: 14,
  });

  // Load/save localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.waitlist) setWaitlist(parsed.waitlist);
      if (parsed?.assessment) setAssessment(parsed.assessment);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ waitlist, assessment })
      );
    } catch {}
  }, [waitlist, assessment]);

  const dueItems = useMemo(() => {
    const t = todayISO();
    return waitlist.filter((w) => {
      const base = w.lastFollowUp || w.dateApplied;
      return daysBetween(base, t) >= w.followUpEveryDays;
    });
  }, [waitlist]);

  function addWaitlistItem() {
    const facility = (newItem.facility || "").trim();
    if (!facility) return;

    const item: WaitlistItem = {
      id: crypto.randomUUID(),
      facility,
      dateApplied: newItem.dateApplied || todayISO(),
      contactName: newItem.contactName?.trim() || "",
      contactPhoneOrEmail: newItem.contactPhoneOrEmail?.trim() || "",
      notes: newItem.notes?.trim() || "",
      followUpEveryDays: Number(newItem.followUpEveryDays || 14),
      lastFollowUp: "",
    };

    setWaitlist((prev) => [item, ...prev]);
    setNewItem({ facility: "", dateApplied: todayISO(), followUpEveryDays: 14 });
  }

  function markFollowedUp(id: string) {
    const t = todayISO();
    setWaitlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, lastFollowUp: t } : w))
    );
  }

  function removeItem(id: string) {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1 className="header-title">Ontario Senior Care Guide</h1>
              <p className="header-subtitle">
                A simple, explainable decision helper for families.
              </p>
            </div>
            <div className="nav-buttons">
              <button
                className={`nav-button ${step === "Assess" ? "active" : ""}`}
                onClick={() => setStep("Assess")}
              >
                Assessment
              </button>
              <button
                className={`nav-button ${step === "Result" ? "active" : ""}`}
                onClick={() => setStep("Result")}
              >
                Results
              </button>
            </div>
          </div>
        </header>

        {step === "Assess" ? (
          <div className="space-y">
            <Card title="Quick Care Assessment (2 minutes)">
              <Grid>
                <Field label="Province" htmlFor="province">
                  <select
                    id="province"
                    className="input"
                    value={assessment.province}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        province: e.target.value as Province,
                      }))
                    }
                  >
                    <option value="ON">Ontario</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Age range" htmlFor="age">
                  <select
                    id="age"
                    className="input"
                    value={assessment.age}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        age: e.target.value as AgeRange,
                      }))
                    }
                  >
                    <option value="Under70">Under 70</option>
                    <option value="70to79">70–79</option>
                    <option value="80plus">80+</option>
                  </select>
                </Field>

                <Field label="Daily activities (bathing, dressing, eating)" htmlFor="adl">
                  <select
                    id="adl"
                    className="input"
                    value={assessment.adl}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        adl: e.target.value as Adl,
                      }))
                    }
                  >
                    <option value="Independent">Independent</option>
                    <option value="SomeHelp">Needs some help</option>
                    <option value="NeedsDailyHelp">Needs daily help/supervision</option>
                  </select>
                </Field>

                <Field label="Memory / cognitive concerns" htmlFor="cognitive">
                  <select
                    id="cognitive"
                    className="input"
                    value={assessment.cognitive}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        cognitive: e.target.value as Cognitive,
                      }))
                    }
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild concerns</option>
                    <option value="Diagnosed">Diagnosed condition</option>
                  </select>
                </Field>

                <Field label="Has there been a formal needs assessment?" htmlFor="assessed">
                  <select
                    id="assessed"
                    className="input"
                    value={assessment.assessed}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        assessed: e.target.value as Assessed,
                      }))
                    }
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="NotSure">Not sure</option>
                  </select>
                </Field>

                <Field label="Budget (optional)" htmlFor="budget">
                  <select
                    id="budget"
                    className="input"
                    value={assessment.budget}
                    onChange={(e) =>
                      setAssessment((s) => ({
                        ...s,
                        budget: e.target.value as Budget,
                      }))
                    }
                  >
                    <option value="PreferNot">Prefer not to say</option>
                    <option value="Low">Lower budget</option>
                    <option value="Mid">Mid budget</option>
                    <option value="High">Higher budget</option>
                  </select>
                </Field>
              </Grid>

              <div className="flex items-center justify-between" style={{ marginTop: "1rem" }}>
                <p className="text-xs text-slate-500">
                  This is not medical advice. It's a planning helper.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep("Result")}
                >
                  See results →
                </button>
              </div>
            </Card>

            <Card title="Preview (live)">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${badgeClass(rec.path)}`}>{rec.path}</span>
                <span className="text-sm text-slate-600">
                  Based on your current answers
                </span>
              </div>
              <ul className="list-disc text-sm" style={{ marginTop: "0.75rem" }}>
                {rec.reason.slice(0, 3).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Card>
          </div>
        ) : (
          <div className="space-y">
            <Card title="Your recommended care path">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${badgeClass(rec.path)}`}>{rec.path}</span>
                {rec.cautions?.length ? (
                  <span className="badge badge-slate">
                    Note: {rec.cautions[0]}
                  </span>
                ) : null}
              </div>

              <h3 className="font-semibold text-sm" style={{ marginTop: "1rem" }}>Why this recommendation</h3>
              <ul className="list-disc text-sm" style={{ marginTop: "0.5rem" }}>
                {rec.reason.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              {rec.cautions?.length ? (
                <>
                  <h3 className="font-semibold text-sm" style={{ marginTop: "1rem" }}>Things to keep in mind</h3>
                  <ul className="list-disc text-sm" style={{ marginTop: "0.5rem" }}>
                    {rec.cautions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className="flex gap-2" style={{ marginTop: "1rem" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep("Assess")}
                >
                  ← Edit answers
                </button>
              </div>
            </Card>

            <Card title="Next 14 days checklist">
              <ol className="list-ordered text-sm">
                {rec.nextSteps.map((s, i) => (
                  <li key={i}>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="Waitlist notes (optional)">
              {dueItems.length ? (
                <div className="alert alert-amber" style={{ marginBottom: "0.75rem" }}>
                  <b>{dueItems.length}</b> item(s) may be due for follow-up today.
                </div>
              ) : null}

              <div className="grid grid-2-col gap-2">
                <input
                  className="input"
                  placeholder="Facility name (required)"
                  value={newItem.facility || ""}
                  onChange={(e) => setNewItem((s) => ({ ...s, facility: e.target.value }))}
                />
                <input
                  className="input"
                  type="date"
                  value={newItem.dateApplied || todayISO()}
                  onChange={(e) => setNewItem((s) => ({ ...s, dateApplied: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Contact name (optional)"
                  value={newItem.contactName || ""}
                  onChange={(e) => setNewItem((s) => ({ ...s, contactName: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Phone or email (optional)"
                  value={newItem.contactPhoneOrEmail || ""}
                  onChange={(e) =>
                    setNewItem((s) => ({ ...s, contactPhoneOrEmail: e.target.value }))
                  }
                />
                <input
                  className="input"
                  style={{ gridColumn: "1 / -1" }}
                  placeholder="Notes (optional)"
                  value={newItem.notes || ""}
                  onChange={(e) => setNewItem((s) => ({ ...s, notes: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Follow up every</span>
                  <input
                    className="input"
                    style={{ width: "6rem" }}
                    type="number"
                    min={3}
                    max={60}
                    value={Number(newItem.followUpEveryDays || 14)}
                    onChange={(e) =>
                      setNewItem((s) => ({ ...s, followUpEveryDays: Number(e.target.value) }))
                    }
                  />
                  <span className="text-xs text-slate-600">days</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={addWaitlistItem}
                >
                  Add
                </button>
              </div>

              <div className="space-y-sm" style={{ marginTop: "1rem" }}>
                {waitlist.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No items yet. Add one above to track follow-ups.
                  </p>
                ) : (
                  waitlist.map((w) => {
                    const last = w.lastFollowUp || "—";
                    const due = w.lastFollowUp
                      ? daysBetween(w.lastFollowUp, todayISO()) >= w.followUpEveryDays
                      : daysBetween(w.dateApplied, todayISO()) >= w.followUpEveryDays;

                    return (
                      <div
                        key={w.id}
                        className="waitlist-item"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="waitlist-item-content">
                            <div className="flex flex-wrap items-center gap-2">
                              <b>{w.facility}</b>
                              {due ? (
                                <span className="badge badge-amber">
                                  Follow-up due
                                </span>
                              ) : (
                                <span className="badge badge-slate">
                                  Tracking
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600" style={{ marginTop: "0.25rem" }}>
                              Applied: {w.dateApplied} · Last follow-up: {last} · Interval:{" "}
                              {w.followUpEveryDays}d
                            </div>
                            {(w.contactName || w.contactPhoneOrEmail) && (
                              <div className="text-xs text-slate-600" style={{ marginTop: "0.25rem" }}>
                                Contact: {w.contactName || "—"} · {w.contactPhoneOrEmail || "—"}
                              </div>
                            )}
                            {w.notes ? (
                              <div className="text-sm text-slate-800" style={{ marginTop: "0.5rem" }}>{w.notes}</div>
                            ) : null}
                          </div>
                          <div className="waitlist-item-actions">
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => markFollowedUp(w.id)}
                            >
                              Mark followed up
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => removeItem(w.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            <footer className="footer">
              Data is stored locally in your browser (no server).
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-2-col">{children}</div>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field-label">{label}</label>
      {children}
    </div>
  );
}
