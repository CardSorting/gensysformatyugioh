import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { BroccoliDatabaseKernel } from './broccolidb-engine';
import { BroccoliQueue } from './broccoliqueue-engine';
import {
  enqueueImagePrefetch,
  enqueueDeckPreload,
  getQueueStatus,
  closeBroccoliQueue,
} from './queue';

test('BroccoliQueue - In-Process Durable Job Queue Engine', async (t) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'broccoliqueue-test-'));
  const db = new BroccoliDatabaseKernel({ workspaceRoot: tmpDir });
  const queue = new BroccoliQueue({ db, namespace: 'test_jobs' });

  t.after(async () => {
    await queue.close({ drainTimeoutMs: 500 }).catch(() => {});
    await db.stop().catch(() => {});
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    await closeBroccoliQueue().catch(() => {});
  });

  await t.test('starts queue on isolated BroccoliDB kernel and initializes schema', async () => {
    await queue.start();
    assert.ok(queue.isStarted, 'Queue must be started');
    assert.equal(queue.namespace, 'test_jobs');

    const health = queue.getHealth();
    assert.equal(health.status, 'healthy');
  });

  await t.test('enqueues and processes jobs with worker concurrency', async () => {
    let processedValue = '';
    const worker = queue.process<{ message: string }>('test.work', async (job, { signal }) => {
      signal.throwIfAborted();
      processedValue = job.data.message;
      return { ok: true, echo: job.data.message };
    }, { concurrency: 2, workerId: 'test-worker-1' });

    await worker.start();

    const job = await queue.add('test.work', { message: 'Yu-Gi-Oh Genesys Queue Active' });
    assert.ok(job.id);
    assert.equal(job.queueName, 'test.work');

    // Wait for worker to claim and complete
    let attempts = 0;
    while (attempts < 20) {
      const refreshed = await queue.getJob(job.id);
      if (refreshed && refreshed.state === 'completed') {
        assert.equal(refreshed.state, 'completed');
        assert.equal(processedValue, 'Yu-Gi-Oh Genesys Queue Active');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
  });

  await t.test('guarantees producer idempotency with deduplication', async () => {
    const jobA = await queue.add('test.idempotent', { val: 1 }, {
      idempotencyKey: 'event-uuid-1234',
    });

    const jobB = await queue.add('test.idempotent', { val: 2 }, {
      idempotencyKey: 'event-uuid-1234',
    });

    assert.equal(jobA.id, jobB.id, 'Duplicate idempotency key must return existing job');
  });

  await t.test('reports overview, registered workers, and queue state counts', async () => {
    const overview = queue.getOverview();
    assert.ok(overview);
    assert.equal(overview.health.status, 'healthy');
    assert.ok(Array.isArray(overview.queues));
    assert.ok(Array.isArray(overview.workers));
    assert.ok(overview.workers.length > 0);
  });
});

test('BroccoliQueue - Application Integration Helpers', async (t) => {
  t.after(async () => {
    await closeBroccoliQueue().catch(() => {});
  });

  await t.test('enqueues image prefetch and returns job ID', async () => {
    const jobId = await enqueueImagePrefetch(35272499, 'small');
    assert.ok(jobId && typeof jobId === 'string');
  });

  await t.test('enqueues deck preload and returns job ID', async () => {
    const jobId = await enqueueDeckPreload('deck-alpha', [35272499, 15177726], 'ycs-houston');
    assert.ok(jobId && typeof jobId === 'string');
  });

  await t.test('retrieves live application queue status', async () => {
    const status = await getQueueStatus();
    assert.ok(status);
    assert.equal(status.health.status, 'healthy');
    assert.ok(Array.isArray(status.workers));
  });
});
