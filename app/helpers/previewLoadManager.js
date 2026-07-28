import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

const MAX_CONCURRENT_PREVIEWS = 6;
const MAX_READY_PREVIEWS = 2000;
const PREVIEW_TIMEOUT_MS = 6000;
const THUMBNAIL_SIZE = 128;

const THUMB_CACHE_DIR = path.join(os.tmpdir(), 'OpenMTPThumbs');

if (!fs.existsSync(THUMB_CACHE_DIR)) {
  try {
    fs.mkdirSync(THUMB_CACHE_DIR, { recursive: true });
  } catch (e) {
    // Directory creation error ignored
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try {
      if (fs.existsSync(THUMB_CACHE_DIR)) {
        fs.rmSync(THUMB_CACHE_DIR, { recursive: true, force: true });
      }
    } catch (e) {
      // Cleanup error ignored
    }
  });
}

export function isRawImageFormat(filePath) {
  return (
    typeof filePath === 'string' &&
    /\.(dng|arw|cr2|nef|orf|rw2|pef|raf|psd|tif|tiff)$/i.test(filePath)
  );
}

export function requestNativeQuickLookThumbnail(filePath) {
  return new Promise((resolve) => {
    if (!filePath) {
      return resolve(null);
    }

    const filename = path.basename(filePath);
    const thumbPath = path.join(THUMB_CACHE_DIR, `${filename}.png`);

    if (fs.existsSync(thumbPath)) {
      return resolve(pathToFileURL(thumbPath).toString());
    }

    execFile(
      'qlmanage',
      ['-t', '-s', '256', '-o', THUMB_CACHE_DIR, filePath],
      (err) => {
        if (!err && fs.existsSync(thumbPath)) {
          resolve(pathToFileURL(thumbPath).toString());
        } else {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Utility function to downscale a loaded Image element into a lightweight 128x128 JPEG DataURL.
 * Reduces RAM usage from ~50MB per high-res camera photo down to ~4KB per cached thumbnail.
 */
export function downscaleImage(img) {
  try {
    if (!img || !img.naturalWidth || !img.naturalHeight) {
      return null;
    }

    const canvas = document.createElement('canvas');

    canvas.width = THUMBNAIL_SIZE;
    canvas.height = THUMBNAIL_SIZE;

    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      return null;
    }

    // High quality smooth image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    // Center crop & cover fit
    const aspect = img.naturalWidth / img.naturalHeight;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (aspect > 1) {
      sw = img.naturalHeight;
      sx = (img.naturalWidth - sw) / 2;
    } else if (aspect < 1) {
      sh = img.naturalWidth;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

    return canvas.toDataURL('image/jpeg', 0.75);
  } catch (_) {
    return null;
  }
}

class PreviewLoadManager {
  constructor() {
    this.activeCount = 0;
    this.jobs = new Map();
    this.jobIdsByElement = new WeakMap();
    this.queue = [];
    this.queueHead = 0;
    this.readyPreviews = new Map(); // Key -> downscaled DataURL (or true)
    this.nextId = 1;
    this.observer = null;
  }

  createPreviewKey(item) {
    return `${item.path}:${item.size}:${item.dateAdded}`;
  }

  isReady(key) {
    if (!this.readyPreviews.has(key)) {
      return false;
    }

    this.touchReadyPreview(key);

    return true;
  }

  getThumbnail(key) {
    if (!this.readyPreviews.has(key)) {
      return null;
    }

    const val = this.readyPreviews.get(key);

    this.touchReadyPreview(key);

    return typeof val === 'string' ? val : null;
  }

  setThumbnail(key, dataUrl) {
    if (!key) {
      return;
    }

    this.readyPreviews.set(key, dataUrl || true);

    if (this.readyPreviews.size > MAX_READY_PREVIEWS) {
      const oldestKey = this.readyPreviews.keys().next().value;

      this.readyPreviews.delete(oldestKey);
    }
  }

  observe({ element, key, onStart }) {
    if (!element || typeof onStart !== 'function') {
      return () => {};
    }

    const id = this.nextId;

    this.nextId += 1;

    const job = {
      id,
      element,
      key,
      onStart,
      status: 'observing',
      complete: null,
    };

    this.jobs.set(id, job);
    this.jobIdsByElement.set(element, id);

    if (this.isReady(key)) {
      this.enqueue(job);
    } else {
      const observer = this.getObserver();

      if (observer) {
        observer.observe(element);
      } else {
        this.enqueue(job);
      }
    }

    return () => this.cancel(id);
  }

  getObserver() {
    if (this.observer || !window.IntersectionObserver) {
      return this.observer;
    }

    // Pre-observe 800px ahead in both vertical directions (8-10 rows ahead)
    this.observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const jobId = this.jobIdsByElement.get(entry.target);
          const job = this.jobs.get(jobId);

          if (!job) {
            this.observer.unobserve(entry.target);

            return;
          }

          this.observer.unobserve(entry.target);
          this.enqueue(job);
        });
      },
      { rootMargin: '800px 0px' }
    );

    return this.observer;
  }

  enqueue(job) {
    const queuedJob = this.jobs.get(job.id);

    if (!queuedJob || queuedJob.status !== 'observing') {
      return;
    }

    queuedJob.status = 'queued';
    this.queue.push(queuedJob.id);
    this.drain();
  }

  drain() {
    while (
      this.activeCount < MAX_CONCURRENT_PREVIEWS &&
      this.queueHead < this.queue.length
    ) {
      const id = this.queue[this.queueHead];

      this.queueHead += 1;

      const job = this.jobs.get(id);

      if (job && job.status === 'queued') {
        job.status = 'active';
        this.activeCount += 1;

        let completed = false;
        const timeout = window.setTimeout(() => {
          job.complete(false);
        }, PREVIEW_TIMEOUT_MS);

        job.complete = (cacheResult = true) => {
          if (completed) {
            return;
          }

          completed = true;
          window.clearTimeout(timeout);

          if (job.status === 'active') {
            this.activeCount = Math.max(0, this.activeCount - 1);
          }

          this.jobs.delete(job.id);
          this.jobIdsByElement.delete(job.element);

          if (cacheResult) {
            this.touchReadyPreview(job.key);
          }

          this.compactQueue();
          this.drain();
        };

        try {
          job.onStart(job.complete);
        } catch (_) {
          job.complete(false);
        }
      }
    }

    this.compactQueue();
  }

  cancel(id) {
    const job = this.jobs.get(id);

    if (!job) {
      return;
    }

    if (this.observer && job.element) {
      this.observer.unobserve(job.element);
    }

    if (job.status === 'active' && job.complete) {
      job.complete(false);

      return;
    }

    this.jobs.delete(id);
    this.jobIdsByElement.delete(job.element);
    this.compactQueue();
  }

  touchReadyPreview(key) {
    if (this.readyPreviews.has(key)) {
      const val = this.readyPreviews.get(key);

      this.readyPreviews.delete(key);
      this.readyPreviews.set(key, val);

      return;
    }

    this.readyPreviews.set(key, true);

    if (this.readyPreviews.size > MAX_READY_PREVIEWS) {
      const oldestKey = this.readyPreviews.keys().next().value;

      this.readyPreviews.delete(oldestKey);
    }
  }

  compactQueue() {
    if (
      this.queueHead < 256 ||
      this.queueHead < Math.floor(this.queue.length / 2)
    ) {
      return;
    }

    this.queue = this.queue.slice(this.queueHead);
    this.queueHead = 0;
  }
}

export const previewLoadManager = new PreviewLoadManager();
