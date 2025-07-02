**Open‑source MVP:** a tiny Fastify proxy + TypeScript SDK that lets any front‑end‑only app call OpenAI safely. We hide your provider key on the server, issue short‑lived JWTs, throttle by IP & Origin, and ship a one‑line `<ChatWidget />` (or `useChat`/`chat`) for instant ChatGPT‑style UIs. Deploy on Railway with just `OPENAI_API_KEY` and (optionally) `JWT_SECRET`; everything else has sensible defaults and room to grow.

## Minimal MVP Plan for LLM Backend & Client SDK

### Backend Authentication

- **OpenAI API key**
- Managed via simple **environment variables/config files**

### JWT Token Management (Backend)

- Library: **jsonwebtoken** – small, battle‑tested, TypeScript types available.
- Installation:
  ```bash
  pnpm add jsonwebtoken
  pnpm add -D @types/jsonwebtoken
  ```
- Handling the signing secret (`JWT_SECRET`):
  - **Prod recommended** – set `JWT_SECRET` explicitly in env vars so multiple instances share the same key and tokens survive restarts.
  - **Dev convenience** – if `JWT_SECRET` is _unset_, the server auto‑generates a 32‑byte random string at boot and logs a warning.\
    _Pros_: zero config for quick local runs.\
    _Cons_: tokens become invalid every restart and clustering won’t work.
- Example usage:
  ```typescript
  import jwt from 'jsonwebtoken';
  // Generate 15‑minute token
  const token = jwt.sign({ userId: 'user123' }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  ```
- **Why short‑lived JWTs?**
  - **Security** – limits the blast radius if a token is intercepted.
  - **Stateless simplicity** – server only needs the signing secret; no session DB.
  - **Easy rotation** – change `JWT_SECRET`, old tokens fail after TTL.
  - **Future‑proof** – scopes/quotas can be embedded later.

### Rate Limiting & Abuse Prevention & Abuse Prevention

- **Fastify IP‑based rate limiter**
- **Origin filter on sensitive routes** (`/api/token`, `/api/chat`)

#### Why add an Origin filter?

| Benefit                                     | Explanation                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Stops token‑mint loops from other sites** | Only requests whose `Origin` header matches your webapp domain (e.g. `https://yourapp.com`) can obtain JWTs. A script hosted elsewhere can’t silently farm tokens. |
| **Pairs well with IP limits**               | Even if an attacker spoofs the header, they still face the same per‑IP throttle; origin check just adds another cheap hurdle.                                      |
| **Zero client changes**                     | Browser automatically includes the correct `Origin`; SDK callers don’t need to pass anything special.                                                              |

#### Minimal Fastify setup

```ts
import fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';

const app = fastify();

// 1️⃣ IP limiter (example: 60 req/min per IP)
app.register(rateLimit, {
  max: 60,
  timeWindow: '1 minute',
});

// 2️⃣ CORS / Origin filter – allow only ENV_ORIGIN
app.register(cors, {
  origin: process.env.ALLOWED_ORIGIN, // e.g. "https://yourapp.com"
});

// Inside your token route, you can double‑check Origin header if desired:
app.get('/api/token', async (req, res) => {
  if (req.headers.origin !== process.env.ALLOWED_ORIGIN) {
    return res.code(403).send({ error: 'Forbidden' });
  }
  /* issue JWT */
});
```

> For local dev, set `ALLOWED_ORIGIN=http://localhost:5173` (or similar) and your browser environment will work out‑of‑the‑box.

### Environment Variables (Server‑side)

| Variable            | Required | Default (MVP)                       | Purpose                                                                                      |
| ------------------- | -------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`    | ✅       | —                                   | Secret key for OpenAI.                                                                       |
| `JWT_SECRET`        | ⬜       | _auto‑generate at startup if unset_ | Signs/validates JWTs. **Set explicitly in prod for stable tokens & multi‑instance deploys.** |
| `ALLOWED_ORIGIN`    | ✅       | `http://localhost:5173`             | Front‑end domain allowed to hit token/chat routes.                                           |
| `SYSTEM_PROMPT`     | ⬜       | _(empty string)_                    | Global system prompt injected server‑side when client omits one.                             |
| `RATE_LIMIT_MAX`    | ⬜       | `60`                                | Requests per IP in `RATE_LIMIT_WINDOW`.                                                      |
| `RATE_LIMIT_WINDOW` | ⬜       | `1 minute`                          | Time window for IP rate limit.                                                               |

