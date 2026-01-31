import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getTranslations, type Language } from "./i18n";

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
const LANGUAGE_KEY = "scg_language";

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

function buildRecommendation(a: Assessment, t: ReturnType<typeof getTranslations>): Recommendation {
  // Guardrail: this MVP is Ontario-only, but still works elsewhere with a note.
  const provinceNote =
    a.province !== "ON"
      ? [t.provinceNote]
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
    reason.push(t.dailyLivingSupportSignificant);
    if (a.cognitive !== "None") reason.push(t.cognitiveConcernsIncrease);
    if (a.assessed !== "Yes")
      reason.push(t.formalAssessmentHelp);
    cautions.push(t.waitTimesCanBeLong);
  } else if (moderateNeed) {
    // Choose between Home Care and Retirement Home based on budget + ADL
    if (a.adl === "SomeHelp" && (a.budget === "Mid" || a.budget === "High")) {
      path = "Retirement Home";
      reason.push(t.someHelpNeeded);
      reason.push(t.retirementHomeCovers);
      if (a.cognitive === "Mild") cautions.push(t.askAboutMemoryCare);
    } else {
      path = "Home Care";
      reason.push(t.needsModerate);
      reason.push(t.startingWithHomeCare);
    }
  } else {
    path = "Home Care";
    reason.push(t.mostlyIndependent);
    reason.push(t.homeCareLeastDisruptive);
  }

  // Ontario-focused next steps
  const nextStepsCommon = [
    t.createOnePageSummary,
    t.collectKeyDocuments,
    t.writeDown3Goals,
  ];

  const nextStepsON = {
    "Home Care": [
      t.contactOntarioHealth,
      t.bookFamilyDoctor,
      t.exploreInterimOptions,
    ],
    "Retirement Home": [
      t.shortlistRetirementHomes,
      t.askAboutCosts,
      t.planTransition,
    ],
    "Long-Term Care (LTC)": [
      t.askAboutLTCProcess,
      t.prepareForWaitTimes,
      t.makeShortlistLTC,
    ],
  } as const;

  const budgetHint =
    a.budget === "Low"
      ? [t.budgetNote]
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

