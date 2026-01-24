# Design Document: Video Playback Fix

## Overview

This design addresses the video playback issue where recorded videos display as black rectangles in the editor. The root cause is that the HTML5 video element receives a blob URL but doesn't explicitly trigger the loading process. While the video has `preload="auto"`, this attribute alone is insufficient in some browsers or scenarios to guarantee the video loads and displays.

The solution involves explicitly calling the `load()` method on the video element when the source changes, and adding proper event handlers to track loading states and errors. This ensures the video content is loaded and the first frame is displayed immediately when users navigate to the editor.

## Architecture

The fix involves three main components working together:

1. **VideoPreview Component**: Renders the video element and triggers explicit loading when the videoUrl prop changes
2. **useVideoPlayer Hook**: Manages video state, event listeners, and provides playback controls
3. **Editor Page**: Creates the blob URL and passes it to the VideoPreview component

The data flow is:
```
Recorded Blob → Object URL Creation → VideoPreview Component → Video Element → load() → Event Handlers → State Updates
```

## Components and Interfaces

### VideoPreview Component Changes

**Current Implementation:**
```typescript
<video
  ref={videoRef}
  src={videoUrl ?? undefined}
  className="w-full aspect-video bg-black"
  style={getCropStyles()}
  playsInline
  preload="auto"
/>
```

**Updated Implementation:**
The component will use a `useEffect` hook to explicitly call `load()` when the videoUrl changes:

```typescript
useEffect(() => {
  if (videoRef?.current && videoUrl) {
    videoRef.current.load();
  }
}, [videoUrl, videoRef]);
```

**Interface Changes:**
- No changes to the component's props interface
- Internal behavior change: explicit load triggering

### useVideoPlayer Hook Changes

**Current Event Listeners:**
- `durationchange`
- `loadedmetadata`
- `loadeddata`
- `play`
- `pause`
- `ended`
- `seeked`

**Additional Event Listeners:**
- `error`: Captures video loading errors
- `loadstart`: Tracks when loading begins

**New State:**
```typescript
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

**Updated Return Interface:**
```typescript
interface UseVideoPlayerReturn {
  // ... existing properties
  error: string | null;
  isLoading: boolean;
}
```

**Error Handling Logic:**
```typescript
const handleError = () => {
  if (video.error) {
    const errorMessage = `Video error: ${video.error.code} - ${getErrorMessage(video.error.code)}`;
    setError(errorMessage);
    console.error(errorMessage);
  }
};

const handleLoadStart = () => {
  setIsLoading(true);
  setError(null);
};

const handleLoadedData = () => {
  setIsLoading(false);
  const dur = video.duration;
  if (isFinite(dur) && !isNaN(dur) && dur > 0) {
    setDuration(dur);
  }
  setCurrentTime(video.currentTime);
};
```

**Error Message Helper:**
```typescript
function getErrorMessage(code: number): string {
  switch (code) {
    case 1: return "MEDIA_ERR_ABORTED - Video loading aborted";
    case 2: return "MEDIA_ERR_NETWORK - Network error while loading video";
    case 3: return "MEDIA_ERR_DECODE - Video decoding failed";
    case 4: return "MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported";
    default: return "Unknown error";
  }
}
```

### Editor Page Changes

**Current Implementation:**
The Editor Page already correctly creates and manages the blob URL using `useMemo` and cleanup with `useEffect`. No changes needed.

**Potential Enhancement (Optional):**
Add error display UI if the video fails to load:

```typescript
{error && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
    <div className="text-center text-white p-4">
      <p className="font-medium">Failed to load video</p>
      <p className="text-sm text-gray-300 mt-2">{error}</p>
    </div>
  </div>
)}
```

## Data Models

### Video Error State

```typescript
type VideoError = {
  code: number;
  message: string;
} | null;
```

### Video Loading State

```typescript
type VideoLoadingState = {
  isLoading: boolean;
  error: string | null;
  duration: number;
  isReady: boolean; // true when duration > 0 and no error
};
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Video Loading Trigger

*For any* valid video blob URL, when it is set as the video element's source, the video element should trigger the load process and fire the `loadstart` event.

**Validates: Requirements 1.1, 1.2**

### Property 2: Duration Capture

