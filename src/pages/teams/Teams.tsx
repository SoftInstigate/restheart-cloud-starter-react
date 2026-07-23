import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@restheart-cloud/kit-react';
import type { TeamMembership } from '@restheart-cloud/kit-react';
import './Teams.css';

export default function Teams() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.loadTeams().then(
      () => setLoading(false),
      () => setLoading(false)
    );
  }, [auth.loadTeams]);

  const switchTeam = async (team: TeamMembership) => {
    if (team.active) return;
    await auth.switchTeam(team.id);
  };

  return (
    <section className="card">
      <div className="card-header">
        <h2>Your teams</h2>
        <Link to="/teams/new" className="btn-secondary">+ New team</Link>
      </div>

      {loading ? (
        <p className="muted">Loading teams…</p>
      ) : auth.teams.length === 0 ? (
        <p className="muted">You're not part of any team yet.</p>
      ) : (
        <ul className="team-list">
          {auth.teams.map(team => (
            <li key={team.id.$oid}>
              <div className={`team-row${team.active ? ' active' : ''}`}>
                <Link to={`/teams/${team.id.$oid}`} className="team-link">
                  <span className="team-name">{team.name || team.id.$oid}</span>
                  {team.description && (
                    <span className="team-desc">{team.description}</span>
                  )}
                  <span className="team-role">{team.role}</span>
                </Link>
                {team.active ? (
                  <span className="team-badge">current</span>
                ) : (
                  <button type="button" className="btn-switch" onClick={() => switchTeam(team)}>Switch</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
