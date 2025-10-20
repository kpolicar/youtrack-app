import '@jetbrains/ring-ui-built/components/style.css';
import React, { memo, useCallback, useEffect, useState } from 'react';
import Button from '@jetbrains/ring-ui-built/components/button/button';
import List from '@jetbrains/ring-ui-built/components/list/list';
import Icon from '@jetbrains/ring-ui-built/components/icon/icon';
import flagIcon from '@jetbrains/icons/flag';
import Heading from "@jetbrains/ring-ui-built/components/heading/heading";
import Panel from "@jetbrains/ring-ui-built/components/panel/panel"; // Outlined flag

interface Project {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    iconUrl?: string;
}
interface Flags {
    projectIds: string[];
}
interface Error {
    message: string;
}

const host = await YTApp.register();

const AppComponent: React.FunctionComponent = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [flags, setFlags] = useState<Flags>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsData = await host.fetchYouTrack<Project[]>(
                    'admin/projects?fields=id,name,shortName,description,iconUrl'
                );
                const flagsData = await host.fetchApp<Flags>('backend/flags', {
                    method: 'GET',
                });

                setProjects(projectsData);
                setFlags(flagsData);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const toggleFlag = useCallback(
        (projectId: string, next: boolean) => {
            host
                .fetchApp<Flags>('backend/flags', {
                    method: 'POST',
                    body: { projectId, flagged: next },
                })
                .then((updatedFlags) => {
                    setFlags(updatedFlags);
                })
                .catch(setError);
        },
        [host]
    );

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
        <Panel>
            <Heading level={Heading.Levels.H1}>Projects</Heading>

            <List
                data={projects.map((project) => {
                    const isFlagged = flags?.projectIds.includes(project.id);

                    return {
                        key: project.id,
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon
                                    onClick={() => toggleFlag(project.id, !isFlagged)}
                                    glyph={flagIcon}
                                    style={{
                                        color: isFlagged ? 'var(--ring-warning-color)' : 'var(--ring-icon-secondary-color)',
                                        fontSize: '16px', // Adjust size
                                        flexShrink: 0, // Prevent flexibility issues
                                    }}
                                    title={isFlagged ? 'Flagged' : 'Not flagged'}
                                />
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
                                        onClick={() => toggleFlag(project.id, !isFlagged)}
                                        style={{ minWidth: 64 }}
                                    >
                                        {isFlagged ? 'Unflag' : 'Flag'}
                                    </Button>
                                </div>
                            </div>
                        ),
                    };
                })}
                renderOptimization={false}
            />
        </Panel>
    );
};

export const App = memo(AppComponent);