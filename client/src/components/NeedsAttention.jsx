function getDatePart(date) {
  return date ? date.slice(0, 10) : '';
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReminderDate(date) {
  const parsedDate = new Date(`${getDatePart(date)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? 'Invalid date'
    : parsedDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

export function isOverdue(application, today = getTodayDate()) {
  const actionDate = getDatePart(application.nextActionDate);
  return (
    Boolean(actionDate) &&
    actionDate < today &&
    !['Offer', 'Rejected'].includes(application.status)
  );
}

export function isDueToday(application, today = getTodayDate()) {
  return (
    Boolean(getDatePart(application.nextActionDate)) &&
    getDatePart(application.nextActionDate) === today &&
    !['Offer', 'Rejected'].includes(application.status)
  );
}

export default function NeedsAttention({ applications, onEdit }) {
  const today = getTodayDate();
  const reminders = applications
    .filter((application) => isOverdue(application, today) || isDueToday(application, today))
    .sort(
      (left, right) =>
        getDatePart(left.nextActionDate).localeCompare(getDatePart(right.nextActionDate)) ||
        left.company.localeCompare(right.company)
    );

  if (reminders.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Follow-up reminders
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-800">Needs attention</h2>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
          {reminders.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {reminders.map((application) => {
          const overdue = isOverdue(application, today);
          return (
            <button
              key={application._id}
              type="button"
              onClick={() => onEdit(application)}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-white px-3.5 py-3 text-left transition hover:border-amber-400 hover:shadow-sm"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-700">
                  {application.company}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {application.role}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  className={`block text-xs font-bold ${
                    overdue ? 'text-rose-600' : 'text-amber-700'
                  }`}
                >
                  {overdue ? 'Overdue' : 'Due today'}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {formatReminderDate(application.nextActionDate)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
