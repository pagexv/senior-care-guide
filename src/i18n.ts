export type Language = "en" | "zh";

export type Translations = {
  // Header
  appTitle: string;
  appSubtitle: string;
  assessment: string;
  results: string;
  language: string;
  
  // Assessment form
  quickAssessment: string;
  province: string;
  ageRange: string;
  dailyActivities: string;
  cognitiveConcerns: string;
  formalAssessment: string;
  budget: string;
  notMedicalAdvice: string;
  seeResults: string;
  preview: string;
  basedOnAnswers: string;
  
  // Form options
  ontario: string;
  other: string;
  under70: string;
  age70to79: string;
  age80plus: string;
  independent: string;
  needsSomeHelp: string;
  needsDailyHelp: string;
  none: string;
  mildConcerns: string;
  diagnosedCondition: string;
  yes: string;
  no: string;
  notSure: string;
  preferNotToSay: string;
  lowerBudget: string;
  midBudget: string;
  higherBudget: string;
  
  // Results
  recommendedCarePath: string;
  whyRecommendation: string;
  thingsToKeepInMind: string;
  editAnswers: string;
  next14DaysChecklist: string;
  
  // Care paths
  homeCare: string;
  retirementHome: string;
  longTermCare: string;
  
  // Waitlist
  waitlistNotes: string;
  optional: string;
  itemsDueForFollowup: string;
  facilityName: string;
  required: string;
  dateApplied: string;
  contactName: string;
  phoneOrEmail: string;
  notes: string;
  followUpEvery: string;
  days: string;
  add: string;
  noItemsYet: string;
  addOneToTrack: string;
  followUpDue: string;
  tracking: string;
  applied: string;
  lastFollowUp: string;
  interval: string;
  contact: string;
  markFollowedUp: string;
  remove: string;
  
  // Footer
  dataStoredLocally: string;
  
  // Recommendation reasons (these will be generated dynamically)
  provinceNote: string;
  dailyLivingSupportSignificant: string;
  cognitiveConcernsIncrease: string;
  formalAssessmentHelp: string;
  waitTimesCanBeLong: string;
  someHelpNeeded: string;
  retirementHomeCovers: string;
  askAboutMemoryCare: string;
  needsModerate: string;
  startingWithHomeCare: string;
  mostlyIndependent: string;
  homeCareLeastDisruptive: string;
  budgetNote: string;
  
  // Next steps
  createOnePageSummary: string;
  collectKeyDocuments: string;
  writeDown3Goals: string;
  contactOntarioHealth: string;
  bookFamilyDoctor: string;
  exploreInterimOptions: string;
  shortlistRetirementHomes: string;
  askAboutCosts: string;
  planTransition: string;
  askAboutLTCProcess: string;
  prepareForWaitTimes: string;
  makeShortlistLTC: string;
};

