import { GoogleKeepNote, GoogleKeepItem } from '../types';

export interface KeepApiResponse {
  success: boolean;
  notes?: GoogleKeepNote[];
  error?: string;
  isEnterpriseRestricted?: boolean;
}

/**
 * Attempts to fetch notes from the Google Keep API (keep.googleapis.com/v1/notes).
 * Note: Google Keep API v1 is enterprise-scoped for Google Workspace domain-delegated
 * service accounts. For consumer (@gmail.com) accounts, Google's API returns a 403
 * indicating permission constraints, which our daemon gracefully catches and handles.
 */
export async function fetchGoogleKeepNotesFromApi(accessToken: string): Promise<KeepApiResponse> {
  try {
    const res = await fetch('https://keep.googleapis.com/v1/notes', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return {
          success: false,
          isEnterpriseRestricted: true,
          error: 'Google Keep REST API is restricted to Workspace Enterprise domain accounts. Seamlessly operating via Local Daemon Keep Mirror.',
        };
      }
      return {
        success: false,
        error: `Google Keep API returned status ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const rawNotes = data.notes || [];

    const parsedNotes: GoogleKeepNote[] = rawNotes.map((n: any, idx: number) => {
      const items: GoogleKeepItem[] = [];
      if (n.body?.list?.listItems) {
        n.body.list.listItems.forEach((it: any, iIdx: number) => {
          items.push({
            id: it.name || `keep-item-${idx}-${iIdx}`,
            text: it.text?.text || 'Untitled Item',
            isChecked: Boolean(it.checked),
          });
        });
      }

      return {
        id: n.name || `keep-api-${idx}`,
        title: n.title || 'Untitled Keep Note',
        text: n.body?.text?.text || undefined,
        items: items.length > 0 ? items : undefined,
        color: 'amber',
        pinned: false,
        updatedAt: n.updateTime ? new Date(n.updateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        isSyncedToDaemon: false,
      };
    });

    return {
      success: true,
      notes: parsedNotes,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to connect to Google Keep API',
    };
  }
}

/**
 * Attempts to push a new note to Google Keep API
 */
export async function createGoogleKeepNoteApi(
  accessToken: string,
  note: { title: string; text?: string; items?: string[] }
): Promise<{ success: boolean; error?: string }> {
  try {
    const bodyPayload: any = {
      title: note.title,
    };

    if (note.items && note.items.length > 0) {
      bodyPayload.body = {
        list: {
          listItems: note.items.map((txt) => ({
            text: { text: txt },
            checked: false,
          })),
        },
      };
    } else if (note.text) {
      bodyPayload.body = {
        text: { text: note.text },
      };
    }

    const res = await fetch('https://keep.googleapis.com/v1/notes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Keep API responded with ${res.status}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to push note to Google Keep API',
    };
  }
}
