// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { Storage } from './storage';
import serverProxy from './server-proxy';
import AnnotationsCollection from './annotations-collection';
import AnnotationsSaver from './annotations-saver';
import AnnotationsHistory from './annotations-history';
import { checkObjectType } from './common';
import Project from './project';
import { Task, Job } from './session';
import { ArgumentError } from './exceptions';
import { getFramesMeta, getJobFramesMetaSync } from './frames';
import { JobType } from './enums';

const jobCollectionCache = new WeakMap<Task | Job, { collection: AnnotationsCollection; saver: AnnotationsSaver; }>();
const taskCollectionCache = new WeakMap<Task | Job, { collection: AnnotationsCollection; saver: AnnotationsSaver; }>();

// save history separately as not all history actions are related to annotations (e.g. delete, restore frame are not)
const jobHistoryCache = new WeakMap<Task | Job, AnnotationsHistory>();
const taskHistoryCache = new WeakMap<Task | Job, AnnotationsHistory>();

function getCache(sessionType: 'task' | 'job'): {
    collection: typeof jobCollectionCache;
    history: typeof jobHistoryCache;
} {
    if (sessionType === 'task') {
        return {
            collection: taskCollectionCache,
            history: taskHistoryCache,
        };
    }

    return {
        collection: jobCollectionCache,
        history: jobHistoryCache,
    };
}

class InstanceNotInitializedError extends Error {}

export function getCollection(session): AnnotationsCollection {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const { collection } = getCache(sessionType);

    if (collection.has(session)) {
        return collection.get(session).collection;
    }

    throw new InstanceNotInitializedError('会话尚未初始化，请先调用 annotations.get() 或 annotations.clear({ reload: true})');
}

export function getSaver(session): AnnotationsSaver {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const { collection } = getCache(sessionType);

    if (collection.has(session)) {
        return collection.get(session).saver;
    }

    throw new InstanceNotInitializedError('会话尚未初始化，请在操作前调用 annotations.get() 或 annotations.clear({ reload: true})');
}

export function getHistory(session): AnnotationsHistory {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const { history } = getCache(sessionType);

    if (history.has(session)) {
        return history.get(session);
    }

    const initiatedHistory = new AnnotationsHistory();
    history.set(session, initiatedHistory);
    return initiatedHistory;
}

async function getAnnotationsFromServer(session: Job | Task): Promise<void> {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (!cache.collection.has(session)) {
        const serializedAnnotations = await serverProxy.annotations.getAnnotations(sessionType, session.id);

        // Get meta information about frames
        const frameMeta = await getFramesMeta(sessionType, session.id);
        const frameNumbers = frameMeta.getSegmentFrameNumbers(session instanceof Job ? session.startFrame : 0);

        const history = cache.history.has(session) ? cache.history.get(session) : new AnnotationsHistory();
        const collection = new AnnotationsCollection({
            // Job collections use real job metadata. Task collections use constant defaults because
            // task-level annotations are not tied to a particular job type or consensus replica set.
            jobType: session instanceof Job ? session.type : JobType.ANNOTATION,
            stopFrame: session instanceof Job ? session.stopFrame : session.size - 1,
            labels: session.labels,
            dimension: session.dimension,
            replicasCount: session instanceof Job ? session.replicasCount : undefined,
            framesInfo: {
                isFrameDeleted: session instanceof Job ?
                    (frame: number) => !!getJobFramesMetaSync(session.id).deletedFrames[frame] :
                    (frame: number) => !!frameMeta.deletedFrames[frame],
                ...frameMeta.frames.reduce((acc, frameInfo, idx) => {
                    // keep only static information
                    acc[frameNumbers[idx]] = {
                        width: frameInfo.width,
                        height: frameInfo.height,
                    };
                    return acc;
                }, {}),
            },
            history,
        });

        collection.import(serializedAnnotations);
        const saver = new AnnotationsSaver(collection, session);
        cache.collection.set(session, { collection, saver });
        cache.history.set(session, history);
    }
}

export function clearCache(session): void {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.collection.has(session)) {
        cache.collection.delete(session);
    }

    if (cache.history.has(session)) {
        cache.history.delete(session);
    }
}

export async function getAnnotations(
    session: Job | Task,
    frame: number,
    allTracks: boolean,
    filters: object[],
): Promise<ReturnType<AnnotationsCollection['get']>> {
    try {
        return getCollection(session).get(frame, allTracks, filters);
    } catch (error) {
        if (error instanceof InstanceNotInitializedError) {
            await getAnnotationsFromServer(session);
            return getCollection(session).get(frame, allTracks, filters);
        }
        throw error;
    }
}

