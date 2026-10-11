import { memo, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  Files,
  MoreHorizontal,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Locale, SiteContent } from "@/lib/content";
import { WorkspaceNumber } from "./workspace-motion";
import motionStyles from "./workspace-motion.module.css";
import styles from "./workspace-dashboard.module.css";

type View = "dashboard" | "attendance" | "leave" | "payroll" | "performance" | "files";
type Metric = { label: string; value: number | string; icon: LucideIcon; unit?: string; update?: boolean };
type Copy = SiteContent["preview"];

function Metrics({ items }: { items: Metric[] }) {
  return (
    <div className={`workspace-stats ${styles.stats}`}>
      {items.map(({ label, value, icon: Icon, unit, update }) => (
        <div
          key={label}
          data-workspace-update={update ? "count" : undefined}
          data-value-long={typeof value === "number" && Math.abs(value) >= 100000 ? "true" : undefined}
        >
          <span className={styles.metricLabel}>
            {label}
            <span data-workspace-icon aria-hidden="true"><Icon size={17} /></span>
          </span>
          <strong>
            <span dir="ltr">
              {typeof value === "number" ? <WorkspaceNumber value={value} grouped /> : value}
              {unit ? <small className={styles.unit}>{unit}</small> : null}
            </span>
            <span className="stat-dot" aria-hidden="true" />
          </strong>
        </div>
      ))}
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
  className = "",
  aside,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <article className={`${styles.card} ${className}`} data-workspace-card>
      <div className={`chart-heading ${styles.cardHeading}`}>
        <h4><span data-workspace-icon aria-hidden="true"><Icon size={17} /></span>{title}</h4>
        {aside}
      </div>
      {children}
    </article>
  );
}