function getCarePathLabel(path: CarePath, t: ReturnType<typeof getTranslations>): string {
  if (path === "Long-Term Care (LTC)") return t.longTermCare;
  if (path === "Retirement Home") return t.retirementHome;
  return t.homeCare;
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return (saved === "zh" || saved === "en") ? saved : "en";
    } catch {
      return "en";
    }
  });

  const t = useMemo(() => getTranslations(language), [language]);

  const [step, setStep] = useState<"Assess" | "Result">("Assess");

  const [assessment, setAssessment] = useState<Assessment>({
    province: "ON",
    age: "70to79",
    adl: "SomeHelp",
    cognitive: "None",
    assessed: "NotSure",
    budget: "PreferNot",
  });

  const rec = useMemo(() => buildRecommendation(assessment, t), [assessment, t]);

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

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {}
  }, [language]);

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
              <h1 className="header-title">{t.appTitle}</h1>
              <p className="header-subtitle">
                {t.appSubtitle}
              </p>
            </div>
            <div className="nav-buttons">
              <button
                className={`nav-button ${step === "Assess" ? "active" : ""}`}
                onClick={() => setStep("Assess")}
              >
                {t.assessment}
              </button>
              <button
                className={`nav-button ${step === "Result" ? "active" : ""}`}
                onClick={() => setStep("Result")}
              >
                {t.results}
              </button>
              <button
                className="nav-button"
                onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                title={t.language}
              >
                {language === "en" ? "中文" : "English"}
              </button>
            </div>
          </div>
        </header>

        {step === "Assess" ? (
          <div className="space-y">
            <Card title={t.quickAssessment}>
              <Grid>
                <Field label={t.province} htmlFor="province">
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
                    <option value="ON">{t.ontario}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </Field>

                <Field label={t.ageRange} htmlFor="age">
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
                    <option value="Under70">{t.under70}</option>
                    <option value="70to79">{t.age70to79}</option>
                    <option value="80plus">{t.age80plus}</option>
                  </select>
                </Field>

                <Field label={t.dailyActivities} htmlFor="adl">
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
                    <option value="Independent">{t.independent}</option>
                    <option value="SomeHelp">{t.needsSomeHelp}</option>
                    <option value="NeedsDailyHelp">{t.needsDailyHelp}</option>
                  </select>
                </Field>

                <Field label={t.cognitiveConcerns} htmlFor="cognitive">
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
                    <option value="None">{t.none}</option>
                    <option value="Mild">{t.mildConcerns}</option>
                    <option value="Diagnosed">{t.diagnosedCondition}</option>
                  </select>
                </Field>

                <Field label={t.formalAssessment} htmlFor="assessed">
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
                    <option value="Yes">{t.yes}</option>
                    <option value="No">{t.no}</option>
                    <option value="NotSure">{t.notSure}</option>
                  </select>
                </Field>

                <Field label={t.budget} htmlFor="budget">
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
                    <option value="PreferNot">{t.preferNotToSay}</option>
                    <option value="Low">{t.lowerBudget}</option>
                    <option value="Mid">{t.midBudget}</option>
                    <option value="High">{t.higherBudget}</option>
                  </select>
                </Field>
              </Grid>

              <div className="flex items-center justify-between" style={{ marginTop: "1rem" }}>
                <p className="text-xs text-slate-500">
                  {t.notMedicalAdvice}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep("Result")}
                >
                  {t.seeResults}
                </button>
              </div>
            </Card>

            <Card title={t.preview}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${badgeClass(rec.path)}`}>{getCarePathLabel(rec.path, t)}</span>
                <span className="text-sm text-slate-600">
                  {t.basedOnAnswers}
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
            <Card title={t.recommendedCarePath}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${badgeClass(rec.path)}`}>{getCarePathLabel(rec.path, t)}</span>
                {rec.cautions?.length ? (
                  <span className="badge badge-slate">
                    {language === "en" ? "Note: " : "注意："}{rec.cautions[0]}
                  </span>
                ) : null}
              </div>

              <h3 className="font-semibold text-sm" style={{ marginTop: "1rem" }}>{t.whyRecommendation}</h3>
              <ul className="list-disc text-sm" style={{ marginTop: "0.5rem" }}>
                {rec.reason.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              {rec.cautions?.length ? (
                <>
                  <h3 className="font-semibold text-sm" style={{ marginTop: "1rem" }}>{t.thingsToKeepInMind}</h3>
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
                  {t.editAnswers}
                </button>
              </div>
            </Card>

            <Card title={t.next14DaysChecklist}>
              <ol className="list-ordered text-sm">
                {rec.nextSteps.map((s, i) => (
                  <li key={i}>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title={t.waitlistNotes}>
              {dueItems.length ? (
                <div className="alert alert-amber" style={{ marginBottom: "0.75rem" }}>
                  <b>{dueItems.length}</b> {t.itemsDueForFollowup}
                </div>
              ) : null}

              <div className="grid grid-2-col gap-2">
                <input
                  className="input"
                  placeholder={`${t.facilityName} (${t.required})`}
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
                  placeholder={`${t.contactName} (${t.optional})`}
                  value={newItem.contactName || ""}
                  onChange={(e) => setNewItem((s) => ({ ...s, contactName: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder={`${t.phoneOrEmail} (${t.optional})`}
                  value={newItem.contactPhoneOrEmail || ""}
                  onChange={(e) =>
                    setNewItem((s) => ({ ...s, contactPhoneOrEmail: e.target.value }))
                  }
                />
                <input
                  className="input"
                  style={{ gridColumn: "1 / -1" }}
                  placeholder={`${t.notes} (${t.optional})`}
                  value={newItem.notes || ""}
                  onChange={(e) => setNewItem((s) => ({ ...s, notes: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">{t.followUpEvery}</span>
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
                  <span className="text-xs text-slate-600">{t.days}</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={addWaitlistItem}
                >
                  {t.add}
                </button>
              </div>

              <div className="space-y-sm" style={{ marginTop: "1rem" }}>
                {waitlist.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    {t.noItemsYet}
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
                                  {t.followUpDue}
                                </span>
                              ) : (
                                <span className="badge badge-slate">
                                  {t.tracking}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600" style={{ marginTop: "0.25rem" }}>
                              {t.applied}: {w.dateApplied} · {t.lastFollowUp}: {last} · {t.interval}:{" "}
                              {w.followUpEveryDays}{language === "en" ? "d" : ""}
                            </div>
                            {(w.contactName || w.contactPhoneOrEmail) && (
                              <div className="text-xs text-slate-600" style={{ marginTop: "0.25rem" }}>
                                {t.contact}: {w.contactName || "—"} · {w.contactPhoneOrEmail || "—"}
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
                              {t.markFollowedUp}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => removeItem(w.id)}
                            >
                              {t.remove}
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
              {t.dataStoredLocally}
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">{children}</div>
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
