## **1\. Why a Developer Cares (30-second elevator pitch)**

*“Drop a single React component or a one-liner `chat()` call into your front-end and get a secure, rate-limited, ChatGPT-style experience without storing your API key in the browser.”*

* **One-line install:** `pnpm add @airbolt/sdk`  
* **Zero config for local dev:** only `OPENAI_API_KEY` required  
* **Built-in safety:** IP throttling, short-lived JWTs, origin checks  
* **Deploy in one click:** Railway badge \+ sensible defaults

---

## **2\. Quick-Start Paths**

| Path | Copy-paste snippet | Typical use-case |
| ----- | ----- | ----- |
| **Drop-in UI** | `<ChatWidget />` | Product demos, hack-day prototypes |
| **React Hook** | `const { messages, send } = useChat()` | Custom chat UIs inside existing apps |
| **Vanilla JS helper** |  | non-React front-ends |

**Pick a path, keep shipping.** You can start with `<ChatWidget />`, then graduate to `useChat`, or drop down to the raw `chat()` helper—*without* changing back-end config.

---

## **3\. Core SDK APIs**

### **3.1 `Vanilla JS`**

|   ``import { createChatSession } from <somewhere>;   const chat = createChatSession(<server base url>);        // 👈 one line   const log = document.getElementById('log');   document.getElementById('send').onclick = async () => {     const text = document.getElementById('prompt').value;     const reply = await chat.send(text);     log.textContent += `You: ${text}\nAI: ${reply}\n\n`;   };``  |
| :---- |

Keep an internal `pending` flag; if a call is in-flight, buffer new user messages and send after the promise resolves.

### **3.2 React hook**

*Gives you full state management so you can render chat however you like.*

### **3.3 `<ChatWidget />`**

\<ChatWidget baseURL="https://my-airbolt.up.railway.app" /\>

*Renders an opinionated, ChatGPT-like panel with streaming, typing indicators, and dark-mode.*

---

## **4\. Server Config Environment Variables**

### **Environment Variables (Server‑side)**

| Variable | Required | Default (MVP) | Purpose |
| :---- | :---- | :---- | :---- |
| `OPENAI_API_KEY` | ✅ | — | Secret key for OpenAI. |
| `JWT_SECRET` | ⬜ | *auto‑generate at startup if unset* | Signs/validates JWTs. **Set explicitly in prod for stable tokens & multi‑instance deploys.** |
| `ALLOWED_ORIGIN` | ✅ | `http://localhost:5173` | Front‑end domain allowed to hit token/chat routes. accept a **comma-separated list** |
| `SYSTEM_PROMPT` | ⬜ | *(empty string)* | Global system prompt injected server‑side when client omits one. |
| `RATE_LIMIT_MAX` | ⬜ | `60` | Requests per IP in `RATE_LIMIT_WINDOW`. |
| `RATE_LIMIT_TIME_WINDOW` | ⬜ | `100000` | expressed in milliseconds. |

**Sane defaults** let a dev run `pnpm dev` locally with only two secrets:

export OPENAI\_API\_KEY="sk‑..."  
export JWT\_SECRET="$(openssl rand \-hex 32)"

Everything else works out‑of‑the‑box.

---

## **6\. Pricing / Cost Control (MVP)**

* **Built-in Guards:** per-IP throttle, monthly spend ceiling define in API provider.

---

## **Appendix A – How It Works Under the Hood (Implementation Details)**

1. **Fastify Proxy**  
   * hides `OPENAI_API_KEY`, adds IP rate-limit plugin, checks `Origin`.  
2. **JWT Auth**  
   * 15-minute tokens via `jsonwebtoken`; secret auto-generated in dev or injected in prod.  
3. **Env Vars**  
4. **Deployment**  
   * **Railway**

