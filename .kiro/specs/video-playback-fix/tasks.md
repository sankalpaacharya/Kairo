# Implementation Plan: Video Playback Fix

## Overview

This implementation plan fixes the video playback issue by explicitly triggering video loading when the source changes, adding comprehensive error handling, and ensuring proper state management. The fix involves modifications to the VideoPreview component and the useVideoPlayer hook.

## Tasks

- [x] 1. Add explicit video loading to VideoPreview component
  - Add useEffect hook that calls video.load() when videoUrl changes
  - Ensure load() is only called when videoRef.current exists and videoUrl is not null
  - Add null checks to prevent errors
  - _Requirements: 1.1, 1.2, 2.3_

- [ ]* 1.1 Write property test for video loading trigger
  - **Property 1: Video Loading Trigger**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 2. Enhance useVideoPlayer hook with error handling
  - [x] 2.1 Add error and isLoading state variables
    - Add `const [error, setError] = useState<string | null>(null)`
    - Add `const [isLoading, setIsLoading] = useState(false)`
    - Update UseVideoPlayerReturn interface to include error and isLoading
    - _Requirements: 4.4_

  - [x] 2.2 Implement getErrorMessage helper function
    - Create function that maps error codes (1-4) to descriptive messages
    - Handle MEDIA_ERR_ABORTED, MEDIA_ERR_NETWORK, MEDIA_ERR_DECODE, MEDIA_ERR_SRC_NOT_SUPPORTED
    - Return "Unknown error" for unrecognized codes
    - _Requirements: 4.1_

  - [ ]* 2.3 Write unit tests for getErrorMessage
    - Test each error code returns correct message
    - Test unknown codes return default message
    - _Requirements: 4.1_

  - [x] 2.4 Add error event listener to video element
    - Create handleError function that captures video.error
    - Call getErrorMessage with error code
    - Set error state and log to console
    - Add event listener in useEffect
    - _Requirements: 4.1, 4.3_

  - [x] 2.5 Add loadstart event listener
    - Create handleLoadStart function that sets isLoading to true and clears error
    - Add event listener in useEffect
    - _Requirements: 1.2_

  - [x] 2.6 Update handleLoadedData to clear loading state
    - Set isLoading to false when data loads
    - Keep existing duration and currentTime logic
    - _Requirements: 1.3, 3.1_

  - [ ]* 2.7 Write property test for error handling
    - **Property 5: Error Handling**
    - **Validates: Requirements 4.1, 4.3, 4.4**

- [x] 3. Improve formatTime function robustness
  - Update formatTime to explicitly check for NaN, Infinity, and negative values
  - Return "00:00" for invalid inputs
  - Ensure existing valid duration formatting works correctly
  - _Requirements: 3.2, 3.4_

- [ ]* 3.1 Write property test for time formatting
  - **Property 3: Time Formatting**
  - **Validates: Requirements 3.2**

- [ ]* 3.2 Write unit tests for formatTime edge cases
  - Test NaN returns "00:00"
  - Test Infinity returns "00:00"
  - Test negative values return "00:00"
  - Test valid values (0, 30, 65, 3661) format correctly
  - _Requirements: 3.2, 3.4_

- [x] 4. Add source change reset behavior
  - Update useEffect to reset currentTime when videoSrc changes
  - Ensure duration is reset until new video loads
  - Clear any existing errors when source changes
  - _Requirements: 3.3_

- [ ]* 4.1 Write property test for source change reset
  - **Property 4: Source Change Reset**
  - **Validates: Requirements 3.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Optional: Add error display UI to Editor Page
  - Check if useVideoPlayer returns error state
  - Add conditional rendering for error overlay
  - Display error message in user-friendly format
  - Style error overlay with semi-transparent background
  - _Requirements: 4.2_

- [x] 7. Update video element attributes
  - Change preload from "auto" to "metadata" for better performance
  - Verify playsInline attribute is present
  - Ensure all required attributes are set
  - _Requirements: 5.2, 5.3_

- [-] 8. Final checkpoint - Verify fix works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The core fix is in tasks 1, 2, and 3 - these are essential
- Task 6 (error UI) is optional but recommended for better UX
- Property tests validate universal correctness across many inputs
- Unit tests validate specific examples and edge cases