const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Ontario Senior Care Guide",
    appSubtitle: "A simple, explainable decision helper for families.",
    assessment: "Assessment",
    results: "Results",
    language: "Language",
    
    quickAssessment: "Quick Care Assessment (2 minutes)",
    province: "Province",
    ageRange: "Age range",
    dailyActivities: "Daily activities (bathing, dressing, eating)",
    cognitiveConcerns: "Memory / cognitive concerns",
    formalAssessment: "Has there been a formal needs assessment?",
    budget: "Budget (optional)",
    notMedicalAdvice: "This is not medical advice. It's a planning helper.",
    seeResults: "See results →",
    preview: "Preview (live)",
    basedOnAnswers: "Based on your current answers",
    
    ontario: "Ontario",
    other: "Other",
    under70: "Under 70",
    age70to79: "70–79",
    age80plus: "80+",
    independent: "Independent",
    needsSomeHelp: "Needs some help",
    needsDailyHelp: "Needs daily help/supervision",
    none: "None",
    mildConcerns: "Mild concerns",
    diagnosedCondition: "Diagnosed condition",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    preferNotToSay: "Prefer not to say",
    lowerBudget: "Lower budget",
    midBudget: "Mid budget",
    higherBudget: "Higher budget",
    
    recommendedCarePath: "Your recommended care path",
    whyRecommendation: "Why this recommendation",
    thingsToKeepInMind: "Things to keep in mind",
    editAnswers: "← Edit answers",
    next14DaysChecklist: "Next 14 days checklist",
    
    homeCare: "Home Care",
    retirementHome: "Retirement Home",
    longTermCare: "Long-Term Care (LTC)",
    
    waitlistNotes: "Waitlist notes (optional)",
    optional: "optional",
    itemsDueForFollowup: "item(s) may be due for follow-up today.",
    facilityName: "Facility name",
    required: "required",
    dateApplied: "Date applied",
    contactName: "Contact name",
    phoneOrEmail: "Phone or email",
    notes: "Notes",
    followUpEvery: "Follow up every",
    days: "days",
    add: "Add",
    noItemsYet: "No items yet. Add one above to track follow-ups.",
    addOneToTrack: "Add one above to track follow-ups.",
    followUpDue: "Follow-up due",
    tracking: "Tracking",
    applied: "Applied",
    lastFollowUp: "Last follow-up",
    interval: "Interval",
    contact: "Contact",
    markFollowedUp: "Mark followed up",
    remove: "Remove",
    
    dataStoredLocally: "Data is stored locally in your browser (no server).",
    
    provinceNote: "This MVP is Ontario-focused. If you're outside Ontario, the care categories still apply, but the system steps will differ.",
    dailyLivingSupportSignificant: "Daily living support needs appear significant (mobility, personal care, or supervision).",
    cognitiveConcernsIncrease: "Cognitive concerns increase care complexity.",
    formalAssessmentHelp: "A formal needs assessment/referral will help start LTC-related processes.",
    waitTimesCanBeLong: "Wait times can be long; start early and consider interim support.",
    someHelpNeeded: "Some help is needed, but not necessarily 24/7 clinical care.",
    retirementHomeCovers: "A retirement home can cover meals, housekeeping, and support services.",
    askAboutMemoryCare: "Ask specifically about memory care options.",
    needsModerate: "Needs appear moderate and may be supported at home with services.",
    startingWithHomeCare: "Starting with home care can reduce urgency while options are explored.",
    mostlyIndependent: "Based on your inputs, your parent appears mostly independent right now.",
    homeCareLeastDisruptive: "Home care + community support is often the least disruptive first step.",
    budgetNote: "Budget note: prioritize publicly supported options and ask about subsidies, eligibility, and community programs.",
    
    createOnePageSummary: "Create a one-page summary: diagnoses, medications, mobility, recent hospital visits, and your top concerns.",
    collectKeyDocuments: "Collect key documents: health card, ID, medication list, and a brief medical history.",
    writeDown3Goals: "Write down 3 realistic goals (e.g., safe bathing, meals, supervision, medication adherence).",
    contactOntarioHealth: "Contact Ontario Health atHome (formerly Home and Community Care) to ask about home care assessment/services.",
    bookFamilyDoctor: "Book a family doctor appointment to discuss support needs and referrals (OT/PT, home care).",
    exploreInterimOptions: "Explore interim options: personal support worker (PSW), meal delivery, adult day programs.",
    shortlistRetirementHomes: "Shortlist 5–10 nearby retirement homes; schedule tours (in person or virtual).",
    askAboutCosts: "Ask about: monthly cost breakdown, care packages, staffing, medication help, emergency response, and memory care.",
    planTransition: "Plan a transition: trial stays (if available), move-in checklist, and safety review of current home.",
    askAboutLTCProcess: "Ask a hospital social worker or family doctor about starting an LTC application/assessment process in Ontario.",
    prepareForWaitTimes: "Prepare for wait times: arrange interim support (home care, retirement home, short-stay respite).",
    makeShortlistLTC: "Make a shortlist of LTC homes and track communications carefully (dates, contacts, follow-ups).",
  },
  zh: {
    appTitle: "安大略省长者护理指南",
    appSubtitle: "为家庭提供简单易懂的决策辅助工具。",
    assessment: "评估",
    results: "结果",
    language: "语言",
    
    quickAssessment: "快速护理评估（2分钟）",
    province: "省份",
    ageRange: "年龄范围",
    dailyActivities: "日常活动（洗澡、穿衣、进食）",
    cognitiveConcerns: "记忆/认知问题",
    formalAssessment: "是否已进行正式需求评估？",
    budget: "预算（可选）",
    notMedicalAdvice: "这不是医疗建议。这是一个规划辅助工具。",
    seeResults: "查看结果 →",
    preview: "预览（实时）",
    basedOnAnswers: "基于您当前的答案",
    
    ontario: "安大略省",
    other: "其他",
    under70: "70岁以下",
    age70to79: "70-79岁",
    age80plus: "80岁以上",
    independent: "独立",
    needsSomeHelp: "需要一些帮助",
    needsDailyHelp: "需要日常帮助/监督",
    none: "无",
    mildConcerns: "轻微担忧",
    diagnosedCondition: "已确诊疾病",
    yes: "是",
    no: "否",
    notSure: "不确定",
    preferNotToSay: "不想说",
    lowerBudget: "较低预算",
    midBudget: "中等预算",
    higherBudget: "较高预算",
    
    recommendedCarePath: "您推荐的护理路径",
    whyRecommendation: "推荐理由",
    thingsToKeepInMind: "注意事项",
    editAnswers: "← 编辑答案",
    next14DaysChecklist: "未来14天清单",
    
    homeCare: "居家护理",
    retirementHome: "退休之家",
    longTermCare: "长期护理（LTC）",
    
    waitlistNotes: "候补名单记录（可选）",
    optional: "可选",
    itemsDueForFollowup: "项可能需要在今天跟进。",
    facilityName: "机构名称",
    required: "必填",
    dateApplied: "申请日期",
    contactName: "联系人姓名",
    phoneOrEmail: "电话或电子邮件",
    notes: "备注",
    followUpEvery: "每",
    days: "天跟进一次",
    add: "添加",
    noItemsYet: "暂无项目。请在上方添加以跟踪跟进情况。",
    addOneToTrack: "请在上方添加以跟踪跟进情况。",
    followUpDue: "需要跟进",
    tracking: "跟踪中",
    applied: "申请日期",
    lastFollowUp: "最后跟进",
    interval: "间隔",
    contact: "联系人",
    markFollowedUp: "标记已跟进",
    remove: "删除",
    
    dataStoredLocally: "数据存储在您的浏览器本地（无服务器）。",
    
    provinceNote: "此MVP专注于安大略省。如果您在安大略省以外，护理类别仍然适用，但系统步骤会有所不同。",
    dailyLivingSupportSignificant: "日常生活支持需求似乎很重要（行动能力、个人护理或监督）。",
    cognitiveConcernsIncrease: "认知问题增加了护理的复杂性。",
    formalAssessmentHelp: "正式的需求评估/转介将有助于启动LTC相关流程。",
    waitTimesCanBeLong: "等待时间可能很长；请尽早开始并考虑临时支持。",
    someHelpNeeded: "需要一些帮助，但不一定需要24/7临床护理。",
    retirementHomeCovers: "退休之家可以提供膳食、家政和支持服务。",
    askAboutMemoryCare: "请具体询问记忆护理选项。",
    needsModerate: "需求似乎适中，可以通过服务在家中提供支持。",
    startingWithHomeCare: "从居家护理开始可以减少紧迫性，同时探索其他选择。",
    mostlyIndependent: "根据您的输入，您的父母目前似乎基本独立。",
    homeCareLeastDisruptive: "居家护理+社区支持通常是最不具破坏性的第一步。",
    budgetNote: "预算提示：优先考虑公共支持选项，并询问补贴、资格和社区计划。",
    
    createOnePageSummary: "创建一页摘要：诊断、药物、行动能力、最近的医院就诊和您的主要担忧。",
    collectKeyDocuments: "收集关键文件：健康卡、身份证、药物清单和简要病史。",
    writeDown3Goals: "写下3个现实的目标（例如：安全洗澡、膳食、监督、药物依从性）。",
    contactOntarioHealth: "联系安大略省健康居家（原家庭和社区护理）询问居家护理评估/服务。",
    bookFamilyDoctor: "预约家庭医生讨论支持需求和转介（职业治疗/物理治疗、居家护理）。",
    exploreInterimOptions: "探索临时选项：个人支持工作者（PSW）、送餐服务、成人日间项目。",
    shortlistRetirementHomes: "列出5-10个附近的退休之家；安排参观（面对面或虚拟）。",
    askAboutCosts: "询问：月度成本明细、护理套餐、人员配置、药物帮助、紧急响应和记忆护理。",
    planTransition: "规划过渡：试用住宿（如有）、入住清单和当前家庭的安全审查。",
    askAboutLTCProcess: "向医院社工或家庭医生询问在安大略省启动LTC申请/评估流程。",
    prepareForWaitTimes: "为等待时间做准备：安排临时支持（居家护理、退休之家、短期暂托）。",
    makeShortlistLTC: "列出LTC之家清单，仔细跟踪沟通（日期、联系人、跟进）。",
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
