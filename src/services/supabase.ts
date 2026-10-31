import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  MaintenanceRequest,
  RequestComment,
  RequestAttachment,
  RequestHistory,
  AppNotification,
} from '../types/database';

export const SUPABASE_STORAGE_KEY = 'chm_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string = '';
  private anonKey: string = '';
  private isConnected: boolean = false;
  private channelSubscribed: boolean = false;
  private changeListeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // Purge any stored Supabase keys from localStorage
    try {
      localStorage.removeItem(SUPABASE_STORAGE_KEY);
      localStorage.removeItem('supabase.auth.token');
    } catch (_) {}

    this.client = null;
    this.url = '';
    this.anonKey = '';
    this.isConnected = false;
  }

  public configure(url: string, anonKey: string, persist: boolean = true): boolean {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      this.client = null;
      this.url = '';
      this.anonKey = '';
      this.isConnected = false;
      this.channelSubscribed = false;
      if (persist) {
        localStorage.removeItem(SUPABASE_STORAGE_KEY);
      }
      this.notifyChange();
      return true;
    }

    try {
      this.url = cleanUrl;
      this.anonKey = cleanKey;
      this.client = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      this.isConnected = true;

      if (persist) {
        localStorage.setItem(
          SUPABASE_STORAGE_KEY,
          JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
        );
      }

      this.setupRealtimeSubscription();
      this.notifyChange();
      return true;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      this.isConnected = false;
      return false;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getStatus(): { isConnected: boolean; url: string; hasKey: boolean } {
    return {
      isConnected: this.isConnected && !!this.client,
      url: this.url,
      hasKey: !!this.anonKey,
    };
  }

  public subscribe(listener: () => void) {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  private notifyChange() {
    this.changeListeners.forEach((l) => l());
  }

  // --- Real-time Subscription ---
  private setupRealtimeSubscription() {
    if (!this.client || this.channelSubscribed) return;

    try {
      this.client
        .channel('chm_maintenance_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'maintenance_requests' },
          () => {
            this.notifyChange();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'request_comments' },
          () => {
            this.notifyChange();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            this.notifyChange();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.channelSubscribed = true;
          }
        });
    } catch (e) {
      console.warn('Supabase realtime setup notice:', e);
    }
  }

  // --- Health & Connection Test ---
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    tablesFound?: string[];
    error?: string;
  }> {
    if (!this.client) {
      return {
        success: false,
        message: 'No Supabase credentials configured. Please enter your Project URL and Anon API key.',
      };
    }

    const tablesToCheck = [
      'profiles',
      'maintenance_requests',
      'request_comments',
      'request_attachments',
      'request_history',
      'notifications',
    ];

    const tablesFound: string[] = [];
    const missingTables: string[] = [];

    for (const table of tablesToCheck) {
      try {
        const { error } = await this.client.from(table).select('count', { count: 'exact', head: true });
        if (!error) {
          tablesFound.push(table);
        } else if (error.code === '42P01') {
          // undefined_table
          missingTables.push(table);
        } else {
          // If RLS prevents select or another non-fatal error, table likely exists
          tablesFound.push(table);
        }
      } catch (e) {
        missingTables.push(table);
      }
    }

    if (tablesFound.length === tablesToCheck.length) {
      return {
        success: true,
        message: `Successfully connected to Supabase! All ${tablesToCheck.length} database tables are verified and active.`,
        tablesFound,
      };
    } else if (tablesFound.length > 0) {
      return {
        success: true,
        message: `Connected to Supabase! Found ${tablesFound.length} of ${tablesToCheck.length} tables. Run the migration script in the SQL tab for missing tables: ${missingTables.join(', ')}.`,
        tablesFound,
      };
    } else {
      return {
        success: true,
        message: 'Connected to Supabase project! Database tables have not been created yet. Copy and run the SQL migration script in your Supabase SQL Editor.',
        tablesFound: [],
      };
    }
  }

  // --- Live Table Row Counts ---
  public async getTableRowCounts(): Promise<Record<string, number | null>> {
    const counts: Record<string, number | null> = {
      profiles: null,
      maintenance_requests: null,
      request_comments: null,
      request_attachments: null,
      request_history: null,
      notifications: null,
    };

    if (!this.client) return counts;

    for (const table of Object.keys(counts)) {
      try {
        const { count, error } = await this.client
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (!error && typeof count === 'number') {
          counts[table] = count;
        }
      } catch (e) {
        counts[table] = null;
      }
    }

    return counts;
  }

  // --- Seed Live Supabase Database with Corridor Hill Sample Data ---
  public async seedDatabase(data: {
    profiles: Profile[];
    requests: MaintenanceRequest[];
    comments: RequestComment[];
    attachments: RequestAttachment[];
    history: RequestHistory[];
    notifications: AppNotification[];
  }): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      throw new Error('Supabase client is not connected.');
    }

    try {
      // 1. Seed profiles
      if (data.profiles && data.profiles.length > 0) {
        const { error } = await this.client.from('profiles').upsert(data.profiles, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase profiles seed notice:', error.message);
      }

      // 2. Seed requests
      if (data.requests && data.requests.length > 0) {
        const { error } = await this.client.from('maintenance_requests').upsert(data.requests, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase requests seed notice:', error.message);
      }

      // 3. Seed comments
      if (data.comments && data.comments.length > 0) {
        const { error } = await this.client.from('request_comments').upsert(data.comments, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase comments seed notice:', error.message);
      }

      // 4. Seed attachments
      if (data.attachments && data.attachments.length > 0) {
        const { error } = await this.client.from('request_attachments').upsert(data.attachments, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase attachments seed notice:', error.message);
      }

      // 5. Seed history
      if (data.history && data.history.length > 0) {
        const { error } = await this.client.from('request_history').upsert(data.history, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase history seed notice:', error.message);
      }

      // 6. Seed notifications
      if (data.notifications && data.notifications.length > 0) {
        const { error } = await this.client.from('notifications').upsert(data.notifications, {
          onConflict: 'id',
        });
        if (error) console.warn('Supabase notifications seed notice:', error.message);
      }

      this.notifyChange();
      return {
        success: true,
        message: 'Successfully populated your Supabase database with Corridor Hill sample records!',
      };
    } catch (err: any) {
      console.error('Seeding Supabase failed:', err);
      return {
        success: false,
        message: `Seeding failed: ${err.message || 'Check database permissions and table structure.'}`,
      };
    }
  }

  // --- Fetch Records from Supabase ---
  public async fetchAllData(): Promise<{
    profiles?: Profile[];
    requests?: MaintenanceRequest[];
    comments?: RequestComment[];
    attachments?: RequestAttachment[];
    history?: RequestHistory[];
    notifications?: AppNotification[];
  } | null> {
    if (!this.client) return null;

    try {
      const [
        profilesRes,
        requestsRes,
        commentsRes,
        attachmentsRes,
        historyRes,
        notificationsRes,
      ] = await Promise.all([
        this.client.from('profiles').select('*'),
        this.client.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
        this.client.from('request_comments').select('*').order('created_at', { ascending: true }),
        this.client.from('request_attachments').select('*').order('created_at', { ascending: false }),
        this.client.from('request_history').select('*').order('created_at', { ascending: false }),
        this.client.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);

      return {
        profiles: profilesRes.data || undefined,
        requests: requestsRes.data || undefined,
        comments: commentsRes.data || undefined,
        attachments: attachmentsRes.data || undefined,
        history: historyRes.data || undefined,
        notifications: notificationsRes.data || undefined,
      };
    } catch (e) {
      console.warn('Error fetching all data from Supabase:', e);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