> **Sane defaults** let a dev run `pnpm dev` locally with only two secrets:
>
> ```bash
> export OPENAI_API_KEY="sk‑..."
> export JWT_SECRET="$(openssl rand -hex 32)"
> ```
>
> Everything else works out‑of‑the‑box.

### Logging

- **Basic logging**: request timestamp, IP address, token usage

### Cost Control

- **Manual monitoring**; automation to be added later

### Deployment Platform

- Recommended: **Railway.app**

  **Why Railway first?**
  | Factor | Railway Advantage |
  | ----------------------------- | ------------------------------------------------------------------------------- |
  | **Zero‑config** | Detects Node.js, runs `pnpm install` automatically; no Dockerfile needed. |
  | **Monorepo friendly** | Lets you set custom root, build, and start commands—ideal for NX + PNPM. |
  | **Environment variables UI** | Simple toggle UI for secrets (`OPENAI_API_KEY`, `JWT_SECRET`, `SYSTEM_PROMPT`). |
  | **Free tier & fast builds** | Enough resources for demos, spins up in seconds. |
  | **"Deploy to Railway" badge** | Open‑source users click once to fork + deploy their own copy. |
  | **Easy logs & metrics** | Built‑in log viewer; no extra setup for basic monitoring. |
  | **Minimal setup commands** | |

  ```bash
  pnpm install && pnpm nx run your-backend-project:build   # Build
  pnpm nx run your-backend-project:serve                   # Start
  ```

  > You can migrate to Vercel/K8s later—the code stays the same; only the deploy script changes.

### Client SDK Integration

#### Plain JavaScript (no React) usage

```html
<!DOCTYPE html>
<html>
  <body>
    <input id="prompt" placeholder="Say something" />
    <button id="send">Send</button>
    <pre id="log"></pre>

    <script type="module">
      // ESM import – works with modern bundlers or native browser modules
      import { chat } from 'https://cdn.skypack.dev/@yourorg/sdk';

      const log = document.getElementById('log');
      document.getElementById('send').onclick = async () => {
        const text = document.getElementById('prompt').value;
        const reply = await chat([{ role: 'user', content: text }]);
        log.textContent += `You: ${text}
AI: ${reply}

`;
      };
    </script>
  </body>
</html>
```

_No React, no state libraries—just call **`chat()`** and append strings._ You can of course bundle with Vite/Webpack instead of using a CDN.

---

#### Proposed Simplified SDK Interface (MVP)

```typescript
export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatOptions {
  /** Optional system prompt; fallback to server `SYSTEM_PROMPT` if omitted */
  system?: string;
}

/**
 * Minimal chat call – returns assistant content only.
 */
export async function chat(
  messages: Message[],
  options?: ChatOptions
): Promise<string>;
```

**Why this shape?**

- **Zero‑config by default** – developers can ignore the `options` argument entirely.
- **System‑prompt ready** – power users pass `system` when needed.
- **Backward‑compatible** – one‑argument form still valid.
- **Future‑proof** – we can extend `ChatOptions` without breaking changes.

Developers just:

```typescript
import { chat } from '@yourorg/sdk';

// simplest call
const reply = await chat([{ role: 'user', content: 'Hello' }]);

// with custom system prompt
const reply2 = await chat([{ role: 'user', content: 'Summarize this text.' }], {
  system: 'You are a concise summarizer.',
});
```

That's it.

---

#### How `chat`, `useChat`, and `<ChatWidget />` fit together

1. `` – stateless helper: expects the **entire message history** each call and returns the assistant’s next reply. Framework‑agnostic.
2. ``** hook** – **stateful wrapper**: internally collects every user/assistant turn and feeds the full array to `chat()`for you, so your component just reads`messages`, `input`, `send`.
3. `` – prebuilt UI that **uses the hook**, giving you a fully‑styled panel. No message‑array management required.

> **Key point:** Even though the OpenAI/LLM endpoint wants the whole conversation each time, the developer never has to juggle it—`useChat` and `ChatWidget` keep the running history under the hood.

