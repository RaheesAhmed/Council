# Build a Production-Quality Chrome Extension: Council

Build a polished Chrome extension called **Council** that lets users use multiple AI websites they are already logged into—ChatGPT, Claude, Gemini, Grok, and Kimi—as a collaborative multi-agent system.

The user should enter one problem inside the extension. Council should send the problem to selected AI providers, collect their responses, let the models critique and improve each other’s work, and then produce one final synthesized answer.

The extension must work through the user’s existing browser sessions. It must not require Council accounts, API keys, subscriptions, or a backend server.

## Core product idea

Council acts as the communication layer between multiple AI websites.

The AI models do not directly communicate with each other. The extension coordinates their conversations through browser tabs and content scripts.

The workflow should be:

1. User enters a problem.
2. Council detects which providers are open and logged in.
3. Council sends the problem independently to selected providers.
4. Each provider generates its own solution.
5. Council collects the visible responses.
6. Council sends anonymized proposals to the providers for peer review.
7. Each provider critiques weaknesses, missing details, assumptions, and risks.
8. Council sends relevant criticism back to the original provider.
9. Providers produce improved answers.
10. A selected provider acts as the final synthesizer.
11. Council displays one polished final answer alongside the full debate history.

## Important security rules

Council must never:

* read or export cookies;
* capture passwords;
* extract authentication tokens;
* intercept private API headers;
* access local storage belonging to providers unless explicitly necessary for normal DOM interaction;
* call undocumented private provider APIs;
* imitate login requests;
* transmit user conversations to our own server;
* inject remotely hosted JavaScript;
* bypass CAPTCHAs or provider security controls.

Council should only interact with the visible provider webpages through content scripts and normal DOM events.

All user data, prompts, responses, settings, and run history must remain local inside the browser.

No backend should be required.

## Technology stack

Use:

* Chrome Extension Manifest V3
* TypeScript
* React
* Vite
* Tailwind CSS
* Zustand for local UI state
* Zod for runtime validation
* IndexedDB through Dexie for persistent history
* chrome.storage.session for active run state
* chrome.storage.local for settings
* MutationObserver for response streaming
* Chrome Side Panel API
* Chrome Tabs API
* Chrome Tab Groups API
* Chrome Runtime Messaging API

Do not use Next.js.

Keep the code modular, strongly typed, testable, and production-ready.

## Extension interfaces

Create two main interfaces.

### 1. Side panel

The side panel should provide fast access while the user is browsing.

It should include:

* compact prompt input;
* selected providers;
* connection status;
* selected council mode;
* start button;
* current run progress;
* button to open the full workspace.

### 2. Full workspace

The full workspace should be the primary Council interface.

It should include:

* provider connection status;
* large task composer;
* provider selection;
* council mode selection;
* progress timeline;
* live provider responses;
* peer reviews;
* revised answers;
* final synthesized response;
* run history;
* export controls;
* settings.

Do not embed provider websites inside iframes.

Provider websites should remain open in normal Chrome tabs. The extension should communicate with those tabs through content scripts.

## Design direction

The interface must feel like a premium Google product designed for serious professional work.

Use an extremely clean monochrome design.

### Visual system

Use:

* white background;
* near-black primary text;
* medium gray secondary text;
* very light gray borders;
* subtle gray surfaces;
* minimal shadows;
* generous spacing;
* strong typography hierarchy;
* rounded corners used carefully;
* no gradients;
* no glassmorphism;
* no neon;
* no purple AI styling;
* no decorative illustrations;
* no excessive icons;
* no bright colors;
* no cluttered dashboards.

The interface should look calm, intelligent, precise, and expensive.

Use color only when absolutely necessary for errors or warnings. Even provider status should primarily use grayscale labels and icons.

### Typography

Use a clean modern sans-serif stack such as:

```css
font-family:
  Inter,
  ui-sans-serif,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Typography should feel similar to Google Workspace, Linear, Notion, and high-end developer tools, but the final design must remain original.

### Layout principles

* generous whitespace;
* maximum readable content width;
* clear alignment;
* no unnecessary containers;
* avoid placing every item inside a card;
* use thin dividers instead of excessive shadows;
* support responsive desktop layouts;
* side panel must remain usable at narrow widths;
* workspace should support large monitors;
* use smooth but restrained transitions;
* every interaction must feel intentional.

### Main workspace structure

Use a layout similar to:

```text
┌──────────────────────────────────────────────────────────────┐
│ Council                                      History Settings │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ What should the council solve?                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Describe a problem, decision, architecture, or task...   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Providers                                                    │
│ ChatGPT   Claude   Gemini   Grok   Kimi                       │
│                                                              │
│ Mode: Quick Council / Deep Debate / Adversarial / Code       │
│                                              Start Council   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Progress                                                     │
│ Independent answers → Review → Revision → Synthesis          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Final answer                                                 │
│                                                              │
│ Provider responses and debate details                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The UI should not resemble a generic admin dashboard.

## Provider support

Support:

* ChatGPT
* Claude
* Gemini
* Grok
* Kimi

Each provider must be implemented through a dedicated adapter.

Create a common provider interface:

```ts
export type ProviderId =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "grok"
  | "kimi";

export type ProviderStatus =
  | "not_open"
  | "loading"
  | "logged_out"
  | "ready"
  | "generating"
  | "rate_limited"
  | "verification_required"
  | "error";

export interface ProviderAdapter {
  id: ProviderId;

  detectStatus(): Promise<ProviderStatus>;

  createNewConversation(): Promise<void>;

  fillPrompt(prompt: string): Promise<void>;

  submitPrompt(): Promise<void>;

  getLatestAssistantResponse(): Promise<string>;

  isGenerating(): Promise<boolean>;

  stopGeneration(): Promise<void>;

  observeResponse(callbacks: {
    onStart(): void;
    onUpdate(text: string): void;
    onComplete(text: string): void;
    onError(error: Error): void;
  }): () => void;
}
```

Each provider adapter should be isolated from the rest of the application.

Provider-specific DOM selectors, waiting logic, response extraction, login detection, and completion detection must remain inside that provider’s adapter.

## Robust DOM interaction

Do not depend on generated CSS class names.

Prefer selectors based on:

* `role`;
* `aria-label`;
* `data-*` attributes;
* `contenteditable`;
* textarea elements;
* semantic button labels;
* message author attributes;
* relative element position;
* visible state.

Create selector registries with multiple fallback selectors.

Example:

```ts
interface SelectorSet {
  composer: string[];
  sendButton: string[];
  stopButton: string[];
  assistantMessages: string[];
  newChatButton: string[];
  loginIndicator: string[];
}
```

Create reusable DOM helpers:

```ts
findFirstVisible(selectors: string[]): HTMLElement | null;
waitForElement(selectors: string[], timeout: number): Promise<HTMLElement>;
setNativeInputValue(element: HTMLElement, value: string): void;
dispatchInputEvents(element: HTMLElement): void;
isElementVisible(element: Element): boolean;
waitUntilGenerationComplete(): Promise<void>;
```

Support both textarea-based and contenteditable-based composers.

When filling a prompt, dispatch realistic input, change, keyboard, and composition-compatible events so React-based provider interfaces detect the value correctly.

Do not use brittle fixed delays when an observable DOM condition is available.

## Tab management

Create one browser tab for each enabled provider.

Place provider tabs inside a Chrome tab group named:

```text
Council Providers
```

The extension should:

* detect an existing provider tab;
* reuse it when possible;
* open the provider website when missing;
* detect whether the user is logged in;
* show a clear “Sign in on provider website” state;
* never request provider credentials;
* reactivate discarded tabs before using them;
* reload a broken provider tab when necessary;
* prevent duplicate provider tabs;
* keep provider tabs grouped;
* optionally pin provider tabs through a user setting.

Provider tabs may stay in the background while Council is running.

## Messaging architecture

Use typed runtime messages between:

* extension workspace;
* side panel;
* service worker;
* provider content scripts.

Create a discriminated union for all messages.

Example:

