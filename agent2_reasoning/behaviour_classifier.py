"""
Agent 2: Reasoning
Behavior classification from tracked positions.
Flags:
- CONFUSED: person stationary in roughly the same spot for too long
- SUSPICIOUS: person moving erratically (large, frequent direction changes)
"""

from collections import defaultdict, deque
import math
import time


class CFG:
    ### how long (seconds) a person can stay in ~same spot before flagged CONFUSED
    STATIONARY_SECONDS = 5 * 60  # 5 minutes
    ### how far (pixels) they can move and still count as "same spot"
    STATIONARY_RADIUS = 40

    ### how many recent positions to look at for erratic-movement check
    ERRATIC_WINDOW = 15
    ### how many big direction changes within that window count as SUSPICIOUS
    ERRATIC_DIRECTION_CHANGES = 6
    ### angle (degrees) considered a "sharp" direction change
    ERRATIC_ANGLE_THRESHOLD = 60


class BehaviourClassifier:
    def __init__(self, fps: float):
        self.fps = fps
        ### per tracker_id: deque of (frame_index, x, y)
        self.history = defaultdict(lambda: deque(maxlen=CFG.ERRATIC_WINDOW))
        ### per tracker_id: (anchor_x, anchor_y, frame_index_when_anchor_set)
        self.stationary_anchor = {}
        ### per tracker_id: set of alert types already raised, so we don't spam
        self.raised_alerts = defaultdict(set)

    def update(self, tracker_id: int, x: float, y: float, frame_index: int):
        """Call this once per frame per tracked person, with their bottom-center point."""
        self.history[tracker_id].append((frame_index, x, y))

        alerts = []

        if self._check_stationary(tracker_id, x, y, frame_index):
            alerts.append("CONFUSED")

        if self._check_erratic(tracker_id):
            alerts.append("SUSPICIOUS")

        return alerts

    def _check_stationary(self, tracker_id, x, y, frame_index):
        anchor = self.stationary_anchor.get(tracker_id)

        if anchor is None:
            self.stationary_anchor[tracker_id] = (x, y, frame_index)
            return False

        anchor_x, anchor_y, anchor_frame = anchor
        dist = math.hypot(x - anchor_x, y - anchor_y)

        if dist > CFG.STATIONARY_RADIUS:
            ### moved away, reset anchor
            self.stationary_anchor[tracker_id] = (x, y, frame_index)
            self.raised_alerts[tracker_id].discard("CONFUSED")
            return False

        elapsed_seconds = (frame_index - anchor_frame) / self.fps
        if elapsed_seconds >= CFG.STATIONARY_SECONDS:
            if "CONFUSED" not in self.raised_alerts[tracker_id]:
                self.raised_alerts[tracker_id].add("CONFUSED")
                return True
        return False

    def _check_erratic(self, tracker_id):
        points = list(self.history[tracker_id])
        if len(points) < 3:
            return False

        direction_changes = 0
        prev_angle = None

        for i in range(1, len(points)):
            _, x1, y1 = points[i - 1]
            _, x2, y2 = points[i]
            dx, dy = x2 - x1, y2 - y1
            if dx == 0 and dy == 0:
                continue
            angle = math.degrees(math.atan2(dy, dx))

            if prev_angle is not None:
                diff = abs(angle - prev_angle)
                diff = min(diff, 360 - diff)  # normalize
                if diff >= CFG.ERRATIC_ANGLE_THRESHOLD:
                    direction_changes += 1

            prev_angle = angle

        if direction_changes >= CFG.ERRATIC_DIRECTION_CHANGES:
            if "SUSPICIOUS" not in self.raised_alerts[tracker_id]:
                self.raised_alerts[tracker_id].add("SUSPICIOUS")
                return True
        return False


def build_alert(tracker_id: int, alert_type: str, frame_index: int, x: float, y: float, fps: float):
    """Format an alert dict — this is the schema Neharin's dashboard will consume."""
    return {
        "person_id": tracker_id,
        "alert_type": alert_type,
        "timestamp_seconds": round(frame_index / fps, 2),
        "location": {"x": round(x, 1), "y": round(y, 1)},
    }