Developers can therefore:

- **Drop in **`` for instant ChatGPT‑style UX.
- **Switch to **`` for custom layouts yet still avoid manual history bookkeeping.
- **Fall back to **``in non‑React contexts, managing a simple`messages`array themselves.  (We plan a future`createChatSession()` helper for vanilla JS to hide that too.)

This hierarchy preserves simplicity while keeping a clear migration path for more control whenever it’s needed. We can layer full `LLM` interface later without breaking changes by exporting a richer client alongside this helper.

### Simple Client‑side Chat UI (React/TypeScript)

#### Option A – **useChat hook** (current)

_Keeps UI responsibility in your app while hiding state logic._

```tsx
import { useChat } from '@yourorg/sdk/react';

export default function ChatApp() {
  const { messages, input, setInput, send } = useChat();
  return (
    <div>
      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.role === 'user' ? 'You' : 'AI'}:</b> {m.content}
        </div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
```

#### Option B – \*\* drop‑in\*\* (even simpler)

_Zero state management or UI wiring—ideal for prototypes._

```tsx
import { ChatWidget } from '@yourorg/sdk/react';

export default function App() {
  return <ChatWidget />; // done ✔️
}
```

`<ChatWidget />` renders a fully‑styled ChatGPT‑like panel, handles scrollback, streaming, loading spinners, etc. **Future‑proofing:** you can later pass props (theme, header, systemPrompt) without changing integration code.

| Simplicity Level | Pros                                | Cons                                    |
| ---------------- | ----------------------------------- | --------------------------------------- |
| **useChat hook** | Flexible layout; small API surface  | Small amount of glue code               |
| **ChatWidget**   | One‑liner integration; fastest demo | Less control until we expose more props |

Pick the level that matches your project’s needs. Both live in the same SDK so you can start with `<ChatWidget>` and migrate to `useChat` when customization is required.

### Error Handling

- Provide **clear, minimal error messages** for easy debugging:

```json
{
  "error": "RateLimitExceeded",
  "message": "You have exceeded the allowed number of requests. Try again in 30 seconds."
}
```

---

### Remaining Abuse Risks & Lightweight Next Steps

| Abuse scenario                                          | Why it’s still possible                                                 | Cost impact   | Lightweight guardrail to add next                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| **Legitimate user goes wild** (open tab spams requests) | IP limit counts requests, not tokens; one request could be 10k+ tokens. | High          | Enforce `maxTokens` per request (e.g., 2 000) **and** optional token‑per‑IP window. |
| **Distributed botnet** (many IPs)                       | Current limiter is per‑IP only.                                         | Very high     | Add a **global request/token budget** and circuit‑break when exceeded.              |
| **XSS on allowed origin**                               | Attacker can mint JWTs legitimately via injected JS.                    | Moderate–high | Later: CSRF token or captcha on `/api/token`; user auth.                            |
| **Huge prompts** (32 k tokens)                          | No prompt length check.                                                 | Extreme       | Validate prompt length server‑side.                                                 |
| **Streaming runaway**                                   | Future streaming could generate unlimited tokens.                       | Moderate      | Hard timeout / max output tokens.                                                   |
| **JWT replay within TTL**                               | Token can be reused until expiry.                                       | Low‑moderate  | Optional single‑use `jti` stored in Redis.                                          |
| **Token‑mint spam**                                     | Attacker rotates IPs to harvest JWTs.                                   | Low           | Tighten `/api/token` limit (e.g., 10 req/min/IP) & strict Origin+Referer match.     |
| **Developer script loop**                               | Internal bug loops API calls.                                           | High          | Add **monthly spend cap** env and halt when exceeded.                               |
| **Provider key leaked in logs**                         | If logs include headers/env.                                            | Catastrophic  | Ensure provider key never logged; rotate immediately if leaked.                     |

> These two cheapest controls close >80 % cost risk:
>
> 1. \`\`\*\* validator\*\*
> 2. **Global monthly spend cap (**\`\`**)**

### Open Source

### Open Source

- Fully open-source immediately, allowing community contributions and easy replication

This setup ensures the quickest route to demonstrating value with minimal complexity, clear security considerations, and an excellent foundation for incremental enhancements.
