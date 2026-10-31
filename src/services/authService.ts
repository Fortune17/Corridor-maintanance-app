import { Profile, UserRole, BuildingBlock } from '../types/database';
import { db } from './db';
import { supabaseService } from './supabase';

export interface AuthSession {
  token: string;
  user: Profile;
  expiresAt: number; // timestamp
}

interface StoredCredential {
  email: string;
  passwordHash: string;
  role: UserRole;
  salt: string;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'chm_auth_credentials_prod_v2',
  SESSION: 'chm_auth_session_prod_v2',
};

// Staff Authorization Passcode for registering new staff members (confidential)
export const STAFF_SECURITY_CODE = 'CORRIDOR-STAFF-5849';

// Helper for SHA-256 password hashing with salt using browser Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:chm_auth_pepper_2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

class AuthService {
  private credentials: Map<string, StoredCredential> = new Map();

  constructor() {
    this.init();
  }

  private async init() {
    // Purge legacy demo keys if present
    try {
      localStorage.removeItem('chm_auth_credentials_v1');
      localStorage.removeItem('chm_auth_session_v1');
    } catch (_) {}

    // Load stored production credentials
    const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (storedCreds) {
      try {
        const list: StoredCredential[] = JSON.parse(storedCreds);
        list.forEach((c) => this.credentials.set(c.email.toLowerCase(), c));
      } catch (e) {
        console.error('Failed to load credentials from storage', e);
      }
    }
  }

  private saveCredentials() {
    try {
      const arr = Array.from(this.credentials.values());
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save credentials to localStorage', e);
    }
  }

  // --- SUPABASE CONFIGURATION PROXY ---

  public getSupabaseStatus(): { isConnected: boolean; url: string; hasKey: boolean } {
    return supabaseService.getStatus();
  }