```ts
export type ExtensionMessage =
  | {
      type: "PROVIDER_CHECK_STATUS";
      providerId: ProviderId;
    }
  | {
      type: "PROVIDER_RUN_PROMPT";
      runId: string;
      providerId: ProviderId;
      prompt: string;
    }
  | {
      type: "PROVIDER_RESPONSE_UPDATE";
      runId: string;
      providerId: ProviderId;
      text: string;
    }
  | {
      type: "PROVIDER_RESPONSE_COMPLETE";
      runId: string;
      providerId: ProviderId;
      text: string;
    }
  | {
      type: "PROVIDER_ERROR";
      runId: string;
      providerId: ProviderId;
      error: string;
    }
  | {
      type: "RUN_PAUSE";
      runId: string;
    }
  | {
      type: "RUN_RESUME";
      runId: string;
    }
  | {
      type: "RUN_STOP";
      runId: string;
    };
```

Validate incoming messages using Zod.

## Council orchestration engine

Build a proper orchestration engine rather than placing workflow logic inside React components.

Create:

```ts
interface CouncilEngine {
  startRun(config: CouncilRunConfig): Promise<CouncilRun>;
  pauseRun(runId: string): Promise<void>;
  resumeRun(runId: string): Promise<void>;
  stopRun(runId: string): Promise<void>;
  retryProvider(runId: string, providerId: ProviderId): Promise<void>;
}
```

A run should contain:

```ts
interface CouncilRun {
  id: string;
  task: string;
  mode: CouncilMode;
  status: CouncilRunStatus;
  selectedProviders: ProviderId[];
  stages: CouncilStage[];
  responses: ProviderResponse[];
  reviews: ProviderReview[];
  revisions: ProviderRevision[];
  finalAnswer?: FinalAnswer;
  createdAt: number;
  updatedAt: number;
}
```

## Council modes

Implement four modes.

### Quick Council

Workflow:

1. Independent answers.
2. Final synthesis.

Best for simple questions.

### Deep Debate

Workflow:

1. Independent answers.
2. Anonymous peer reviews.
3. Provider revisions.
4. Final synthesis.

This should be the default mode.

### Adversarial Review

Workflow:

1. One or more providers propose solutions.
2. Other providers aggressively search for flaws.
3. A verifier evaluates disputed claims.
4. Final synthesizer produces the corrected answer.

Best for high-risk decisions, architecture, security, and strategy.

### Code Council

Workflow:

1. Architecture proposal.
2. Implementation proposal.
3. Security review.
4. Edge-case review.
5. Testing strategy.
6. Final engineering plan or code answer.

The extension is not executing code in this version. It is coordinating AI reasoning about code.

## Independent answer stage

Send the task to each selected provider without including responses from other providers.

Use a structured prompt similar to:

```text
You are participating in an independent expert council.

Solve the user’s task without seeing or assuming what other experts may say.

Task:
{{task}}

Requirements:
- reason carefully;
- identify assumptions;
- provide a practical answer;
- mention uncertainty;
- do not refer to yourself as part of a multi-model system;
- do not wait for other agents;
- return a complete standalone proposal.
```

Run provider requests concurrently where safe.

Track:

* start time;
* first visible response time;
* completion time;
* response length;
* provider status;
* retries;
* errors.

## Anonymous peer review stage

Anonymize provider identities.

Never tell one model that a proposal came from ChatGPT, Claude, Gemini, Grok, or Kimi.

Use labels such as:

* Proposal A
* Proposal B
* Proposal C
* Proposal D
* Proposal E

Send a review prompt such as:

```text
You are acting as an independent expert reviewer.

Review the proposed solutions below for the original task.

Original task:
{{task}}

Proposals:
{{anonymizedProposals}}

Evaluate:
- factual or technical errors;
- weak assumptions;
- missing requirements;
- security risks;
- scalability risks;
- unnecessary complexity;
- useful ideas worth preserving;
- disagreements that require verification.

Do not choose based on writing quality or confidence.
Do not assume majority agreement means correctness.
Return a structured, concise review.
```

