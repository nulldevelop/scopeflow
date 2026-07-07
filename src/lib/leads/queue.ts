export type QueueResult<T> = { ok: true; value: T } | { ok: false; error: string }

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs `task` for each item sequentially with a delay between calls, so a batch
 * of external API calls (Places, WHOIS, SSL checks...) doesn't blow past rate limits.
 * A failure on one item is captured as a result instead of aborting the rest of the batch.
 */
export async function processWithDelay<In, Out>(
  items: In[],
  delayMs: number,
  task: (item: In) => Promise<Out>,
): Promise<QueueResult<Out>[]> {
  const results: QueueResult<Out>[] = []

  for (let i = 0; i < items.length; i++) {
    try {
      const value = await task(items[i])
      results.push({ ok: true, value })
    } catch (error) {
      results.push({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    if (i < items.length - 1 && delayMs > 0) {
      await sleep(delayMs)
    }
  }

  return results
}