function AttendanceChart({ copy: c }: { copy: Copy }) {
  return (
    <Card title={c.trend} icon={TrendingUp} className={`attendance-chart ${styles.chartCard}`}
      aside={<span>{c.week}<ChevronDown size={11} aria-hidden="true" /></span>}
    >
      <div className={`bar-chart ${styles.bars}`}>
        {[76, 90, 82, 95, 88].map((height, i) => (
          <div className="bar-column" key={c.days[i]}>
            <div className="bar-track" aria-hidden="true">
              <span style={{ height: `${height}%` }} />
              <span style={{ height: `${height - 12}%` }} />
            </div>
            <span>{c.days[i]}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartCaption}>
        <span className="connection-dot" aria-hidden="true" />{c.present}
        <span className={styles.mutedDot} aria-hidden="true" />{c.employees}
      </div>
    </Card>
  );
}

function RingCard({
  title, value, caption, icon, children,
}: { title: string; value: number; caption: string; icon: LucideIcon; children?: ReactNode }) {
  return (
    <Card title={title} icon={icon} className={`attendance-ring ${styles.ringCard}`}>
      <div className={styles.ringBody}>
        <div className={`donut ${styles.donut}`}>
          <svg className={motionStyles.ring} viewBox="0 0 100 100" aria-hidden="true">
            <circle className={motionStyles.ringTrack} cx="50" cy="50" r="45" />
            <circle className={motionStyles.ringProgress} cx="50" cy="50" r="45"
              pathLength="100" strokeDasharray={`${value} 100`} strokeDashoffset="0"
              data-workspace-ring={value}
              data-workspace-graphic="ring"
              style={{ "--workspace-ring-value": value } as CSSProperties}
            />
          </svg>
          <span><WorkspaceNumber value={value} graphic="ring" /><small>%</small></span>
        </div>
        <p className={styles.ringCaption}>{caption}</p>
        {children}
      </div>
    </Card>
  );
}

function Requests({ copy: c, approved, onReview }: { copy: Copy; approved: boolean; onReview: () => void }) {
  return (
    <Card title={c.activity} icon={CalendarDays} aside={<MoreHorizontal size={18} aria-hidden="true" />}>
      <div className={`sample-table ${styles.table}`}>
        <div className="sample-row sample-row-head"><span>{c.person}</span><span>{c.type}</span><span>{c.status}</span></div>
        {c.names.map((name, i) => (
          <div className="sample-row" key={name} data-workspace-request={i === 0 ? "sample" : undefined}>
            <span className="employee-name"><span className={`avatar avatar-${i}`}>{name.slice(0, 1)}</span>{name}</span>
            <span>{c.requestTypes[i]}</span>
            {i === 0 && !approved ? (
              <button type="button" className="status status-pending" onClick={onReview} aria-label={c.review}>
                {c.pending}<ArrowUpRight size={12} aria-hidden="true" />
              </button>
            ) : (
              <span className="status status-approved"><Check size={12} aria-hidden="true" />{c.approved}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrendGraphic({ label, labels }: { label: string; labels: string[] }) {
  return (
    <div className={styles.trend}>
      <svg viewBox="0 0 360 170" role="img" aria-label={label} preserveAspectRatio="none">
        {[30, 70, 110, 150].map(y => <path className={styles.gridLine} d={`M10 ${y}H350`} key={y} />)}
        <path className={styles.trendArea} d="M10 140L78 112L146 124L214 75L282 55L350 24V155H10Z" />
        <path className={styles.trendLine} d="M10 140L78 112L146 124L214 75L282 55L350 24" pathLength="100" data-workspace-chart-line />
        {[[10, 140], [78, 112], [146, 124], [214, 75], [282, 55], [350, 24]].map(([x, y]) => (
          <circle cx={x} cy={y} r="3" className={styles.trendPoint} key={x} />
        ))}
      </svg>
      <div className={styles.axis}>{labels.map(label => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

export const WorkspaceDashboard = memo(function WorkspaceDashboard({
  view, copy: c, locale, approved, onReview,
}: { view: View; copy: Copy; locale: Locale; approved: boolean; onReview: () => void }) {
  const ar = locale === "ar";
  const text = (en: string, arabic: string) => ar ? arabic : en;
  const pending = approved ? 4 : 5;

  if (view === "dashboard") {
    return (
      <div className={styles.dashboard}>
        <Metrics items={[
          { label: c.employees, value: 248, icon: Users },
          { label: c.present, value: 231, icon: Clock3 },
          { label: c.onLeave, value: 12, icon: CalendarDays },
          { label: c.requests, value: pending, icon: Files, update: true },
        ]} />
        <div className={styles.mainGrid}>
          <AttendanceChart copy={c} />
          <RingCard title={c.present} icon={Users} value={93} caption={`231 / 248 · ${c.employees}`} />
        </div>
        <Requests copy={c} approved={approved} onReview={onReview} />
      </div>
    );
  }

  if (view === "attendance") {
    return (
      <div className={styles.dashboard}>
        <Metrics items={[
          { label: c.present, value: 231, icon: Users },
          { label: c.onLeave, value: 12, icon: CalendarDays },
          { label: text("Not checked in", "لم يسجلوا الحضور"), value: 5, icon: Clock3 },
          { label: c.shift, value: "09:00", icon: Clock3 },
        ]} />
        <div className={styles.mainGrid}>
          <AttendanceChart copy={c} />
          <RingCard title={text("Attendance rate", "نسبة الحضور")} value={93} icon={Clock3} caption={c.regular}>
            <div className={styles.shiftTime}><span>{c.shift}</span><strong dir="ltr">09:00 — 17:00</strong></div>
          </RingCard>
        </div>
        <Card title={text("Today's check-ins", "سجلات حضور اليوم")} icon={Clock3}>
          <div className={`sample-table ${styles.table}`}>
            <div className="sample-row sample-row-head"><span>{c.person}</span><span>{c.checkin}</span><span>{c.status}</span></div>
            {c.names.map((name, i) => (
              <div className="sample-row" key={name}>
                <span className="employee-name"><span className={`avatar avatar-${i}`}>{name.slice(0, 1)}</span>{name}</span>
                <span dir="ltr">08:{[52, 45, 58][i]}</span>
                <span className="status status-approved"><Check size={12} aria-hidden="true" />{c.checkedIn}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (view === "leave") {
    return (
      <div className={styles.dashboard}>
        <Metrics items={[
          { label: c.balance, value: 21, icon: CalendarDays, unit: text("days", "يومًا") },
          { label: c.onLeave, value: 12, icon: Users },
          { label: c.requests, value: pending, icon: Files, update: true },
          { label: text("Leave used", "الإجازات المستخدمة"), value: 9, icon: Check, unit: text("days", "أيام") },
        ]} />
        <div className={styles.mainGrid}>
          <Card title={text("Team leave calendar", "تقويم إجازات الفريق")} icon={CalendarDays}>
            <div className={styles.calendar}>
              {text("Sun,Mon,Tue,Wed,Thu,Fri,Sat", "أحد,إثنين,ثلاثاء,أربعاء,خميس,جمعة,سبت").split(",").map(day => <span className={styles.calendarDay} key={day}>{day}</span>)}
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <span className={styles.calendarDate} key={day} data-leave={day >= 11 && day <= 13 ? "true" : undefined}>{day}</span>
              ))}
            </div>
            <div className={styles.chartCaption}><span className="connection-dot" aria-hidden="true" />{c.requestDetail}</div>
            <button type="button" className={styles.reviewButton} onClick={onReview} disabled={approved}>
              {approved ? c.approvedNotice : c.viewSample}<ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </Card>
          <RingCard title={text("Annual leave used", "الإجازة السنوية المستخدمة")} icon={CalendarDays} value={30} caption={text("9 of 30 days used", "تم استخدام 9 من 30 يومًا")}>
            <div className={styles.shiftTime}><span>{c.balance}</span><strong><WorkspaceNumber value={21} /> {text("days", "يومًا")}</strong></div>
          </RingCard>
        </div>
        <Requests copy={c} approved={approved} onReview={onReview} />
      </div>
    );
  }

  if (view === "payroll") {
    return (
      <div className={styles.dashboard}>
        <Metrics items={[
          { label: c.total, value: 1364000, icon: Wallet, unit: "SAR" },
          { label: c.employees, value: 248, icon: Users },
          { label: c.allowance, value: 186000, icon: TrendingUp, unit: "SAR" },
          { label: c.deductions, value: 62000, icon: FileCheck2, unit: "SAR" },
        ]} />
        <div className={styles.mainGrid}>
          <Card title={c.payrollTitle} icon={Wallet}>
            <div className="payroll-cycle"><span>{c.month}</span><span className="status status-approved"><Check size={12} aria-hidden="true" />{c.ready}</span></div>
            <div className={`payroll-ledger ${styles.ledger}`}>
              {[c.salary, c.allowance, c.deductions, c.total].map((label, i) => (
                <div key={label}><span>{label}</span><strong dir="ltr"><WorkspaceNumber value={[1240000, 186000, -62000, 1364000][i]} grouped graphic={i < 3 ? `payroll-${i}` : undefined} /> <small>SAR</small></strong></div>
              ))}
            </div>
          </Card>
          <Card title={text("Payroll breakdown", "تفاصيل الرواتب")} icon={TrendingUp}>
            <svg className={styles.breakdown} viewBox="0 0 320 156" aria-hidden="true">
              {[100, 15, 5].map((value, i) => <rect key={i} x="0" y={i * 52 + 8} width={value * 3.1} height="28" rx="5" data-workspace-chart-bar data-workspace-graphic={`payroll-${i}`} className={styles.breakdownBar} />)}
            </svg>
            <div className={styles.breakdownLabels}>
              {[c.salary, c.allowance, c.deductions].map((label, i) => (
                <div key={label}><span>{label}</span><strong dir="ltr"><WorkspaceNumber value={[1240000, 186000, 62000][i]} grouped graphic={`payroll-${i}`} /> <small>SAR</small></strong></div>
              ))}
            </div>
          </Card>
        </div>
        <Card title={text("Payroll workflow", "مراحل صرف الرواتب")} icon={ShieldCheck}>
          <div className={styles.workflow}>
            {[text("Calculation complete", "اكتمل الاحتساب"), c.ready, text("Transfer pending", "بانتظار التحويل")].map((label, i) => (
              <div className={styles.workflowStep} key={label}>
                <span className={styles.stepIcon} data-workspace-icon aria-hidden="true">{i === 0 ? <Check size={18} /> : i === 1 ? <FileCheck2 size={18} /> : <Clock3 size={18} />}</span>
                <strong>{label}</strong><span>{[c.salary, c.payrollDescription, text("After payroll approval", "بعد اعتماد الرواتب")][i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (view === "performance") {
    return (
      <div className={styles.dashboard}>
        <Metrics items={[
          { label: text("Average progress", "متوسط التقدم"), value: 83, icon: TrendingUp, unit: "%" },
          { label: text("Sample reviews", "مراجعات تجريبية"), value: 3, icon: Users },
          { label: text("Above target", "أعلى من المستهدف"), value: 2, icon: Check },
          { label: text("Progress target", "التقدم المستهدف"), value: 80, icon: Target, unit: "%" },
        ]} />
        <div className={styles.mainGrid}>
          <Card title={text("Team goals & KPIs", "أهداف الفريق ومؤشرات الأداء")} icon={Target}>
            <div className={styles.performanceList}>
              {c.names.map((name, i) => (
                <div className="performance-row" key={name}>
                  <span className="employee-name"><span className={`avatar avatar-${i}`}>{name.slice(0, 1)}</span>{name}</span>
                  <div className="performance-track" aria-hidden="true"><span style={{ width: `${[85, 72, 93][i]}%` }} data-workspace-graphic={`kpi-${i}`} /></div>
                  <strong><WorkspaceNumber value={[85, 72, 93][i]} graphic={`kpi-${i}`} />%</strong>
                </div>
              ))}
            </div>
            <p className={styles.cardNote}>{text("Illustrative progress for a sample review period.", "تقدم توضيحي لفترة مراجعة تجريبية.")}</p>
          </Card>
          <Card title={text("Progress trend", "اتجاه التقدم")} icon={TrendingUp}>
            <TrendGraphic label={text("Illustrative progress increasing over six review periods", "تقدم توضيحي متزايد خلال ست فترات مراجعة")} labels={["01", "02", "03", "04", "05", "06"]} />
            <p className={styles.cardNote}>{text("Sample review periods", "فترات مراجعة تجريبية")}</p>
          </Card>
        </div>
        <Card title={text("Focus areas", "مجالات التركيز")} icon={Target}>
          <div className={styles.miniGrid}>
            {[text("Employee experience", "تجربة الموظف"), text("Team development", "تطوير الفريق"), text("On-time payroll", "صرف الرواتب في موعدها")].map((label, i) => (
              <div className={`performance-row ${styles.goal}`} key={label}>
                <span>{label}</span><strong><WorkspaceNumber value={[85, 72, 93][i]} graphic={`goal-${i}`} />%</strong>
                <div className="performance-track" aria-hidden="true"><span style={{ width: `${[85, 72, 93][i]}%` }} data-workspace-graphic={`goal-${i}`} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Metrics items={[
        { label: c.documents, value: 3, icon: Files },
        { label: text("Verified", "تم التحقق"), value: 2, icon: ShieldCheck },
        { label: text("Needs review", "تحتاج إلى مراجعة"), value: 1, icon: FileCheck2 },
        { label: text("Upcoming renewals", "التجديدات القادمة"), value: 1, icon: CalendarDays },
      ]} />
      <div className={styles.mainGrid}>
        <Card title={c.documents} icon={Files}>
          <div className={styles.documentList}>
            {[text("Employment contract", "عقد العمل"), text("Iqama record", "سجل الإقامة"), c.payslip].map((name, i) => (
              <div className="document-row" key={name}>
                <span data-workspace-icon aria-hidden="true"><FileCheck2 size={22} /></span>
                <div><strong>{name}</strong><small>{c.names[i]}</small></div>
                <span className={`status ${i === 1 ? "status-pending" : "status-approved"}`}>{i === 1 ? text("Review", "مراجعة") : text("Verified", "تم التحقق")}</span>
              </div>
            ))}
          </div>
        </Card>
        <RingCard title={text("File verification", "التحقق من الملفات")} value={67} icon={ShieldCheck} caption={text("2 of 3 sample files verified", "تم التحقق من ملفين من أصل 3 ملفات تجريبية")} />
      </div>
      <Card title={text("Document overview", "ملخص المستندات")} icon={CalendarDays}>
        <div className={styles.miniGrid}>
          {[text("Contracts", "العقود"), text("Identity records", "سجلات الهوية"), text("Payslips", "مسيرات الرواتب")].map((label, i) => (
            <div className={styles.documentSummary} key={label}>
              <span data-workspace-icon aria-hidden="true"><Files size={20} /></span>
              <strong>{label}</strong><span>{c.names[i]}</span>
              <span className={`status ${i === 1 ? "status-pending" : "status-approved"}`}>{i === 1 ? text("Renewal review", "مراجعة التجديد") : text("Up to date", "محدّث")}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});
