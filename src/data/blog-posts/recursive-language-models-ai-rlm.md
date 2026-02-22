---
title: Recursive Language Models with ai-rlm
slug: rlm-ai-rlm-agent
publishDate: 22 Feb 2026
description: A practical introduction to recursive language models and how ai-rlm uses the AI SDK to build an Agent.
---

Recursive language models (RLMs) are a simple idea: let a model call itself (or another model step) to break harder tasks into smaller tasks, then combine the results.

Instead of one long prompt and one final answer, you get a structured loop:

1. Plan the next subproblem.
2. Solve it with a model/tool call.
3. Evaluate the result.
4. Recurse until the stopping condition is met.

This pattern helps with tasks that benefit from decomposition, verification, or iterative refinement.

## Why recursion helps

Many model failures happen when a task is too broad for one pass. Recursion gives the system more chances to reason in smaller contexts. In practice, this can improve reliability for multi-step work like code generation, synthesis across sources, and constrained decision making.

## ai-rlm in practice

I built [ai-rlm](https://github.com/jhsu/ai-rlm) to explore this pattern in a concrete, programmable way.

The project focuses on:

- A recursive control loop for task decomposition.
- Clear termination conditions to avoid runaway recursion.
- Intermediate state that can be inspected, logged, and debugged.
- Agent-oriented APIs for real application flows.

## Using the AI SDK for an Agent

ai-rlm uses the [AI SDK](https://ai-sdk.dev) as the foundation for model calls and Agent behavior.

The SDK makes it easier to wire up:

- Model invocation across providers.
- Tool calling for structured actions.
- Streaming and typed outputs.
- A clean interface for building agent loops.

At a high level, the Agent in ai-rlm does:

1. Receive a root task.
2. Decide whether to solve directly or split into children.
3. Execute each child with model/tool calls.
4. Merge child outputs into a parent result.
5. Return when confidence or depth limits are reached.

The key point is not recursion for its own sake. It is recursion with constraints, observability, and explicit stop rules.

Here is a minimal `RLMAgent` example:

```ts
import { RLMAgent } from 'ai-rlm'
import { openai } from '@ai-sdk/openai'

const agent = new RLMAgent({
  model: openai('gpt-4.1'),
  subModel: openai('gpt-4.1-mini'),
  maxIterations: 12,
  maxLLMCalls: 24,
})

const result = await agent.generate({
  context: `
    Ticket #1842: checkout failures increased 17% after deploy.
    Errors spike when promo codes and guest checkout are used together.
  `,
  query: 'What is the most likely root cause and first fix to ship?',
})

console.log(result.text)
console.log(result.iterations, result.llmCallCount)
```

And here is an example with streaming and execution trace output:

```ts
import { RLMAgent } from 'ai-rlm'
import { openai } from '@ai-sdk/openai'

const agent = new RLMAgent({
  model: openai('gpt-4.1'),
  subModel: openai('gpt-4.1-mini'),
  maxIterations: 20,
  maxLLMCalls: 40,
  verbose: false,
})

const stream = await agent.stream({
  context: largeCodebaseSummary,
  query: 'Find the highest-risk auth bug and propose a patch plan.',
})

for await (const delta of stream.textStream) {
  process.stdout.write(delta)
}

// Full recursive trajectory (reasoning/code/output per step)
console.log(stream.steps)
```

## What I am exploring next

- Better scoring functions for when to recurse.
- Caching repeated subproblems.
- More tool-aware planning strategies.
- Benchmarks comparing single-pass vs recursive runs.

If you are working on production agents, this approach is worth testing where tasks naturally branch and recombine.