export async function getAllIntervals(
    session: Job | Task,
    filters: object[],
): Promise<ReturnType<AnnotationsCollection['getAllIntervals']>> {
    try {
        return getCollection(session).getAllIntervals(filters);
    } catch (error) {
        if (error instanceof InstanceNotInitializedError) {
            await getAnnotationsFromServer(session);
            return getCollection(session).getAllIntervals(filters);
        }
        throw error;
    }
}

export async function clearAnnotations(
    session: Task | Job,
    options: Parameters<typeof Job.prototype.annotations.clear>[0],
): Promise<void> {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (Object.hasOwn(options ?? {}, 'reload')) {
        const { reload } = options;
        checkObjectType('重新加载', reload, 'boolean');

        if (reload) {
            cache.collection.delete(session);
            // delete history as it may relate to objects from collection we deleted above
            cache.history.delete(session);
            return getAnnotationsFromServer(session);
        }
    }

    return getCollection(session).clear(options);
}

export async function exportDataset(
    instance,
    format: string,
    saveImages: boolean,
    useDefaultSettings: boolean,
    targetStorage: Storage,
    name?: string,
): Promise<string | void> {
    if (!(instance instanceof Task || instance instanceof Project || instance instanceof Job)) {
        throw new ArgumentError('数据集仅可从作业、任务或项目中创建');
    }

    let result = null;
    if (instance instanceof Task) {
        result = await serverProxy.tasks
            .exportDataset(instance.id, format, saveImages, useDefaultSettings, targetStorage, name);
    } else if (instance instanceof Job) {
        result = await serverProxy.jobs
            .exportDataset(instance.id, format, saveImages, useDefaultSettings, targetStorage, name);
    } else {
        result = await serverProxy.projects
            .exportDataset(instance.id, format, saveImages, useDefaultSettings, targetStorage, name);
    }

    return result;
}

export function importDataset(
    instance: any,
    format: string,
    useDefaultSettings: boolean,
    sourceStorage: Storage,
    file: File | string,
    options: {
        convMaskToPoly?: boolean,
        importMode?: 'replace' | 'append',
        updateStatusCallback?: (message: string, progress: number) => void,
    } = {},
): Promise<string> {
    const updateStatusCallback = options.updateStatusCallback || (() => {});
    const convMaskToPoly = options.convMaskToPoly ?? true;
    const importMode = options.importMode ?? 'replace';

    if (!(instance instanceof Project || instance instanceof Task || instance instanceof Job)) {
        throw new ArgumentError('实例必须是项目、任务或作业类型');
    }
    if (!(typeof updateStatusCallback === 'function')) {
        throw new ArgumentError('回调函数必须是一个function类型');
    }
    if (!(typeof convMaskToPoly === 'boolean')) {
        throw new ArgumentError('选项"Mask转多边形"必须是布尔值');
    }
    if (importMode !== 'replace' && importMode !== 'append') {
        throw new ArgumentError('选项"导入模式"必须为"替换"或"追加"');
    }
    const allowedFileExtensions = ['.zip', '.xml', '.json', '.tsv'];
    const allowedFileExtensionsList = allowedFileExtensions.join(', ');
    if (typeof file === 'string' && !allowedFileExtensions.some((ext) => file.toLowerCase().endsWith(ext))) {
        throw new ArgumentError(
            `文件必须为文件实例，仅支持以下扩展名：${allowedFileExtensionsList}。当前传入：${file}`,
        );
    }
    const allowedMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/xml',
        'text/xml',
        'application/json',
        'text/tab-separated-values',
    ];
    if (file instanceof File && !allowedMimeTypes.includes(file.type)) {
        throw new ArgumentError(
            `文件必须为文件实例，且扩展名属于以下列表：${allowedFileExtensionsList}。当前文件MIME类型：${file.type}`,
        );
    }

    if (instance instanceof Project) {
        return serverProxy.projects
            .importDataset(
                instance.id,
                format,
                useDefaultSettings,
                sourceStorage,
                file,
                {
                    updateStatusCallback,
                    convMaskToPoly,
                },
            );
    }

    const instanceType = instance instanceof Task ? 'task' : 'job';
    return serverProxy.annotations
        .uploadAnnotations(
            instanceType,
            instance.id,
            format,
            useDefaultSettings,
            sourceStorage,
            file,
            {
                convMaskToPoly,
                importMode,
            },
        );
}