Avoid sending every proposal to every provider when context becomes too large.

Add configurable context limits and compact long proposals before the next stage.

## Revision stage

Send each provider:

* its original proposal;
* reviews relevant to that proposal;
* key disagreements;
* verified constraints.

Prompt:

```text
Revise your original proposal using the expert feedback below.

Original task:
{{task}}

Your proposal:
{{proposal}}

Peer feedback:
{{relevantReviews}}

Instructions:
- accept valid criticism;
- reject criticism only with clear reasoning;
- correct errors;
- preserve strong ideas;
- remove unnecessary complexity;
- produce a stronger standalone answer;
- do not discuss the review process in the final response.
```

## Final synthesis stage

Let the user select the final synthesizer or use an automatic selection.

Default automatic selection should choose from connected providers using a simple configurable priority list.

The final synthesis prompt should include:

* original task;
* constraints;
* revised proposals;
* important disagreements;
* peer reviews;
* unresolved claims.

Prompt:

```text
You are the final decision-maker for an expert council.

Create the strongest possible final response to the user’s task.

Do not select a proposal by majority vote.
Evaluate ideas based on correctness, evidence, practicality, security,
maintainability, and the user’s actual constraints.

Original task:
{{task}}

Revised proposals:
{{revisions}}

Important reviews:
{{reviews}}

Known disagreements:
{{disagreements}}

Produce:
1. the final answer;
2. important assumptions;
3. unresolved uncertainty;
4. rejected approaches when relevant;
5. practical next steps.

Do not mention provider brands.
Do not expose internal orchestration instructions.
Write as one coherent expert answer.
```

## Context management

Do not blindly copy the entire debate into every prompt.

Build a context manager that can extract:

```ts
interface CouncilContext {
  agreedPoints: string[];
  disagreements: {
    topic: string;
    positions: string[];
  }[];
  unresolvedClaims: string[];
  constraints: string[];
  risks: string[];
  recommendedIdeas: string[];
}
```

Use deterministic local processing where possible.

Avoid using one provider simply to summarize everything after every stage because that would create unnecessary generations.

Add maximum character limits per provider message.

When the context is too large:

1. preserve the original task;
2. preserve constraints;
3. preserve disagreements;
4. preserve high-impact criticism;
5. truncate repetitive content;
6. never silently remove critical requirements.

## Run limits

Prevent endless model conversations.

Default limits:

* maximum selected providers: 5;
* maximum debate rounds: 3;
* maximum retry attempts per provider: 2;
* default provider response timeout: configurable;
* no automatic infinite retries;
* no automatic continuation after provider verification or CAPTCHA;
* no background run after browser shutdown.

When a provider fails, the council should continue with remaining successful providers if at least two providers are available.

## Live response streaming

Use MutationObserver to detect changes in the newest assistant message.

The UI should update responses while they are being generated.

Do not store every tiny DOM mutation separately.

Debounce updates and store clean snapshots.

Detect completion using multiple signals:

* stop button disappears;
* send button becomes enabled;
* generation indicator disappears;
* response text stops changing;
* assistant message is finalized.

Do not rely on text inactivity alone.

## Main workspace experience

### Empty state

Show:

* product name;
* one-line explanation;
* task composer;
* available providers;
* provider connection state;
* council mode;
* start button.

Avoid marketing copy inside the working interface.

### Active run

Show a horizontal progress system:

```text
Understanding task
Independent answers
Peer review
Revision
Final synthesis
```

Each stage should show:

* pending;
* active;
* completed;
* failed;
* skipped.

Below the progress area, show provider activity in a clean responsive grid.

Each provider panel should display:

* provider name;
* status;
* current stage;
* elapsed time;
* streaming response;
* retry action;
* stop action;
* expand action.

Do not use bright provider brand colors.

### Final answer

When completed, make the final answer the primary focus.

Show:

* clean readable answer;
* copy button;
* Markdown export;
* save;
* regenerate synthesis;
* continue discussion;
* view source proposals;
* view debate;
* view revisions.

Use a narrow readable text column for long answers.

