export type Locale = "en" | "ar";

export const company = {
  name: "SarjHR",
  owner: "MTGroup",
  registration: "7009568390",
  website: "https://sarj.sa",
  login: "https://app.sarj.sa",
  care: "customercare@sarj.sa",
  support: "support@sarj.sa",
  // Phone placeholder supplied for the UI; replace with the published number.
  phone: "+966 54 000 0000",
  profile: "/downloads/sarj-company-profile.pdf",
  demo: "mailto:customercare@sarj.sa?subject=SARJ%20demo%20request",
};

// Source of truth: docs/ref/SarjHR-Profile-EN (1).pdf, Company Profile 2026.
// About, vision and mission: p. 3; differentiators: p. 4; modules: p. 5;
// integrations: p. 6; onboarding and audiences: p. 7; contact and demos: p. 8.
// Keep English and Arabic claims aligned; expand only about, vision and mission.
// Illustrative product data is not a customer result.
export const content = {
  en: {
    nav: {
      workspace: "Workspace",
      workflows: "Workflows",
      platform: "Platform",
      why: "Why SARJ",
      integrations: "Integrations",
      start: "Getting started",
      about: "About SARJ",
      team: "For your team",
      faq: "FAQs",
      contact: "Contact",
      login: "Log in",
      demo: "Request a demo",
      menu: "Open navigation",
      close: "Close navigation",
      menuDescription: "Explore the SARJ HR and payroll platform.",
    },
    hero: {
      eyebrow: "HR & PAYROLL, BUILT IN SAUDI",
      first: "Manage your people",
      second: "and payroll.",
      tagline: "One cloud platform.",
      description:
        "Attendance, leave, payroll and employee self-service for Saudi organisations. Arabic-first, with full English support.",
      secondary: "Explore the modules",
      workspaceLink: "Explore the workspace",
      workspaceDescription: "Try attendance, leave and payroll with sample data.",
    },
    about: {
      eyebrow: "05 / ABOUT SARJ",
      first: "Built in Saudi Arabia.",
      second: "",
      description: [
        "SARJ is a cloud HR and payroll platform developed by MTGroup in Saudi Arabia. It supports the full employee lifecycle, from hiring to end of service, with employee information kept in one place.",
        "Attendance, leave, payroll, performance and employee documents work together, with mobile self-service for employees. Government integrations keep data current and support compliance with Saudi labour regulations.",
      ],
      vision: "Our vision",
      visionText: [
        "Our vision is for SARJ to be the first choice of Saudi organisations for HR and payroll.",
        "We aim to make employee lifecycle management simpler through one platform built around local regulations, Arabic users and everyday access.",
      ],
      mission: "Our mission",
      missionText: [
        "Our mission is to simplify and automate HR work in line with Saudi labour regulations.",
        "We bring daily tasks, payroll approvals and employee services together, with government integrations that reduce duplicate data entry and help teams manage their obligations.",
      ],
      profile: "Read the company profile",
    },
    features: {
      eyebrow: "02 / CORE CAPABILITIES",
      first: "Six modules.",
      second: "One platform.",
      description:
        "Manage daily HR tasks from check-in to payday.",
      tag: "Drag or swipe to explore",
      explore: "Try the workspace",
      solutionLabel: "SARJ / HR & PAYROLL",
      items: [
        {
          chapter: "Payroll",
          summary: "Calculate, approve and transfer salaries.",
          title: "From calculation to transfer.",
          details: [
            "Automatic salaries, allowances and deductions",
            "Electronic payroll approvals",
            "Wage transfers through WPS",
          ],
          description:
            "Move payroll from automatic calculation to electronic approval and WPS transfer.",
          label: "PAYROLL",
        },
        {
          chapter: "Time & attendance",
          summary: "Track working time across flexible shifts.",
          title: "Keep track of working time.",
          details: [
            "Biometric or geolocation check-in",
            "Flexible shifts",
            "Automatic lateness, absence and overtime tracking",
          ],
          description:
            "Record check-ins and track lateness, absence and overtime automatically across flexible shifts.",
          label: "TIME & ATTENDANCE",
        },
        {
          chapter: "Leave management",
          summary: "Manage time off around your policies.",
          title: "Plan leave with your team.",
          details: [
            "Automatic balances for every leave type",
            "Custom approval chains",
            "Team leave calendar",
          ],
          description:
            "Apply your approval policies and use the team calendar to plan leave with current balances.",
          label: "LEAVE MANAGEMENT",
        },
        {
          chapter: "Employee self-service",
          summary: "Give employees access from their phone.",
          title: "HR services on your phone.",
          details: [
            "Submit HR requests from your phone",
            "View employee records",
            "Access payslips",
          ],
          description:
            "Employees can submit requests and find their records and payslips without chasing paperwork.",
          label: "EMPLOYEE SELF-SERVICE",
        },
        {
          chapter: "Performance",
          summary: "Follow individual and team progress.",
          title: "Review progress against goals.",
          details: [
            "Measurable goals and KPIs",
            "Periodic performance reviews",
            "Individual and team dashboards",
          ],
          description:
            "Use measurable goals, KPIs and periodic reviews to follow performance across people and teams.",
          label: "PERFORMANCE",
        },
        {
          chapter: "Employee records",
          summary: "Keep documents organised and monitor expiry dates.",
          title: "Keep employee documents current.",
          details: [
            "Digital archive for contracts and documents",
            "Alerts before iqamas and documents expire",
            "Employee information in one place",
          ],
          description:
            "Find contracts and documents in a digital archive, with expiry alerts to help you plan renewals.",
          label: "EMPLOYEE FILES",
        },
      ],
      previous: "Previous modules",
      next: "Next modules",
      desktopHint: "Scroll to explore all six modules",
      goTo: "Go to",
      openingHint: "Scroll to discover how it all connects",
      overview: "Back to the overview",
      pauseAnimation: "Pause visual animation",
      resumeAnimation: "Resume visual animation",
    },
    preview: {
      label: "WORKSPACE PREVIEW",
      title: "Explore the workspace.",
      sample: "Illustrative workspace · sample data",
      sidebar: "Workspace",
      dashboard: "Overview",
      attendance: "Attendance",
      leave: "Leave",
      payroll: "Payroll",
      performance: "Performance",
      files: "Employee files",
      greeting: "Hello, Reem",
      subtitle: "Your team, at a glance.",
      role: "HR Manager",
      employees: "Employees",
      present: "Present today",
      onLeave: "On leave",
      requests: "Pending requests",
      trend: "Attendance overview",
      week: "This week",
      activity: "Recent requests",
      person: "Employee",
      type: "Request",
      status: "Status",
      approved: "Approved",
      pending: "Pending",
      review: "Review request",
      approve: "Approve",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
      names: ["Reem A.", "Khalid M.", "Noura S."],
      requestTypes: ["Annual leave", "Document request", "Payslip request"],
      attendanceTitle: "Time & attendance",
      attendanceDescription: "Shifts and check-ins, at a glance.",
      checkin: "Check-in",
      shift: "Shift",
      regular: "Regular shift",
      checkedIn: "Checked in",
      leaveTitle: "Leave requests",
      leaveDescription:
        "Review requests and leave balances.",
      balance: "Annual leave balance",
      leaveDays: "days available",
      payrollTitle: "Payroll overview",
      payrollDescription: "Calculate and approve salaries.",
      performanceDescription: "Review goals, KPIs and team progress.",
      filesDescription: "Find employee documents and expiry alerts.",
      month: "Sample payroll cycle",
      salary: "Basic salaries",
      allowance: "Allowances",
      deductions: "Deductions",
      total: "Net payroll",
      ready: "Ready for review",
      payslip: "Sample payslip",
      illustration: "Illustrative workspace · sample data",
      leaveRequest: "Annual leave request",
      requestDetail: "Sample request · Reem A. · 3 days",
      approvedNotice: "Sample request approved",
      documents: "Documents",
      connected: "Connected",
      viewSample: "Try approving a sample request",
      dialogDescription:
        "Try an approval using sample data. Changes stay in this preview.",
      close: "Close",
      reset: "Reset sample",
    },
    integrations: {
      eyebrow: "03 / GOVERNMENT INTEGRATIONS",
      first: "Government integrations.",
      second: "",
      description:
        "Keep data current across official platforms without duplicate entry.",
      items: [
        {
          name: "Mudad",
          arabic: "مدد",
          label: "WAGE PROTECTION",
          description: "Salary transfers and Wage Protection System checks.",
        },
        {
          name: "GOSI",
          arabic: "التأمينات الاجتماعية",
          label: "SOCIAL INSURANCE",
          description: "Automatic social-insurance contribution calculations.",
        },
        {
          name: "Muqeem",
          arabic: "مقيم",
          label: "IQAMAS & WORK PERMITS",
          description: "Iqama and work-permit validity tracking.",
        },
      ],
      footer: "Automatic data updates. No duplicate entry.",
      note: "Platform integrations described in the SARJ company profile.",
    },
    people: {
      eyebrow: "06 / FOR YOUR TEAM",
      first: "For every role.",
      second: "",
      description: "",
      tabs: ["HR managers", "Finance teams", "Employees"],
      panels: [
        {
          title: "See the full HR picture.",
          description:
            "Bring your people, attendance and requests into one clear view. Track who's at work, approve leave and stay ahead of expiring documents, so you can give your team more attention.",
        },
        {
          title: "Keep payroll moving.",
          description:
            "Move from salary calculations to electronic approvals and WPS transfers in one connected workflow. Review payroll and access the reports you need, with every step in view.",
        },
        {
          title: "Handle HR from your phone.",
          description:
            "Put everyday HR services within reach. Request leave, check your payslips and find your employee records from your phone, with everything you need in one place.",
        },
      ],
      phone: {
        greeting: "Hello, Reem",
        role: "Your employee workspace",
        leave: "Leave balance",
        days: "days",
        requests: "My requests",
        payslip: "My payslips",
        records: "My records",
        annual: "Annual leave",
        approved: "Approved",
        download: "Payslip available",
        label: "Illustrative employee view",
        status: "All in one place",
      },
    },
    why: {
      eyebrow: "04 / WHY SARJ",
      first: "Built for Saudi organisations.",
      second: "",
      description:
        "Local regulations, language and access built in.",
      progress: "The SARJ difference",
      items: [
        {
          title: "Arabic-first",
          text: "Designed for Arabic users, with full English support.",
        },
        {
          title: "Saudi by design",
          text: "Built on Saudi Labour Law and WPS requirements.",
        },
        {
          title: "Cloud & mobile",
          text: "Access from your browser or phone.",
        },
        {
          title: "Live in days",
          text: "Our team handles data migration and setup.",
        },
      ],
    },
    onboarding: {
      eyebrow: "07 / GETTING STARTED",
      first: "Get started in three steps.",
      second: "",
      action: "Discuss your setup",
      progress: "Onboarding progress",
      progressLabels: ["Your data", "Your policies", "Go live"],
      description:
        "Our team handles data migration and setup.",
      steps: [
        {
          title: "Import employee data.",
          description:
            "Import from Excel or your current system. We map your data.",
        },
        {
          title: "Set your policies.",
          description:
            "Define shifts, leave types, approval chains and payroll items.",
        },
        {
          title: "Go live.",
          description:
            "Employees use the app; HR and finance use the dashboard.",
        },
      ],
      supportTitle: "Need help?",
      supportText:
        "Contact customer care or technical support.",
      care: "Customer care",
      support: "Technical support",
    },
    faq: {
      eyebrow: "COMMON QUESTIONS",
      title: "Before you start.",
      items: [
        {
          question: "Can we bring our existing employee data?",
          answer:
            "Yes. Our team imports and maps data from Excel or your current system.",
        },
        {
          question: "Does SARJ support Arabic and English?",
          answer: "Yes. SARJ is Arabic-first, with full English support.",
        },
        {
          question: "Do we need to install software?",
          answer:
            "No. SARJ is cloud-based, with browser and mobile access.",
        },
        {
          question: "Can we see a demo with our own data?",
          answer:
            "Yes. Customer care can arrange a demo using your company data.",
        },
      ],
    },
    contact: {
      eyebrow: "YOUR NEXT STEP",
      first: "See SARJ",
      second: "with your data.",
      description:
        "Request a demo or contact our team with a question.",
      demo: "Request a demo",
      email: "Email our team",
      support: "Already using SARJ?",
      supportLink: "Contact technical support",
      download: "Download company profile",
    },
    footer: {
      description: "Saudi cloud HR & payroll.",
      platform: "Platform",
      company: "Company",
      connect: "Get in touch",
      about: "About SARJ",
      profile: "Company profile",
      support: "Technical support",
      care: "Customer care",
      owner: "A product of MTGroup",
      cr: "CR",
      rights: "All rights reserved.",
      country: "Made in Saudi Arabia",
      top: "Back to top",
      skip: "Skip to content",
    },
  },
  ar: {
    nav: {
      workspace: "مساحة العمل",
      workflows: "مسارات العمل",
      platform: "المنصة",
      why: "لماذا سرج",
      integrations: "التكاملات",
      start: "ابدأ مع سرج",
      about: "عن سرج",
      team: "لفريقك",
      faq: "الأسئلة الشائعة",
      contact: "تواصل معنا",
      login: "تسجيل الدخول",
      demo: "اطلب عرضًا تجريبيًا",
      menu: "فتح قائمة التنقل",
      close: "إغلاق قائمة التنقل",
      menuDescription: "اكتشف منصة سرج للموارد البشرية والرواتب.",
    },
    hero: {
      eyebrow: "موارد بشرية ورواتب، صُنعت في السعودية",
      first: "أدر موظفيك",
      second: "ورواتبك.",
      tagline: "منصة سحابية واحدة.",
      description:
        "الحضور والإجازات والرواتب والخدمة الذاتية للموظفين للمنشآت السعودية. مصممة للعربية، مع دعم كامل للإنجليزية.",
      secondary: "استكشف الوحدات",
      workspaceLink: "استكشف مساحة العمل",
      workspaceDescription: "جرّب الحضور والإجازات والرواتب ببيانات تجريبية.",
    },
    about: {
      eyebrow: "05 / عن سرج",
      first: "طُوّرت في السعودية.",
      second: "",
      description: [
        "سرج منصة سحابية للموارد البشرية والرواتب طوّرتها MTGroup في السعودية. تدعم دورة حياة الموظف كاملة، من التوظيف إلى نهاية الخدمة، وتجمع معلومات الموظفين في مكان واحد.",
        "تربط المنصة الحضور والإجازات والرواتب والأداء ووثائق الموظفين، وتتيح لهم الخدمة الذاتية من الجوال. وتحافظ التكاملات الحكومية على تحديث البيانات وتدعم الالتزام بأنظمة العمل السعودية.",
      ],
      vision: "رؤيتنا",
      visionText: [
        "رؤيتنا أن تكون سرج الخيار الأول للمنشآت السعودية في إدارة الموارد البشرية والرواتب.",
        "نطمح إلى تبسيط إدارة دورة حياة الموظف عبر منصة واحدة تراعي الأنظمة المحلية واحتياجات المستخدم العربي وسهولة الوصول اليومي.",
      ],
      mission: "رسالتنا",
      missionText: [
        "رسالتنا تبسيط أعمال الموارد البشرية وأتمتتها بما يتوافق مع أنظمة العمل السعودية.",
        "نجمع المهام اليومية واعتماد الرواتب وخدمات الموظفين، مع تكاملات حكومية تقلّل تكرار إدخال البيانات وتساعد الفرق على إدارة التزاماتها.",
      ],
      profile: "اقرأ الملف التعريفي",
    },
    features: {
      eyebrow: "02 / إمكانات المنصة",
      first: "ست وحدات.",
      second: "منصة واحدة.",
      description:
        "أدر مهام الموارد البشرية اليومية من تسجيل الحضور إلى صرف الرواتب.",
      tag: "اسحب لاستكشاف الوحدات",
      explore: "جرّب مساحة العمل",
      solutionLabel: "سرج / الموارد البشرية والرواتب",
      items: [
        {
          chapter: "الرواتب",
          summary: "احتسب الرواتب واعتمدها وحوّلها.",
          title: "من الاحتساب إلى التحويل.",
          details: [
            "احتساب تلقائي للرواتب والبدلات والخصومات",
            "اعتماد الرواتب إلكترونيًا",
            "تحويل الأجور عبر نظام حماية الأجور",
          ],
          description:
            "أكمل دورة الرواتب من الاحتساب التلقائي إلى الاعتماد الإلكتروني والتحويل عبر نظام حماية الأجور.",
          label: "الرواتب",
        },
        {
          chapter: "الحضور والانصراف",
          summary: "تابع ساعات العمل عبر ورديات مرنة.",
          title: "تابع وقت العمل.",
          details: [
            "تسجيل الحضور بالبصمة أو الموقع",
            "ورديات مرنة",
            "تتبع تلقائي للتأخير والغياب والعمل الإضافي",
          ],
          description:
            "سجّل الحضور وتابع التأخير والغياب والعمل الإضافي تلقائيًا عبر ورديات مرنة.",
          label: "الحضور والانصراف",
        },
        {
          chapter: "إدارة الإجازات",
          summary: "أدر الإجازات وفق سياسات منشأتك.",
          title: "خطط لإجازات فريقك.",
          details: [
            "أرصدة تلقائية لكل نوع إجازة",
            "مسارات اعتماد مخصّصة",
            "تقويم إجازات الفريق",
          ],
          description:
            "طبّق سياسات الاعتماد واستخدم تقويم الفريق لتخطيط الإجازات بأرصدة محدّثة.",
          label: "إدارة الإجازات",
        },
        {
          chapter: "الخدمة الذاتية",
          summary: "أتِح للموظفين الوصول من الجوال.",
          title: "خدمات الموظف من الجوال.",
          details: [
            "تقديم الطلبات من الجوال",
            "الاطلاع على السجلات الوظيفية",
            "الوصول إلى قسائم الرواتب",
          ],
          description: "يستطيع الموظفون تقديم الطلبات والعثور على سجلاتهم وقسائم رواتبهم دون ملاحقة الأوراق.",
          label: "الخدمة الذاتية للموظف",
        },
        {
          chapter: "الأداء",
          summary: "تابع تقدّم الأفراد والفرق.",
          title: "راجع التقدّم نحو الأهداف.",
          details: [
            "أهداف قابلة للقياس ومؤشرات أداء",
            "تقييمات دورية للأداء",
            "لوحات متابعة للأفراد والفرق",
          ],
          description:
            "استخدم أهدافًا قابلة للقياس ومؤشرات أداء وتقييمات دورية لمتابعة أداء الأفراد والفرق.",
          label: "الأداء",
        },
        {
          chapter: "ملفات الموظفين",
          summary: "نظّم الوثائق وتابع تواريخ انتهائها.",
          title: "حافظ على تحديث وثائق الموظفين.",
          details: [
            "أرشيف رقمي للعقود والمستندات",
            "تنبيهات قبل انتهاء الإقامات والوثائق",
            "معلومات الموظفين مرتبة في مكان واحد",
          ],
          description:
            "اعثر على العقود والمستندات في أرشيف رقمي، مع تنبيهات انتهاء تساعدك على التخطيط للتجديدات.",
          label: "ملفات الموظفين",
        },
      ],
      previous: "الوحدات السابقة",
      next: "الوحدات التالية",
      desktopHint: "مرّر لاستكشاف الوحدات الست",
      goTo: "انتقل إلى",
      openingHint: "مرّر لتكتشف كيف تعمل معًا",
      overview: "العودة إلى النظرة العامة",
      pauseAnimation: "إيقاف الحركة المرئية مؤقتًا",
      resumeAnimation: "استئناف الحركة المرئية",
    },
    preview: {
      label: "نظرة على مساحة العمل",
      title: "استكشف مساحة العمل.",
      sample: "مساحة عمل توضيحية · بيانات تجريبية",
      sidebar: "مساحة العمل",
      dashboard: "نظرة عامة",
      attendance: "الحضور",
      leave: "الإجازات",
      payroll: "الرواتب",
      performance: "الأداء",
      files: "ملفات الموظفين",
      greeting: "مرحبًا، ريم",
      subtitle: "فريقك، بنظرة واحدة.",
      role: "مديرة الموارد البشرية",
      employees: "الموظفون",
      present: "الحاضرون اليوم",
      onLeave: "في إجازة",
      requests: "طلبات معلقة",
      trend: "نظرة على الحضور",
      week: "هذا الأسبوع",
      activity: "أحدث الطلبات",
      person: "الموظف",
      type: "الطلب",
      status: "الحالة",
      approved: "معتمد",
      pending: "معلق",
      review: "مراجعة الطلب",
      approve: "اعتماد",
      days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      names: ["ريم أ.", "خالد م.", "نورة س."],
      requestTypes: ["إجازة سنوية", "طلب مستند", "طلب قسيمة راتب"],
      attendanceTitle: "الحضور والانصراف",
      attendanceDescription: "الورديات وتسجيل الحضور، بنظرة واحدة.",
      checkin: "تسجيل الحضور",
      shift: "الوردية",
      regular: "وردية اعتيادية",
      checkedIn: "تم الحضور",
      leaveTitle: "طلبات الإجازة",
      leaveDescription: "راجع الطلبات وأرصدة الإجازات.",
      balance: "رصيد الإجازة السنوية",
      leaveDays: "يومًا متاحًا",
      payrollTitle: "نظرة على الرواتب",
      payrollDescription: "احتسب الرواتب واعتمدها.",
      performanceDescription: "راجع الأهداف ومؤشرات الأداء وتقدّم الفريق.",
      filesDescription: "اعثر على وثائق الموظفين وتنبيهات انتهائها.",
      month: "دورة رواتب تجريبية",
      salary: "الرواتب الأساسية",
      allowance: "البدلات",
      deductions: "الخصومات",
      total: "صافي الرواتب",
      ready: "جاهز للمراجعة",
      payslip: "قسيمة راتب تجريبية",
      illustration: "مساحة عمل توضيحية · بيانات تجريبية",
      leaveRequest: "طلب إجازة سنوية",
      requestDetail: "طلب تجريبي · ريم أ. · 3 أيام",
      approvedNotice: "تم اعتماد الطلب التجريبي",
      documents: "المستندات",
      connected: "متصل",
      viewSample: "جرّب اعتماد طلب تجريبي",
      dialogDescription:
        "جرّب اعتماد طلب ببيانات تجريبية. تبقى التغييرات في هذه المعاينة.",
      close: "إغلاق",
      reset: "إعادة التجربة",
    },
    integrations: {
      eyebrow: "03 / التكاملات الحكومية",
      first: "تكاملات حكومية.",
      second: "",
      description:
        "حافظ على تحديث البيانات عبر المنصات الرسمية دون تكرار إدخالها.",
      items: [
        {
          name: "مدد",
          arabic: "Mudad",
          label: "حماية الأجور",
          description: "تحويل الرواتب والتحقق من نظام حماية الأجور.",
        },
        {
          name: "التأمينات الاجتماعية",
          arabic: "GOSI",
          label: "التأمين الاجتماعي",
          description: "احتساب تلقائي لاشتراكات التأمينات الاجتماعية.",
        },
        {
          name: "مقيم",
          arabic: "Muqeem",
          label: "الإقامات ورخص العمل",
          description: "متابعة صلاحية الإقامات ورخص العمل.",
        },
      ],
      footer: "تحديث تلقائي للبيانات دون تكرار الإدخال.",
      note: "تكاملات المنصة كما وردت في ملف سرج التعريفي.",
    },
    people: {
      eyebrow: "06 / لفريقك كاملًا",
      first: "لكل دور في منشأتك.",
      second: "",
      description: "",
      tabs: ["مديرو الموارد البشرية", "الفرق المالية", "الموظفون"],
      panels: [
        {
          title: "تابع الصورة الكاملة.",
          description:
            "اجمع بيانات الموظفين والحضور والطلبات في رؤية واضحة. تابع الحضور واعتمد الإجازات وتلقَّ تنبيهات قبل انتهاء الوثائق، لتمنح فريقك وقتًا واهتمامًا أكبر.",
        },
        {
          title: "أنجز دورة الرواتب.",
          description:
            "انتقل من احتساب الرواتب إلى الاعتماد الإلكتروني والتحويل عبر نظام حماية الأجور ضمن مسار واحد. راجع الرواتب واطّلع على التقارير التي تحتاجها، مع وضوح كل خطوة.",
        },
        {
          title: "أنجز خدماتك من الجوال.",
          description: "اجعل خدمات الموارد البشرية اليومية في متناولك. اطلب إجازة واطّلع على قسائم رواتبك وسجلاتك الوظيفية من الجوال، مع كل ما تحتاجه في مكان واحد.",
        },
      ],
      phone: {
        greeting: "مرحبًا، ريم",
        role: "مساحة عمل الموظف",
        leave: "رصيد الإجازات",
        days: "يومًا",
        requests: "طلباتي",
        payslip: "قسائم رواتبي",
        records: "سجلاتي",
        annual: "إجازة سنوية",
        approved: "معتمد",
        download: "قسيمة الراتب متاحة",
        label: "واجهة موظف توضيحية",
        status: "كل شيء في مكان واحد",
      },
    },
    why: {
      eyebrow: "04 / لماذا سرج",
      first: "مصممة للمنشآت السعودية.",
      second: "",
      description:
        "الأنظمة المحلية واللغة وسهولة الوصول أساس المنصة.",
      progress: "ما يميز سرج",
      items: [
        {
          title: "عربية أولًا",
          text: "مصممة للمستخدم العربي، مع دعم كامل للإنجليزية.",
        },
        {
          title: "مصممة للسعودية",
          text: "مبنية على نظام العمل السعودي ومتطلبات حماية الأجور.",
        },
        {
          title: "سحابية وعلى الجوال",
          text: "وصول من المتصفح أو الجوال.",
        },
        {
          title: "الانطلاق خلال أيام",
          text: "يتولى فريقنا نقل البيانات والتهيئة.",
        },
      ],
    },
    onboarding: {
      eyebrow: "07 / ابدأ مع سرج",
      first: "ثلاث خطوات للانطلاق.",
      second: "",
      action: "ناقش خطوات التهيئة",
      progress: "مراحل التهيئة",
      progressLabels: ["البيانات", "السياسات", "الانطلاق"],
      description: "يتولى فريقنا نقل البيانات وتهيئة المنصة.",
      steps: [
        {
          title: "استورد بيانات الموظفين.",
          description:
            "استورد من Excel أو نظامك الحالي. نتولى مطابقة البيانات.",
        },
        {
          title: "اضبط سياساتك.",
          description:
            "حدّد الورديات وأنواع الإجازات ومسارات الاعتماد وعناصر الرواتب.",
        },
        {
          title: "ابدأ الاستخدام.",
          description:
            "يستخدم الموظفون التطبيق، والموارد البشرية والمالية لوحة التحكم.",
        },
      ],
      supportTitle: "تحتاج إلى مساعدة؟",
      supportText: "تواصل مع خدمة العملاء أو الدعم الفني.",
      care: "خدمة العملاء",
      support: "الدعم الفني",
    },
    faq: {
      eyebrow: "أسئلة شائعة",
      title: "قبل أن تبدأ.",
      items: [
        {
          question: "هل يمكن نقل بيانات موظفينا الحالية؟",
          answer:
            "نعم. يتولى فريقنا استيراد البيانات ومطابقتها من Excel أو نظامك الحالي.",
        },
        {
          question: "هل تدعم سرج العربية والإنجليزية؟",
          answer: "نعم. سرج عربية أولًا، مع دعم كامل للإنجليزية.",
        },
        {
          question: "هل نحتاج إلى تثبيت برنامج؟",
          answer: "لا. سرج سحابية، مع وصول من المتصفح والجوال.",
        },
        {
          question: "هل يمكن مشاهدة عرض ببيانات شركتنا؟",
          answer:
            "نعم. يمكن لخدمة العملاء ترتيب عرض تجريبي ببيانات شركتك.",
        },
      ],
    },
    contact: {
      eyebrow: "خطوتك القادمة",
      first: "شاهد سرج",
      second: "ببيانات شركتك.",
      description: "اطلب عرضًا تجريبيًا أو تواصل مع فريقنا للاستفسار.",
      demo: "اطلب عرضًا تجريبيًا",
      email: "راسل فريقنا",
      support: "تستخدم سرج بالفعل؟",
      supportLink: "تواصل مع الدعم الفني",
      download: "تحميل الملف التعريفي",
    },
    footer: {
      description: "موارد بشرية ورواتب سحابية سعودية.",
      platform: "المنصة",
      company: "الشركة",
      connect: "تواصل معنا",
      about: "عن سرج",
      profile: "الملف التعريفي",
      support: "الدعم الفني",
      care: "خدمة العملاء",
      owner: "منتج من MTGroup",
      cr: "السجل التجاري",
      rights: "جميع الحقوق محفوظة.",
      country: "صُنع في السعودية",
      top: "العودة للأعلى",
      skip: "انتقل إلى المحتوى",
    },
  },
};

export type SiteContent = (typeof content)[Locale];
