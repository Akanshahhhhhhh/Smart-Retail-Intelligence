"""
Agent 1: Perception
YOLOv9 detection + ByteTrack tracking + heatmap generation
Adapted from Kaggle notebook: yolov9-supervision-heatmap-track-count
"""

import warnings
warnings.filterwarnings('ignore')

import cv2
from ultralytics import YOLO
import supervision as sv


class CFG:
    ### YOLOv8/YOLOv9 custom or pretrained model
    MODEL_WEIGHTS = 'yolov9c.pt'  # yolov8s.pt, yolov9c.pt, yolov9e.pt

    ### detections (YOLO)
    CONFIDENCE = 0.35
    IOU = 0.5

    ### heatmap (Supervision)
    HEATMAP_ALPHA = 0.30
    RADIUS = 20

    ### tracking (Supervision)
    TRACK_SECONDS = 5
    TRACK_THRESH = 0.35
    MATCH_THRESH = 0.9999

    ### paths: video file path, webcam is 0
    VIDEO_FILE = "path/to/your/video.mp4"  # TODO: replace with our own store video later
    OUTPUT_PATH = './'


def run_detection_and_tracking():
    ### load model
    model = YOLO(CFG.MODEL_WEIGHTS)
    ### 0: person, 26: handbag

    ### video config
    video_info = sv.VideoInfo.from_video_path(video_path=CFG.VIDEO_FILE)
    frames_generator = sv.get_video_frames_generator(source_path=CFG.VIDEO_FILE, stride=1)
    output_filename = f'{CFG.OUTPUT_PATH}heatmap_output_c{int(CFG.CONFIDENCE * 100)}_iou{int(CFG.IOU * 100)}.mp4'

    ### heatmap config
    heat_map_annotator = sv.HeatMapAnnotator(
        position=sv.Position.BOTTOM_CENTER,
        opacity=CFG.HEATMAP_ALPHA,
        radius=CFG.RADIUS,
        kernel_size=25,
        top_hue=0,
        low_hue=125,
    )
    ### annotation config
    label_annotator = sv.LabelAnnotator(text_position=sv.Position.CENTER)
    ### tracker config
    byte_tracker = sv.ByteTrack(
        track_thresh=CFG.TRACK_THRESH,
        track_buffer=CFG.TRACK_SECONDS * video_info.fps,
        match_thresh=CFG.MATCH_THRESH,
        frame_rate=video_info.fps
    )

    ### Detect, track, annotate, save
    with sv.VideoSink(target_path=output_filename, video_info=video_info) as sink:
        for frame in frames_generator:
            result = model(
                source=frame,
                classes=[0],  # only person class
                conf=CFG.CONFIDENCE,
                iou=CFG.IOU,
                half=True,
                show_conf=True,
                save_txt=True,
                save_conf=True,
                save=True,
                device=[0, 1],  # dual GPU; change to device=0 or 'cpu' if needed locally
            )[0]

            detections = sv.Detections.from_ultralytics(result)
            detections = byte_tracker.update_with_detections(detections)

            ### draw heatmap
            annotated_frame = heat_map_annotator.annotate(
                scene=frame.copy(),
                detections=detections
            )

            ### draw ID labels
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

            sink.write_frame(frame=annotated_frame)

    print(f"Done. Output saved to {output_filename}")


if __name__ == "__main__":
    run_detection_and_tracking()
