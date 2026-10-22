// Google Drive REST API v3 Integration Utility
// Client-side execution using Bearer OAuth tokens

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
}

export interface DriveStorageQuota {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
  limit?: string;
  usage?: string;
  usageInDrive?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Fetch user profile and storage quota from Google Drive
export async function getDriveAbout(accessToken: string): Promise<DriveStorageQuota> {
  const res = await fetch(`${DRIVE_API_BASE}/about?fields=user,storageQuota`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive about request failed [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  return {
    displayName: data.user?.displayName || 'Google Workspace User',
    emailAddress: data.user?.emailAddress || 'user@gmail.com',
    photoLink: data.user?.photoLink,
    limit: data.storageQuota?.limit,
    usage: data.storageQuota?.usage,
    usageInDrive: data.storageQuota?.usageInDrive,
  };
}

// List files in Google Drive
export async function listDriveFiles(
  accessToken: string,
  params: {
    pageSize?: number;
    query?: string;
    folderId?: string;
  } = {}
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const { pageSize = 30, query = '', folderId } = params;

  let q = 'trashed = false';
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }
  if (query) {
    const cleanQuery = query.replace(/'/g, '');
    q += ` and (name contains '${cleanQuery}' or fullText contains '${cleanQuery}')`;
  }

  const url = new URL(`${DRIVE_API_BASE}/files`);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, parents, description)'
  );
  url.searchParams.set('orderBy', 'folder, modifiedTime desc');
  url.searchParams.set('q', q);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Google Drive files [${res.status}]: ${errText}`);
  }

  return await res.json();
}

// Find or create the dedicated "Daemon_Bedtime_Closures" folder
export async function ensureBedtimeClosuresFolder(
  accessToken: string,
  folderName: string = 'Daemon_Bedtime_Closures'
): Promise<string> {
  // Check if exists
  const searchQ = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  const searchUrl = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQ)}&fields=files(id,name)`;

  const checkRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (checkRes.ok) {
    const data = await checkRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Autonomous workspace loop closures sealed by Integrator Daemon prior to bedtime.',
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Drive folder ${folderName}`);
  }

  const created = await createRes.json();
  return created.id;
}

// Upload a text/markdown/json deliverable to Google Drive (Multipart upload)
export async function uploadFileToDrive(
  accessToken: string,
  params: {
    name: string;
    content: string;
    mimeType?: string;
    parentFolderId?: string;
    description?: string;
  }
): Promise<DriveFileItem> {
  const {
    name,
    content,
    mimeType = 'text/markdown; charset=UTF-8',
    parentFolderId,
    description = 'Synthesized deliverable created by Integrator Daemon',
  } = params;

  const metadata: any = {
    name,
    mimeType: mimeType.split(';')[0],
    description,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------DaemonBedtimeMultipartBoundary' + Date.now().toString(16);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload to Google Drive [${res.status}]: ${errText}`);
  }

  return await res.json();
}

// Delete file from Google Drive (Requires user confirmation in caller UI)
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete Google Drive file [${res.status}]: ${errText}`);
  }
}
