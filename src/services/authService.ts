import { Profile, UserRole, BuildingBlock } from '../types/database';
import { db } from './db';
import { supabaseService } from './supabase';

export interface AuthSession {
  token: string;
  user: Profile;
  expiresAt: number;
}

const STORAGE_KEYS = {
  SESSION: 'chm_auth_session_live_v1',
};

// Staff Authorization Passcode for registering new staff members
export const STAFF_SECURITY_CODE = 'CORRIDOR-STAFF-5849';

class AuthService {
  constructor() {
    this.init();
  }

  private init() {
    // Purge legacy mock credentials
    try {
      localStorage.removeItem('chm_auth_credentials_prod_v2');
      localStorage.removeItem('chm_auth_credentials_v1');
    } catch (_) { }
  }

  // --- REAL SUPABASE SIGN IN ---
  public async signIn(email: string, password: string, requiredRole?: 'student' | 'staff'): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Please enter your university email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const supabase = supabaseService.getClient();
    if (!supabase) {
      throw new Error(
        'Database connection error: Supabase credentials are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings and redeploy.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed: user not returned from Supabase.');
    }

    // Load full profile directly from Supabase public.profiles table
    let profile: Profile | null = null;
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileRow) {
      profile = profileRow as Profile;
    } else {
      profile = {
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: (data.user.user_metadata?.role as UserRole) || 'student',
        student_number: data.user.user_metadata?.student_number,
        building: data.user.user_metadata?.building,
        room_number: data.user.user_metadata?.room_number,
        phone_number: data.user.user_metadata?.phone_number,
        created_at: data.user.created_at || new Date().toISOString(),
      };
      await supabase.from('profiles').upsert([profile], { onConflict: 'id' });
    }

    if (requiredRole && profile.role !== requiredRole) {
      throw new Error(`This account has role '${profile.role}'. Please switch to the ${profile.role} login tab.`);
    }

    this.saveSession(profile);
    db.setCurrentUser(profile);
    return profile;
  }

  // --- REAL SUPABASE REGISTRATION ---
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

    if (params.role === 'staff' || params.role === 'admin') {
      if (params.staffSecurityKey !== STAFF_SECURITY_CODE) {
        throw new Error('Invalid Staff Authorization Security Code. Only official Corridor Hill personnel can create staff accounts.');
      }
    }

    const supabase = supabaseService.getClient();
    if (!supabase) {
      throw new Error(
        'Database connection error: Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel Project Settings and redeploy.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
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
          password: params.password,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed: no user returned from Supabase.');
    }

    const newProfile: Profile = {
      id: data.user.id,
      full_name: params.full_name.trim(),
      email: cleanEmail,
      role: params.role,
      student_number: params.role === 'student' ? params.student_number?.trim() || `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      building: params.building,
      room_number: params.room_number?.trim(),
      phone_number: params.phone_number?.trim(),
      password: params.password,
      created_at: new Date().toISOString(),
    };

    // Ensure session is set if returned (when email confirmation is disabled in Supabase)
    if (data.session) {
      try {
        await supabase.auth.setSession(data.session);
      } catch (_) { }
    }

    // Sync to public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([newProfile], { onConflict: 'id' });

    if (profileError) {
      console.warn('Supabase public.profiles upsert notice:', profileError.message);
    }

    this.saveSession(newProfile);
    db.setCurrentUser(newProfile);
    return newProfile;
  }

  // --- PASSWORD RESET ---
  public async resetPassword(email: string, _newPassword?: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = supabaseService.getClient();
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  // --- SESSION MANAGEMENT ---
  private saveSession(profile: Profile) {
    const session: AuthSession = {
      token: `chm_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user: profile,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (_) { }
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
    } catch (_) {
      return null;
    }
  }

  public signOut() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      const supabase = supabaseService.getClient();
      if (supabase) {
        supabase.auth.signOut().catch(() => { });
      }
      db.logout();
    } catch (e) {
      console.warn('Sign out cleanup error', e);
    }
  }
}

export const authService = new AuthService();
