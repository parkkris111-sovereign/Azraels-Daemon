# Implementation Plan: Google Drive Picker Integration

## Objective
Integrate the Google Picker API into the existing Task Capture modal to allow users to select files from Google Drive as part of creating a new task.

## Phases

### Phase 1: Authentication & Script Loading
- Implement a hook to load the Google Picker API script asynchronously.
- Ensure OAuth token management (client-side) to provide secure access to Drive scopes.

### Phase 2: UI Integration (Task Capture Modal)
- Modify `src/components/CaptureTaskModal.tsx`.
- Add a "Select from Drive" button.
- Implement the picker UI toggle logic using the authenticated token.

### Phase 3: Selection Handling
- Implement the callback for the picker to receive selected Drive file details (name, URL, ID).
- Populate task data (or display selection) in the modal.

### Phase 4: Verification
- Validate secure token usage.
- Verify file picker functionality.
- Ensure consistent UI styling.
