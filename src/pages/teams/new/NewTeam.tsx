import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@restheart-cloud/kit-react';
import type { TeamMembership } from '@restheart-cloud/kit-react';
import { Alert } from '../../../ui/alert/Alert';
import './NewTeam.css';

export default function NewTeam() {
  const auth = useAuth();

  const [teamName, setTeamName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<TeamMembership | null>(null);

  const createTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    setSaving(true);
    setError(null);
    try {
      const team = await auth.createTeam(teamName);
      setSaving(false);
      setCreated(team);
    } catch (err: unknown) {
      setSaving(false);
      const e = err as { message?: string };
      setError(e?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="card">
      <Link to="/teams" className="back-link">&larr; Back to teams</Link>
      <h2>Create a new team</h2>

      {created ? (
        <>
          <Alert type="success" onClose={() => setCreated(null)}>
            "{created.name}" created — you're the owner.
            <br />
            <em className="muted">Note: it won't show up in your team list yet — creating teams isn't fully supported server-side.</em>
          </Alert>
          <Link to="/teams" className="btn-primary link-btn">Back to teams</Link>
        </>
      ) : (
        <>
          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

          <form onSubmit={createTeam} noValidate className="account-form">
            <div className="form-field">
              <label htmlFor="team-name">Team name</label>
              <input
                id="team-name"
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create team'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
