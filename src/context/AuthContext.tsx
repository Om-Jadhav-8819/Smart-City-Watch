import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Check for existing session on mount
    try {
      const session = localStorage.getItem('cityvitals_session');
      if (session) {
        const user = JSON.parse(session);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = (name: string, email: string, password: string, role: string, extra = {}) => {
    try {
      const usersJson = localStorage.getItem('cityvitals_users') || '[]';
      const users = JSON.parse(usersJson);

      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'User with this email already exists' };
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, use bcrypt
        role,
        ...extra,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('cityvitals_users', JSON.stringify(users));
      
      // Auto sign in
      const sessionUser = { ...newUser };
      delete sessionUser.password;
      
      localStorage.setItem('cityvitals_session', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const signIn = (email: string, password: string, role: string) => {
    try {
      const usersJson = localStorage.getItem('cityvitals_users') || '[]';
      const users = JSON.parse(usersJson);

      const user = users.find((u: any) => u.email === email && u.password === password && u.role === role);

      if (user) {
        const sessionUser = { ...user };
        delete sessionUser.password;

        localStorage.setItem('cityvitals_session', JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials for the selected role' };
      }
    } catch (error) {
      return { success: false, error: 'Sign in failed. Please try again.' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('cityvitals_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setApiKey("");
  };

  const updateProfile = (updates: any) => {
    try {
      const updatedUser = { ...currentUser, ...updates };
      
      // Update session
      localStorage.setItem('cityvitals_session', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Update "database"
      const usersJson = localStorage.getItem('cityvitals_users') || '[]';
      const users = JSON.parse(usersJson);
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('cityvitals_users', JSON.stringify(users));
      }

      // Audit log
      const auditJson = localStorage.getItem('cityvitals_audit') || '[]';
      const audit = JSON.parse(auditJson);
      audit.unshift({
        timestamp: new Date().toISOString(),
        userName: currentUser.name,
        action: `Updated profile: ${Object.keys(updates).join(', ')}`
      });
      localStorage.setItem('cityvitals_audit', JSON.stringify(audit.slice(0, 50)));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    authLoading,
    apiKey,
    setApiKey,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
