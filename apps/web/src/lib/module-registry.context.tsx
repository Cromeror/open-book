'use client';

/**
 * Module Registry React Context
 *
 * Provides access to user modules and permissions throughout the app.
 * Data comes from server via props (no singleton needed).
 *
 * Key principle: action code = permission code
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  ModuleWithActions,
  NavItem,
  ActionSettings,
  ModuleAction,
} from './types/modules';

interface ModuleRegistryContextValue {
  /** Whether the user is SuperAdmin */
  isSuperAdmin: boolean;
  /** All user modules with their actions */
  modules: ModuleWithActions[];
  /** Navigation configuration derived from modules */
  navConfig: NavItem[];
  /** Check if user has access to a module */
  hasModule: (code: string) => boolean;
  /** Check if user has a specific action (permission) in a module */
  hasAction: (moduleCode: string, actionCode: string) => boolean;
  /** Get metadata for a specific module */
  getMetadata: (code: string) => ModuleWithActions | undefined;
  /** Get action codes for a module (equivalent to permissions) */
  getPermissions: (moduleCode: string) => string[];
  /** Get a specific action from a module */
  getAction: (moduleCode: string, actionCode: string) => ModuleAction | undefined;
  /** Get action settings with type casting */
  getActionSettings: <T extends ActionSettings>(
    moduleCode: string,
    actionCode: string
  ) => T | undefined;
}

const ModuleRegistryContext = createContext<ModuleRegistryContextValue | null>(null);

interface ModuleRegistryProviderProps {
  children: ReactNode;
  /** Modules from server-side rendering */
  initialModules: ModuleWithActions[];
  /** Whether user is SuperAdmin */
  initialIsSuperAdmin?: boolean;
}

/**
 * Provider component for module registry context
 * Receives data from server and provides it to client components
 */
export function ModuleRegistryProvider({
  children,
  initialModules,
  initialIsSuperAdmin = false,
}: ModuleRegistryProviderProps) {
  // Memoize all values based on initialModules
  const value = useMemo<ModuleRegistryContextValue>(() => {
    const modules = initialModules;

    // Generate nav config from modules
    const navConfig: NavItem[] = modules
      .slice()
      .sort((a, b) => a.nav.order - b.nav.order)
      .map((m) => ({
        path: m.nav.path,
        label: m.label,
        icon: m.icon,
        module: m.code,
      }));

    // Helper functions
    const hasModule = (code: string): boolean =>
      modules.some((m) => m.code === code);

    const getMetadata = (code: string): ModuleWithActions | undefined =>
      modules.find((m) => m.code === code);

    const hasAction = (moduleCode: string, actionCode: string): boolean => {
      const module = getMetadata(moduleCode);
      return module?.actions.some((a) => a.code === actionCode) ?? false;
    };

    const getPermissions = (moduleCode: string): string[] =>
      getMetadata(moduleCode)?.actions.map((a) => a.code) ?? [];

    const getAction = (moduleCode: string, actionCode: string): ModuleAction | undefined => {
      const module = getMetadata(moduleCode);
      return module?.actions.find((a) => a.code === actionCode);
    };

    const getActionSettings = <T extends ActionSettings>(
      moduleCode: string,
      actionCode: string
    ): T | undefined => {
      const action = getAction(moduleCode, actionCode);
      return action?.settings as T | undefined;
    };

    return {
      isSuperAdmin: initialIsSuperAdmin,
      modules,
      navConfig,
      hasModule,
      hasAction,
      getMetadata,
      getPermissions,
      getAction,
      getActionSettings,
    };
  }, [initialModules, initialIsSuperAdmin]);

  return (
    <ModuleRegistryContext.Provider value={value}>
      {children}
    </ModuleRegistryContext.Provider>
  );
}

/**
 * Hook to access module registry context
 *
 * @throws Error if used outside ModuleRegistryProvider
 */
export function useModuleRegistry(): ModuleRegistryContextValue {
  const context = useContext(ModuleRegistryContext);
  if (!context) {
    throw new Error('useModuleRegistry must be used within ModuleRegistryProvider');
  }
  return context;
}

/**
 * Hook to check if user has a specific action
 * Shorthand for useModuleRegistry().hasAction
 */
export function useHasAction(moduleCode: string, actionCode: string): boolean {
  const { hasAction } = useModuleRegistry();
  return hasAction(moduleCode, actionCode);
}

/**
 * Hook to check if user has access to a module
 * Shorthand for useModuleRegistry().hasModule
 */
export function useHasModule(moduleCode: string): boolean {
  const { hasModule } = useModuleRegistry();
  return hasModule(moduleCode);
}
