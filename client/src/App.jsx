import { useEffect, useMemo, useState } from 'react';
import {
  createApplication,
  deleteApplication,
  getApiErrorMessage,
  getApplications,
  updateApplication,
} from './api';

const statuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

const emptyForm = {
  company: '',
  role: '',
  status: 'Saved',
  source: '',
  jobUrl: '',
  dateApplied: '',
  nextActionDate: '',
  salaryRange: '',
  notes: '',
};

const statusStyles = {
  Saved: 'bg-slate-100 text-slate-600',
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-amber-100 text-amber-700',
  Offer: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

function formatDate(date) {
  if (!date) return '—';
  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? '—'
    : parsedDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

function toFormValues(application) {
  return {
    company: application.company || '',
    role: application.role || '',
    status: application.status || 'Saved',
    source: application.source || '',
    jobUrl: application.jobUrl || '',
    dateApplied: application.dateApplied ? application.dateApplied.slice(0, 10) : '',
    nextActionDate: application.nextActionDate
      ? application.nextActionDate.slice(0, 10)
      : '',
    salaryRange: application.salaryRange || '',
    notes: application.notes || '',
  };
}

function App() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  const loadApplications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getApplications();
      setApplications(response.data);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Could not load applications. Check that the server is running.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.company.toLowerCase().includes(query) ||
        application.role.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'All statuses' || application.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const openCreateModal = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const openEditModal = (application) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const handleSave = async (formValues) => {
    setError('');
    try {
      if (editingApplication) {
        const response = await updateApplication(editingApplication._id, formValues);
        setApplications((current) =>
          current.map((application) =>
            application._id === editingApplication._id ? response.data : application
          )
        );
      } else {
        const response = await createApplication(formValues);
        setApplications((current) => [response.data, ...current]);
      }
      setIsModalOpen(false);
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, 'Could not save application.'));
    }
  };

  const handleStatusChange = async (application, status) => {
    const previousApplications = applications;
    setApplications((current) =>
      current.map((item) =>
        item._id === application._id ? { ...item, status } : item
      )
    );
    try {
      const response = await updateApplication(application._id, { status });
      setApplications((current) =>
        current.map((item) => (item._id === application._id ? response.data : item))
      );
    } catch (requestError) {
      setApplications(previousApplications);
      setError(getApiErrorMessage(requestError, 'Could not update application status.'));
    }
  };

  const handleDelete = async (application) => {
    if (!window.confirm(`Delete the ${application.role} application at ${application.company}?`)) {
      return;
    }
    setError('');
    try {
      await deleteApplication(application._id);
      setApplications((current) =>
        current.filter((item) => item._id !== application._id)
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not delete application.'));
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20">
              J
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Jobflow</p>
              <p className="mt-1 text-xs text-slate-400">Application tracker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-indigo-600"
          >
            + Add application
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Your pipeline
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Keep every opportunity moving.
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Track where you applied, what comes next, and which opportunities deserve your attention.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="font-bold">
              ×
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-panel">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold">Applications</h2>
              <p className="mt-1 text-sm text-slate-400">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'} total
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <span className="sr-only">Search by company or role</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company or role..."
                  className="field min-w-0 pl-9 sm:w-64"
                />
                <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">⌕</span>
              </label>
              <label>
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="field sm:w-40"
                >
                  <option>All statuses</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center p-8">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                Loading applications...
              </div>
            </div>
          ) : applications.length === 0 ? (
            <EmptyState onAdd={openCreateModal} />
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-bold text-slate-700">No matching applications</p>
              <p className="mt-1 text-sm text-slate-400">Try a different search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Company</th>
                    <th className="px-5 py-3.5 font-bold">Role</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">Source</th>
                    <th className="px-5 py-3.5 font-bold">Date applied</th>
                    <th className="px-5 py-3.5 font-bold">Next action</th>
                    <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-slate-700">{application.company}</td>
                      <td className="px-5 py-4 text-slate-600">{application.role}</td>
                      <td className="px-5 py-4">
                        <select
                          value={application.status}
                          onChange={(event) =>
                            handleStatusChange(application, event.target.value)
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold outline-none ring-0 ${statusStyles[application.status] || statusStyles.Saved}`}
                          aria-label={`Update status for ${application.company}`}
                        >
                          {statuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{application.source || '—'}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(application.dateApplied)}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(application.nextActionDate)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(application)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(application)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <ApplicationModal
          application={editingApplication}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
        ✦
      </div>
      <h3 className="text-lg font-bold">No applications yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Add your first opportunity and start building a clear view of your job search.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
      >
        Add your first application
      </button>
    </div>
  );
}

function ApplicationModal({ application, onClose, onSave }) {
  const [form, setForm] = useState(application ? toFormValues(application) : emptyForm);
  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setValidationError('Company and role are required.');
      return;
    }

    setValidationError('');
    setSaveError('');
    setIsSaving(true);
    try {
      await onSave({
        ...form,
        company: form.company.trim(),
        role: form.role.trim(),
      });
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <h2 id="application-modal-title" className="text-xl font-bold">
              {application ? 'Edit application' : 'Add application'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">Keep the details you need for your next step.</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          {validationError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{validationError}</p>}
          {saveError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Company *" name="company" value={form.company} onChange={handleChange} required />
            <FormField label="Role *" name="role" value={form.role} onChange={handleChange} required />
            <FormField label="Status" name="status" value={form.status} onChange={handleChange} as="select">
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </FormField>
            <FormField label="Source" name="source" value={form.source} onChange={handleChange} placeholder="e.g. LinkedIn" />
            <FormField label="Date applied" name="dateApplied" type="date" value={form.dateApplied} onChange={handleChange} />
            <FormField label="Next action date" name="nextActionDate" type="date" value={form.nextActionDate} onChange={handleChange} />
            <FormField label="Job URL" name="jobUrl" type="url" value={form.jobUrl} onChange={handleChange} placeholder="https://" />
            <FormField label="Salary range" name="salaryRange" value={form.salaryRange} onChange={handleChange} placeholder="e.g. $100k–$120k" />
          </div>
          <FormField label="Notes" name="notes" value={form.notes} onChange={handleChange} as="textarea" rows="3" placeholder="Add context for your next follow-up..." />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Saving...' : application ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, as = 'input', children, ...props }) {
  const Component = as;
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <Component className="field" name={name} value={value} onChange={onChange} {...props}>
        {children}
      </Component>
    </label>
  );
}

export default App;