## Continue discussion

After a run completes, allow the user to enter a follow-up question.

Support:

* send follow-up to final synthesizer only;
* send follow-up to all selected providers;
* reopen debate;
* challenge the final answer;
* request implementation details.

Preserve relevant run context without sending unnecessary full history.

## Connection manager

Create a connection page or modal showing:

```text
ChatGPT   Ready
Claude    Ready
Gemini    Sign in required
Grok      Tab not open
Kimi      Loading
```

Actions:

* Open provider;
* Check again;
* Reload provider;
* Focus provider tab;
* Disconnect from Council;
* View connection help.

“Disconnect” should only stop Council from using the tab. It should not log the user out of the provider.

## History

Store completed runs locally using IndexedDB.

History should support:

* search;
* filter by council mode;
* filter by provider;
* rename run;
* delete run;
* duplicate task;
* continue run;
* export as Markdown;
* export as JSON.

Do not add cloud sync.

## Settings

Add settings for:

* default providers;
* default council mode;
* default final synthesizer;
* maximum debate rounds;
* provider timeout;
* automatically open missing provider tabs;
* reuse current conversation or create new conversation;
* pin provider tabs;
* save run history;
* response update frequency;
* reduced motion;
* compact provider panels.

Keep settings simple and organized.

## Accessibility

The extension must be keyboard accessible.

Implement:

* proper focus states;
* semantic HTML;
* ARIA labels;
* accessible dialogs;
* keyboard navigation;
* escape-to-close behavior;
* visible focus rings;
* minimum readable contrast;
* reduced motion support;
* screen-reader status announcements for run progress.

Do not sacrifice accessibility for visual minimalism.

## Error handling

Create clear user-facing errors for:

* provider tab missing;
* user logged out;
* composer not found;
* send button not found;
* provider page changed;
* provider rate limited;
* CAPTCHA or verification required;
* response timed out;
* content script unavailable;
* tab discarded;
* provider refused message;
* extension permission missing;
* run interrupted.

Errors should explain what happened and provide one practical recovery action.

Do not expose raw stack traces in the UI.

Keep technical logs in a local debug panel.

## Debug mode

Add an optional developer/debug mode.

It should show:

* provider status;
* matched selector;
* tab ID;
* current URL;
* stage;
* last message timestamp;
* observer state;
* retries;
* sanitized errors.

Never show cookies, tokens, credentials, or private request headers.

## Suggested project structure