*For any* video with a valid duration, when the video metadata loads, the Video_Player_Hook should capture and store the exact duration value from the video element.

**Validates: Requirements 1.3, 3.1**

### Property 3: Time Formatting

*For any* non-negative finite duration value in seconds, the formatTime function should return a string in MM:SS format where minutes and seconds are zero-padded to 2 digits.

**Validates: Requirements 3.2**

### Property 4: Source Change Reset

*For any* video element with a current playback position, when the video source changes to a new URL, the current time should reset to zero.

**Validates: Requirements 3.3**

### Property 5: Error Handling

*For any* video loading error (invalid URL, network failure, unsupported format, or revoked blob), the Video_Player_Hook should capture the error, expose it in the error state, log descriptive information, and continue functioning without crashing.

**Validates: Requirements 4.1, 4.3, 4.4**

## Error Handling

### Video Loading Errors

The system handles five categories of video loading errors:

1. **MEDIA_ERR_ABORTED (code 1)**: User aborted video loading
   - Action: Log error, set error state, allow retry
   
2. **MEDIA_ERR_NETWORK (code 2)**: Network error during loading
   - Action: Log error, set error state with network message, suggest retry
   
3. **MEDIA_ERR_DECODE (code 3)**: Video decoding failed
   - Action: Log error, set error state, indicate format issue
   
4. **MEDIA_ERR_SRC_NOT_SUPPORTED (code 4)**: Video format not supported
   - Action: Log error, set error state, indicate browser limitation
   
5. **Invalid or Revoked Blob URL**: URL is malformed or has been revoked
   - Action: Catch error, log, set error state, prevent crash

### Error Recovery

- Errors are non-fatal and don't crash the application
- Error state is exposed to UI components for user feedback
- Users can attempt to create a new recording to recover
- Console logs provide debugging information for developers

### Edge Cases

1. **Duration is NaN or Infinity**: 
   - The formatTime function returns "00:00" for invalid values
   - Duration state remains at 0 until valid value is available
   
2. **Video source changes during playback**:
   - Current playback is stopped
   - Animation frame loop is cancelled
   - New video loads from beginning
   
3. **Component unmounts during loading**:
   - Object URL is revoked in cleanup
   - Event listeners are removed
   - Animation frames are cancelled

## Testing Strategy

### Unit Testing

Unit tests will focus on specific scenarios and edge cases:

1. **formatTime function**:
   - Test valid durations (0, 30, 65, 3661 seconds)
   - Test edge cases (NaN, Infinity, negative values)
   - Verify MM:SS format with zero-padding

2. **Error handling**:
   - Test each error code (1-4) produces correct message
   - Test error state is set correctly
   - Test console.error is called with descriptive message

3. **Component integration**:
   - Test VideoPreview calls load() when videoUrl changes
   - Test load() is not called when videoUrl is null
   - Test cleanup revokes object URLs

### Property-Based Testing

Property-based tests will verify universal behaviors across many generated inputs:

1. **Property 1: Video Loading Trigger**
   - Generate random valid blob URLs
   - Verify loadstart event fires for each
   - Minimum 100 iterations

2. **Property 2: Duration Capture**
   - Generate videos with random durations (1-3600 seconds)
   - Verify hook captures exact duration
   - Minimum 100 iterations

3. **Property 3: Time Formatting**
   - Generate random duration values (0-86400 seconds)
   - Verify format is always MM:SS with zero-padding
   - Test edge cases are handled (NaN, Infinity, negative)
   - Minimum 100 iterations

4. **Property 4: Source Change Reset**
   - Generate random video sources and playback positions
   - Change source and verify currentTime resets to 0
   - Minimum 100 iterations

5. **Property 5: Error Handling**
   - Generate various error scenarios (invalid URLs, error codes)
   - Verify error state is set and no crashes occur
   - Minimum 100 iterations

### Testing Configuration

- **Framework**: Jest with React Testing Library for unit tests
- **PBT Library**: fast-check for property-based testing
- **Iterations**: Minimum 100 per property test
- **Tagging**: Each property test tagged with: `Feature: video-playback-fix, Property N: [property text]`

### Test Coverage Goals

- 100% coverage of error handling paths
- 100% coverage of formatTime function
- 100% coverage of video loading logic
- Property tests validate behavior across wide input ranges
