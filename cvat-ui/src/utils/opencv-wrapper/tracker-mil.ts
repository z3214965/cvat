// Copyright (C) 2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { clamp } from 'utils/math';
import { TrackerModel, TrackingResult } from './opencv-interfaces';

export type TrackerMIL = TrackerModel;

export default class TrackerMILImplementation implements TrackerMIL {
    public name: string;
    private imageData: ImageData | null;
    private cv: any;
    private trackerMIL: any;
    private maxSize: number;
    private imageScale: number;

    constructor(cv: any) {
        this.cv = cv;
        this.trackerMIL = new cv.TrackerMIL();
        this.imageData = null;
        this.maxSize = 1080;
        this.imageScale = 1;
        this.name = 'TrackerMIL';
    }

    private optResize(
        width: number,
        height: number,
        matImage: any,
    ): {
        scale: number;
        width: number;
        height: number;
        resized: any;
    } {
        if (height > this.maxSize || width > this.maxSize) {
            const resized = new this.cv.Mat();
            const scaleFactor = Math.min(this.maxSize / height, this.maxSize / width);
            const targetWidth = Math.round(width * scaleFactor);
            const targetHeight = Math.round(height * scaleFactor);
            this.cv.resize(matImage, resized, new this.cv.Size(targetWidth, targetHeight));

            return {
                scale: scaleFactor,
                width: targetWidth,
                height: targetHeight,
                resized,
            };
        }

        return {
            scale: 1,
            width,
            height,
            resized: matImage,
        };
    }

    public init(src: ImageData, points: number[]): void {
        if (points.length !== 4) {
            throw Error(`TrackerMIL 必须使用矩形进行初始化，但实际获取到 ${points.length % 2} 个点。`);
        }

        this.imageData = src;
        let matImage = null;
        try {
            matImage = this.cv.matFromImageData(src);
            const {
                width: resizedWidth,
                height: resizedHeight,
                scale,
                resized,
            } = this.optResize(src.width, src.height, matImage);
            this.imageScale = scale;

            if (resized !== matImage) {
                matImage.delete();
                matImage = resized;
            }

            // cut bounding box if its out of image bounds
            const x1 = clamp(points[0] * scale, 0, resizedWidth);
            const y1 = clamp(points[1] * scale, 0, resizedHeight);
            const x2 = clamp(points[2] * scale, 0, resizedWidth);
            const y2 = clamp(points[3] * scale, 0, resizedHeight);

            const [boxWidth, boxHeight] = [x2 - x1, y2 - y1];
            if (boxWidth === 0 || boxHeight === 0) {
                throw Error('TrackerMIL检测到矩形超出图像边界');
            }

            const rect = new this.cv.Rect(x1, y1, boxWidth, boxHeight);
            this.trackerMIL.init(matImage, rect);
        } finally {
            if (matImage) {
                matImage.delete();
            }
        }
    }

    public reinit(points: number[]): void {
        if (!this.imageData) {
            throw Error('在重新初始化之前，需要先初始化TrackerMIL');
        }

        this.trackerMIL.delete();
        this.trackerMIL = new this.cv.TrackerMIL();
        this.init(this.imageData, points);
    }

    public update(src: ImageData): TrackingResult {
        if (!this.imageData) {
            throw Error('在更新之前，需要先初始化TrackerMIL');
        }

        const prevRes = `${this.imageData.width}x${this.imageData.height}`;
        const curRes = `${src.width}x${src.height}`;
        if (prevRes !== curRes) {
            throw new Error(`图片分辨率不一致(上一帧 ${prevRes}, 当前帧 ${curRes})`);
        }

        this.imageData = src;
        let matImage = null;
        try {
            matImage = this.cv.matFromImageData(src);
            const { resized } = this.optResize(src.width, src.height, matImage);
            if (resized !== matImage) {
                matImage.delete();
                matImage = resized;
            }

            const [updated, rect] = this.trackerMIL.update(matImage);
            return {
                updated,
                points: [
                    rect.x / this.imageScale,
                    rect.y / this.imageScale,
                    (rect.x + rect.width) / this.imageScale,
                    (rect.y + rect.height) / this.imageScale,
                ],
            };
        } finally {
            if (matImage) {
                matImage.delete();
            }
        }
    }

    public delete(): void {
        this.trackerMIL.delete();
    }
}
