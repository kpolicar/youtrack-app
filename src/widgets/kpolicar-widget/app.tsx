import React, {memo, useCallback, useEffect, useState} from 'react';
import Button from '@jetbrains/ring-ui-built/components/button/button';

interface Project {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  iconUrl?: string
}
interface Flags {
  projectIds: string[]
}
interface Error {
  message: string;
}

// Register widget in YouTrack. To learn more, see https://www.jetbrains.com/help/youtrack/devportal-apps/apps-host-api.html
const host = await YTApp.register();

const AppComponent: React.FunctionComponent = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [flags, setFlags] = useState<Flags>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error|null>(null);

  useEffect(() => {
    host.fetchYouTrack<Project[]>('admin/projects?fields=id,name,shortName,description,iconUrl')
      .then(projects => {
        setProjects(projects);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
      host.fetchApp<Flags>('backend/flags', {
        method: 'GET'
      })
        .then(flags => {
          setFlags(flags);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
  }, []);

  const toggleFlag = useCallback((projectId: string, next: boolean) => {
    return host.fetchApp<Flags>(`backend/flags`, {
      method: 'POST',
      body: { "projectId": projectId, "flagged": next }
    })
    .then(flags => {
      setFlags(flags);
    }).catch(err => {
      setError(err);
    });
  }, []);

  
  if (loading) {
    return (
      <div style={{ padding: '12px', color: 'var(--ring-secondary-color)' }}>
        Loading projects…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '12px', color: 'var(--ring-error-color)' }}>
        Error loading projects: {error.message}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{ padding: '12px', color: 'var(--ring-secondary-color)' }}>
        No projects found.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px' }}>
      <h2
        style={{
          fontSize: '14px',
          marginBottom: '8px',
          color: 'var(--ring-text-color)',
          fontWeight: 600,
        }}
      >
        Projects
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--ring-line-color)',
              paddingBottom: '8px',
            }}
          >
            {flags?.projectIds.includes(project.id) && (
              <span
                title="Flag"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#FFD700',
                  display: 'inline-block',
                  borderRadius: '2px'
                }}
              />
            )}

            {project.iconUrl && (
              <img
                src={project.iconUrl}
                alt=""
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
              />
            )}

            <div style={{ flex: 1 }}>
              <a
                href={`/projects/${project.shortName}`}
                style={{
                  color: 'var(--ring-link-color)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  display: 'block',
                }}
              >
                {project.name}
              </a>

              {project.description && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ring-secondary-color)',
                    marginTop: '2px',
                  }}
                >
                  {project.description}
                </div>
              )}
            </div>

            <div>
              <Button
                onClick={() => toggleFlag(project.id, !flags?.projectIds.includes(project.id))}
                style={{minWidth: 64}}
              >
                {flags?.projectIds.includes(project.id) ? 'Unflag' : 'Flag'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
    )
};

export const App = memo(AppComponent);
