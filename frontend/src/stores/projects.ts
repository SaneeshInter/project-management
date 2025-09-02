import { create } from 'zustand';
import { Project, CreateProjectDto, CreateDepartmentTransitionDto, projectsApi } from '@/types';
import toast from 'react-hot-toast';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: Partial<CreateProjectDto>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  moveProject: (id: string, data: CreateDepartmentTransitionDto) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectsApi.getAll();
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await projectsApi.getById(id);
      set({ currentProject: project, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to fetch project');
    }
  },

  createProject: async (data: CreateProjectDto) => {
    set({ isLoading: true });
    try {
      const newProject = await projectsApi.create(data);
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));
      toast.success('Project created successfully!');
      return newProject;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create project');
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<CreateProjectDto>) => {
    set({ isLoading: true });
    try {
      const updatedProject = await projectsApi.update(id, data);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
        currentProject: 
          state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false,
      }));
      toast.success('Project updated successfully!');
      return updatedProject;
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update project');
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true });
    try {
      await projectsApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  },

  moveProject: async (id: string, data: CreateDepartmentTransitionDto) => {
    set({ isLoading: true });
    try {
      await projectsApi.moveToDepartment(id, data);
      toast.success('Project moved successfully!');
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || 'Failed to move project';
      throw new Error(errorMessage);
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));