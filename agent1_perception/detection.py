"""
Agent 1: Perception
YOLOv9 detection + ByteTrack tracking + heatmap generation
Adapted from Kaggle notebook: yolov9-supervision-heatmap-track-count

Note: reference paper used YOLOv8 + BOT-SORT. We implemented with YOLOv9 + ByteTrack
(via the Supervision library) for faster integration and comparable performance.
"""
import warnings
warnings.filterwarnings('ignore')
import json
import cv2
import requests
from ultralytics import YOLO
import supervision as sv
from agent2_reasoning.behaviour_classifier import BehaviourClassifier, build_alert


class CFG:
    MODEL_WEIGHTS = 'yolov9c.pt'
    CONFIDENCE = 0.35
    IOU = 0.5
    HEATMAP_ALPHA = 0.30
    RADIUS = 20
    TRACK_SECONDS = 5
    TRACK_THRESH = 0.35
    MATCH_THRESH = 0.9999
    VIDEO_FILE = "path/to/your/video.mp4"  # set this to your local test clip path
    OUTPUT_PATH = './'
    DASHBOARD_URL = "http://127.0.0.1:8000/alerts"  # localhost, since running both locally tonight


def send_alert_to_dashboard(person_id, alert_type, location):
    try:
        payload = {
            "person_id": int(person_id),
            "alert_type": alert_type,
            "severity": "HIGH" if alert_type == "SUSPICIOUS" else "MEDIUM",
            "message": f"Person {person_id} detected as {alert_type}",
            "recipient": "Security" if alert_type == "SUSPICIOUS" else "Floor Staff",
            "zone": f"Zone ({int(location['x'])}, {int(location['y'])})"
        }
        requests.post(CFG.DASHBOARD_URL, json=payload, timeout=3)
        print("Alert sent to dashboard!")
    except Exception as e:
        print(f"Could not send: {e}")


def run_detection_and_tracking():
    model = YOLO(CFG.MODEL_WEIGHTS)

    video_info = sv.VideoInfo.from_video_path(video_path=CFG.VIDEO_FILE)
    frames_generator = sv.get_video_frames_generator(source_path=CFG.VIDEO_FILE, stride=1)
    output_filename = f'{CFG.OUTPUT_PATH}heatmap_output_c{int(CFG.CONFIDENCE * 100)}_iou{int(CFG.IOU * 100)}.mp4'

    heat_map_annotator = sv.HeatMapAnnotator(
        position=sv.Position.BOTTOM_CENTER,
        opacity=CFG.HEATMAP_ALPHA,
        radius=CFG.RADIUS,
        kernel_size=25,
        top_hue=0,
        low_hue=125,
    )
    label_annotator = sv.LabelAnnotator(text_position=sv.Position.CENTER)
    byte_tracker = sv.ByteTrack(
        track_thresh=CFG.TRACK_THRESH,
        track_buffer=CFG.TRACK_SECONDS * video_info.fps,
        match_thresh=CFG.MATCH_THRESH,
        frame_rate=video_info.fps
    )

    classifier = BehaviourClassifier(fps=video_info.fps)
    all_alerts = []
    frame_index = 0

    with sv.VideoSink(target_path=output_filename, video_info=video_info) as sink:
        for frame in frames_generator:
            result = model(
                source=frame,
                classes=[0],
                conf=CFG.CONFIDENCE,
                iou=CFG.IOU,
                half=False,  # set False for CPU; half precision needs GPU
                show_conf=True,
                save_txt=True,
                save_conf=True,
                save=True,
                device='cpu',  # running locally without GPU
            )[0]

            detections = sv.Detections.from_ultralytics(result)
            detections = byte_tracker.update_with_detections(detections)

            annotated_frame = heat_map_annotator.annotate(
                scene=frame.copy(),
                detections=detections
            )

            labels = [
                f"#{tracker_id}"
                for class_id, tracker_id
                in zip(detections.class_id, detections.tracker_id)
            ]
            label_annotator.annotate(
                scene=annotated_frame,
                detections=detections,
                labels=labels
            )

            for class_id, tracker_id, bbox in zip(detections.class_id, detections.tracker_id, detections.xyxy):
                x_center = (bbox[0] + bbox[2]) / 2
                y_bottom = bbox[3]

                triggered_alerts = classifier.update(tracker_id, x_center, y_bottom, frame_index)

                for alert_type in triggered_alerts:
                    alert = build_alert(tracker_id, alert_type, frame_index, x_center, y_bottom, video_info.fps)
                    print("ALERT:", alert)
                    send_alert_to_dashboard(alert['person_id'], alert['alert_type'], alert['location'])
                    all_alerts.append(alert)

            sink.write_frame(frame=annotated_frame)
            frame_index += 1

    with open(f'{CFG.OUTPUT_PATH}alerts.json', 'w') as f:
        json.dump(all_alerts, f, indent=2)
    print(f"Saved {len(all_alerts)} alerts to alerts.json")
    print(f"Done. Output saved to {output_filename}")


if __name__ == "__main__":
    run_detection_and_tracking()
