# Single Face Tracking

Smoothly tracks a single face and attempts to keep it centered in the frame by sending coordinate deltas to an Arduino-controlled pan/tilt platform.

## Structure
- `arduino/`: `SingleFaceTracking.ino`.
- `python/`: `SingleFaceTracking.py` handles the CV logic and direct serial writing.
- `assets/`: Recorded tracking sessions.

## Configuration
The target center is typically `(width/2, height/2)`. The script sends `XnnnYnnn` strings to the Arduino for processing.
