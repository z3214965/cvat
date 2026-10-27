// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { AudioIntervalState } from 'cvat-core-wrapper';
import { toClipboard } from 'utils/to-clipboard';
import { clamp } from 'utils/math';

export interface AudioTimeRange {
    start: number;
    end: number;
}

export interface AudioPlaybackRange extends AudioTimeRange {
    id: object;
}

export enum AudioRegionsOrdering {
    ID_ASCENT = 'ID - 升序',
    ID_DESCENT = 'ID - 降序',
    START_TIME = '起始时间',
    END_TIME = '结束时间',
    DURATION = '时长',
    LABEL_NAME = '标签名称',
}


export function intervalID(interval: AudioIntervalState): number {
    return interval.clientID as number;
}

export function waveRegionId(interval: AudioIntervalState): string {
    return String(intervalID(interval));
}

export function clientIDFromWaveRegionId(id: string): number | null {
    const clientID = Number(id);
    return Number.isInteger(clientID) ? clientID : null;
}

export function intervalStartSeconds(interval: Pick<AudioIntervalState, 'start' | 'stop'>): number {
    return interval.start / 1000;
}

export function intervalEndSeconds(interval: Pick<AudioIntervalState, 'start' | 'stop'>): number {
    return (interval.stop ?? interval.start) / 1000;
}

export function intervalDurationSeconds(interval: Pick<AudioIntervalState, 'start' | 'stop'>): number {
    return Math.max(0, intervalEndSeconds(interval) - intervalStartSeconds(interval));
}

export function sortAudioIntervals(
    intervals: AudioIntervalState[],
    ordering: AudioRegionsOrdering,
): AudioIntervalState[] {
    const copy = [...intervals];
    switch (ordering) {
        case AudioRegionsOrdering.ID_ASCENT:
            return copy.sort((a, b) => intervalID(a) - intervalID(b));
        case AudioRegionsOrdering.ID_DESCENT:
            return copy.sort((a, b) => intervalID(b) - intervalID(a));
        case AudioRegionsOrdering.START_TIME:
            return copy.sort((a, b) => a.start - b.start);
        case AudioRegionsOrdering.END_TIME:
            return copy.sort((a, b) => intervalEndSeconds(a) - intervalEndSeconds(b));
        case AudioRegionsOrdering.DURATION:
            return copy.sort((a, b) => intervalDurationSeconds(a) - intervalDurationSeconds(b));
        case AudioRegionsOrdering.LABEL_NAME:
            return copy.sort((a, b) => a.label.name.localeCompare(b.label.name));
        default:
            return copy;
    }
}

export function copyAudioIntervalURL(serverID?: number | null): void {
    if (Number.isInteger(serverID)) {
        const { origin, pathname } = window.location;
        toClipboard(`${origin}${pathname}?type=interval&serverID=${serverID}`);
    }
}

export function clampRange(range: AudioTimeRange, duration: number): AudioTimeRange {
    const start = clamp(range.start, 0, duration);
    return {
        start,
        end: clamp(range.end, start, duration),
    };
}
