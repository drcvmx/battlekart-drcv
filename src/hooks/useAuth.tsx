import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type AppRole = "client" | "staff" | "admin";

interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  total_races: number;
  current_level_id: number | null;
  is_permanent_level: boolean;
  client_number: number;
}

// Minimal mock user interface compatible with what's used
interface MockUser {
  id: string;
  email?: string;
}

interface MockSession {
  user: MockUser;
}

interface AuthContextType {
  user: MockUser | null;
  session: MockSession | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoaded: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    birthDate?: string,
  ) => Promise<{ error: Error | null; userId?: string }>;
  signIn: () => Promise<{ error: Error | null }>; // Removed email/password
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: AppRole) => void; // Added for demo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: MockUser = {
  id: "demo-user-123",
  email: "demo@battlekart.com",
};

const DEMO_SESSION: MockSession = {
  user: DEMO_USER,
};

const DEMO_PROFILE: Profile = {
  id: "demo-user-123",
  full_name: "Usuario Demo",
  first_name: "Usuario",
  last_name: "Demo",
  phone: "+52 123 456 7890",
  avatar_url: null,
  birth_date: "1990-01-01",
  total_races: 15,
  current_level_id: 2,
  is_permanent_level: false,
  client_number: 1001,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    // Check local storage for existing session
    const checkSession = () => {
      const storedRole = localStorage.getItem("demo_role") as AppRole | null;
      const isLoggedIn = localStorage.getItem("demo_logged_in") === "true";

      if (isLoggedIn) {
        setUser(DEMO_USER);
        setSession(DEMO_SESSION);
        setProfile(DEMO_PROFILE);
        setRoles(storedRole ? [storedRole] : ["client"]);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
      }
      setRolesLoaded(true);
      setLoading(false);
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, birthDate?: string) => {
    console.log("Mock signUp called");
    return { error: null, userId: DEMO_USER.id };
  };

  const signIn = async () => {
    setLoading(true);
    setRolesLoaded(false);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    localStorage.setItem("demo_logged_in", "true");
    const currentRole = localStorage.getItem("demo_role") || "client";
    if (!localStorage.getItem("demo_role")) {
      localStorage.setItem("demo_role", "client");
    }

    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    setProfile(DEMO_PROFILE);
    setRoles([currentRole as AppRole]);
    
    setRolesLoaded(true);
    setLoading(false);
    
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("demo_logged_in");
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setRolesLoaded(true);
  };

  const switchRole = (role: AppRole) => {
    localStorage.setItem("demo_role", role);
    setRoles([role]);
  };

  const refreshProfile = async () => {
    // Mock refresh
    console.log("Mock refreshProfile called");
  };

  const isAdmin = roles.includes("admin");
  const isStaff = roles.includes("staff") || isAdmin;
  const isClient = roles.includes("client") || roles.length === 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        rolesLoaded,
        isAdmin,
        isStaff,
        isClient,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