  public async setSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
    const success = supabaseService.configure(url, anonKey, true);
    if (!success && url.trim()) {
      throw new Error('Failed to configure Supabase with provided credentials.');
    }
    return true;
  }

  // --- REAL SIGN IN ---

  public async signIn(email: string, password: string, requiredRole?: 'student' | 'staff'): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Please enter your university email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const supabase = supabaseService.getClient();
    const isSupabaseLive = supabaseService.getStatus().isConnected;

    // 1. If live Supabase is connected, attempt Supabase Auth first
    if (supabase && isSupabaseLive) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          // Fetch profile from supabase table or local db
          let profile = db.getAllProfiles().find((p) => p.email.toLowerCase() === cleanEmail);
          if (!profile) {
            profile = {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: (data.user.user_metadata?.role as UserRole) || 'student',
              student_number: data.user.user_metadata?.student_number,
              building: data.user.user_metadata?.building,
              room_number: data.user.user_metadata?.room_number,
              created_at: new Date().toISOString(),
            };
          }

          if (requiredRole && profile.role !== requiredRole) {
            throw new Error(`This account has role '${profile.role}'. Please select the ${profile.role} login tab.`);
          }

          this.saveSession(profile);
          db.setCurrentUser(profile.id);
          return profile;
        }
      } catch (err: any) {
        console.warn('Supabase Auth response notice:', err.message);
        // Fall through to verify local credential if auth user not registered on cloud yet
      }
    }

    // 2. Local verified credentials authentication
    const cred = this.credentials.get(cleanEmail);
    if (!cred) {
      throw new Error('No account found with this email. Please check your spelling or register a new account.');
    }

    if (requiredRole && cred.role !== requiredRole) {
      throw new Error(`Account registered as '${cred.role}', not '${requiredRole}'. Please switch to the ${cred.role} login tab.`);
    }

    const testHash = await hashPassword(password, cred.salt);
    if (testHash !== cred.passwordHash) {
      throw new Error('Invalid password. Please verify your credentials and try again.');
    }

    // Password matches! Fetch or create profile
    let profile = db.getAllProfiles().find((p) => p.email.toLowerCase() === cleanEmail);
    if (!profile) {
      profile = {
        id: `user_${Date.now()}`,
        full_name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email: cleanEmail,
        role: cred.role,
        student_number: cred.role === 'student' ? `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        building: cred.role === 'student' ? 'Block B (Pine Hall)' : undefined,
        room_number: cred.role === 'student' ? 'Room 201' : undefined,
        created_at: new Date().toISOString(),
      };
      (db as any).profiles.push(profile);
    }

    this.saveSession(profile);
    db.setCurrentUser(profile.id);
    return profile;
  }

  // --- REAL SIGN UP / REGISTRATION ---

  public async signUp(params: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    student_number?: string;
    building?: BuildingBlock;
    room_number?: string;
    phone_number?: string;
    staffSecurityKey?: string;
  }): Promise<Profile> {
    const cleanEmail = params.email.trim().toLowerCase();

    if (!params.full_name.trim()) {
      throw new Error('Full Name is required.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('A valid email address is required.');
    }
    if (params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // If staff registration, require authorization passcode
    if (params.role === 'staff' || params.role === 'admin') {
      if (params.staffSecurityKey !== STAFF_SECURITY_CODE) {
        throw new Error('Invalid Staff Authorization Security Code. Only official Corridor Hill personnel can create staff accounts.');
      }
    }

    // Check if account already exists
    if (this.credentials.has(cleanEmail)) {
      throw new Error('An account with this email address is already registered. Please sign in instead.');
    }

    const supabase = supabaseService.getClient();
    const isSupabaseLive = supabaseService.getStatus().isConnected;

    // 1. Supabase Auth Sign Up if connected
    if (supabase && isSupabaseLive) {
      try {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              full_name: params.full_name.trim(),
              role: params.role,
              student_number: params.student_number?.trim(),
              building: params.building,
              room_number: params.room_number?.trim(),
              phone_number: params.phone_number?.trim(),
            },
          },
        });
        if (error) {
          console.warn('Supabase remote sign up notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase remote sign up notice:', err.message);
      }
    }

    // 2. Store in local authenticated credentials
    const salt = Math.random().toString(36).substring(2, 10);
    const passwordHash = await hashPassword(params.password, salt);

    this.credentials.set(cleanEmail, {
      email: cleanEmail,
      passwordHash,
      role: params.role,
      salt,
    });
    this.saveCredentials();

    // 3. Create profile in database
    const newProfile: Profile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name: params.full_name.trim(),
      email: cleanEmail,
      role: params.role,
      student_number: params.role === 'student' ? params.student_number?.trim() || `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      building: params.building,
      room_number: params.room_number?.trim(),
      phone_number: params.phone_number?.trim(),
      created_at: new Date().toISOString(),
    };

    (db as any).profiles.push(newProfile);
    this.saveSession(newProfile);
    db.setCurrentUser(newProfile.id);

    // If Supabase is connected, also insert profile into public.profiles
    if (supabase && isSupabaseLive) {
      supabase
        .from('profiles')
        .insert([newProfile])
        .then(({ error }) => {
          if (error) console.warn('Supabase profile sync notice:', error.message);
        });
    }

    return newProfile;
  }

  // --- PASSWORD RESET ---

  public async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cred = this.credentials.get(cleanEmail);

    if (!cred) {
      throw new Error('No registered account found with this email.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const salt = Math.random().toString(36).substring(2, 10);
    const passwordHash = await hashPassword(newPassword, salt);
    cred.passwordHash = passwordHash;
    cred.salt = salt;

    this.credentials.set(cleanEmail, cred);
    this.saveCredentials();

    const supabase = supabaseService.getClient();
    if (supabase && supabaseService.getStatus().isConnected) {
      supabase.auth.updateUser({ password: newPassword }).catch((e) => {
        console.warn('Supabase remote password update notice:', e);
      });
    }

    return true;
  }

  // --- SESSION MANAGEMENT ---

  private saveSession(profile: Profile) {
    const session: AuthSession = {
      token: `chm_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user: profile,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Session save failed', e);
    }
  }

  public getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!stored) return null;
      const session: AuthSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        this.signOut();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  public signOut() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      const supabase = supabaseService.getClient();
      if (supabase) {
        supabase.auth.signOut().catch(() => {});
      }
      db.logout();
    } catch (e) {
      console.warn('Sign out cleanup error', e);
    }
  }
}

export const authService = new AuthService();
