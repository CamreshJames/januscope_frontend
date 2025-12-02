import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsedState] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('januscope_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('januscope_sidebar_collapsed', String(isCollapsed));
    
    // Update CSS variable for smooth transitions
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '70px' : '260px'
    );
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => !prev);
  };

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
