import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectInfo {
  id: string;
  name: string;
  status: string;
  myRole?: string;
}

interface ProjectContextType {
  project: ProjectInfo | null;
  selectProject: (p: ProjectInfo) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType>(null!);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectInfo | null>(() => {
    const stored = localStorage.getItem('selectedProject');
    return stored ? JSON.parse(stored) : null;
  });

  const selectProject = (p: ProjectInfo) => {
    setProject(p);
    localStorage.setItem('selectedProject', JSON.stringify(p));
  };

  const clearProject = () => {
    setProject(null);
    localStorage.removeItem('selectedProject');
  };

  return (
    <ProjectContext.Provider value={{ project, selectProject, clearProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

export function useProjectId(): string | undefined {
  const { project } = useContext(ProjectContext);
  return project?.id;
}

export function useIsProjectManager(): boolean {
  const { project } = useProject();
  return project?.myRole === 'owner' || project?.myRole === 'manager';
}