```text
council/
├── src/
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── tab-manager.ts
│   │   ├── message-router.ts
│   │   └── run-recovery.ts
│   ├── content/
│   │   ├── bootstrap.ts
│   │   ├── shared/
│   │   │   ├── dom.ts
│   │   │   ├── observer.ts
│   │   │   ├── input.ts
│   │   │   └── errors.ts
│   │   └── providers/
│   │       ├── chatgpt/
│   │       │   ├── adapter.ts
│   │       │   └── selectors.ts
│   │       ├── claude/
│   │       │   ├── adapter.ts
│   │       │   └── selectors.ts
│   │       ├── gemini/
│   │       │   ├── adapter.ts
│   │       │   └── selectors.ts
│   │       ├── grok/
│   │       │   ├── adapter.ts
│   │       │   └── selectors.ts
│   │       └── kimi/
│   │           ├── adapter.ts
│   │           └── selectors.ts
│   ├── council/
│   │   ├── engine.ts
│   │   ├── stages.ts
│   │   ├── prompts.ts
│   │   ├── context-manager.ts
│   │   ├── provider-runner.ts
│   │   └── synthesizer.ts
│   ├── sidepanel/
│   │   ├── main.tsx
│   │   └── SidePanelApp.tsx
│   ├── workspace/
│   │   ├── main.tsx
│   │   ├── WorkspaceApp.tsx
│   │   ├── pages/
│   │   └── components/
│   ├── components/
│   │   ├── ui/
│   │   ├── provider/
│   │   ├── council/
│   │   └── layout/
│   ├── stores/
│   │   ├── useRunStore.ts
│   │   ├── useProviderStore.ts
│   │   └── useSettingsStore.ts
│   ├── storage/
│   │   ├── database.ts
│   │   ├── runs.ts
│   │   └── settings.ts
│   ├── shared/
│   │   ├── messages.ts
│   │   ├── schemas.ts
│   │   ├── types.ts
│   │   └── constants.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── icons/
│   └── manifest.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Manifest requirements

Create a minimal Manifest V3 configuration.

Required permissions should be limited to:

```json
[
  "tabs",
  "storage",
  "scripting",
  "sidePanel",
  "tabGroups"
]
```

Add host permissions only for supported provider domains.

Do not request:

* cookies;
* webRequest;
* webRequestBlocking;
* history;
* downloads unless export requires it;
* broad `<all_urls>` access.

Use explicit provider domains.

## Testing

Add unit tests for:

* council stage transitions;
* context size handling;
* prompt construction;
* provider failure recovery;
* typed message validation;
* selector fallback behavior;
* run cancellation;
* run persistence;
* synthesis input generation.

Add integration-style tests using saved HTML fixtures for provider pages where possible.

Create adapter test utilities so selectors can be checked against fixture DOM without launching the full extension.

## Development strategy

Build in phases, but keep the final architecture ready for all providers.

### Phase 1

Implement:

* extension shell;
* premium workspace UI;
* side panel;
* service worker;
* typed messaging;
* provider connection manager;
* ChatGPT adapter;
* Claude adapter;
* independent answer stage;
* final synthesis stage;
* local persistence.

### Phase 2

Implement:

* Gemini adapter;
* peer reviews;
* revisions;
* Deep Debate mode;
* pause, stop, retry;
* improved run recovery.

### Phase 3

Implement:

* Grok adapter;
* Kimi adapter;
* Adversarial mode;
* Code Council mode;
* history;
* export;
* settings;
* debug tools.

Even though development is phased, generate the complete project structure from the beginning.

## Quality rules

* no placeholder UI;
* no generic dashboard templates;
* no fake data in production;
* no giant React components;
* no business logic inside presentation components;
* no `any` types unless unavoidable and documented;
* no duplicated provider workflow logic;
* no silent failures;
* no excessive animation;
* no unnecessary dependencies;
* no backend;
* no authentication system;
* no analytics;
* no telemetry;
* no remote script loading;
* no private provider API usage.

Use reusable components, clear naming, strict TypeScript, and proper error boundaries.

## Acceptance criteria

The build is complete when:

1. The extension loads successfully as an unpacked Chrome extension.
2. The side panel opens from the extension action.
3. The full workspace opens correctly.
4. Council detects supported provider tabs.
5. Council identifies ready, logged-out, missing, and failed states.
6. A user can select multiple providers.
7. The same task can be sent to selected providers.
8. Responses appear live in the Council workspace.
9. A failed provider does not crash the whole run.
10. Deep Debate performs independent answers, review, revision, and synthesis.
11. The user can pause or stop a run.
12. Completed runs are saved locally.
13. The user can copy and export the final answer.
14. The interface is responsive and keyboard accessible.
15. The UI uses a refined white, black, and gray visual system.
16. No provider credentials, cookies, or authentication tokens are accessed.
17. No backend server is required.
18. Provider adapters remain independently maintainable.
19. Errors provide practical recovery actions.
20. The codebase passes TypeScript checks, linting, and tests.

## Final delivery requirements

Produce:

* the full extension codebase;
* a working Manifest V3 build;
* clear local installation instructions;
* development commands;
* production build command;
* architecture documentation;
* provider adapter documentation;
* instructions for updating selectors when provider websites change;
* privacy documentation;
* known limitations;
* a testing guide.

Start by creating the architecture and design system, then implement the extension shell and provider adapter system.

Do not generate only an explanation or prototype. Build the actual working application.

Make sensible engineering decisions without repeatedly asking for approval. When a provider DOM selector cannot be reliably known, create a robust selector registry, debugging utility, and clearly isolated adapter implementation rather than hardcoding fragile guesses throughout the codebase.
