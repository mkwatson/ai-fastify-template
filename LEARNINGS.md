# Project Learnings & Retrospectives

This document tracks key learnings, insights, and improvements discovered during the development of the AI Fastify Template project. Each entry follows a structured format to capture context, learnings, and actions taken.

## Format
Each entry includes:
- **Context**: What we were working on
- **Learnings**: What we discovered or realized
- **Actions**: How we're addressing the learnings
- **Impact**: Expected improvement or benefit

---

## 2025-06-13 - Monorepo Bootstrap Foundation Issues

### Context
Working on MAR-10 (Bootstrap Monorepo) - the foundational step of setting up our TurboRepo + pnpm workspace structure for the AI Fastify Template project. This is a greenfield project focused on creating an AI-assisted development template for LLM-powered backend applications.

### Learnings

#### 1. Tool-Specific Configuration Assumptions
**Discovery**: The initial turbo.json configuration contained Next.js-specific outputs (`.next/**`) despite this being a backend-focused Fastify template.

**Root Cause**: Copy-paste or template-based setup without careful review of tool configurations for the specific use case.

**Lesson**: Always audit tool configurations to ensure they match the project's actual technology stack and requirements.

#### 2. Foundation Validation Gap
**Discovery**: After completing the bootstrap setup, we realized we hadn't validated that all components work together correctly before marking the ticket as complete.

**Root Cause**: Focusing on individual component setup without end-to-end validation of the integrated system.

**Lesson**: Include validation and testing steps as part of foundational setup tasks, not as afterthoughts.

#### 3. Documentation Debt from Day One
**Discovery**: The monorepo structure lacks proper documentation for both human developers and AI agents working with the codebase.

**Root Cause**: Prioritizing implementation over documentation in early stages.

**Lesson**: Documentation should be created alongside foundational setup, not deferred to later phases.

#### 4. Branch Creation from Stale Base
**Discovery**: During MAR-24 implementation, we initially created the feature branch from a stale main branch, requiring a force-push to correct.

**Root Cause**: Not following a consistent "latest main first" protocol before creating feature branches.

**Lesson**: Always ensure feature branches are created from the most recent main branch to avoid merge conflicts and ensure changes are applied to the correct base.

### Actions Taken

#### Immediate Fixes (New Priority Tickets)
- **MAR-24**: Fix turbo.json pipeline configuration for backend-focused monorepo (Urgent)
- **MAR-25**: Validate and test monorepo bootstrap setup (Urgent)  
- **MAR-26**: Create comprehensive monorepo documentation (High)

#### Process Improvements
1. **Configuration Review Protocol**: Always audit tool configurations against actual project requirements
2. **Foundation Validation**: Include end-to-end testing as part of foundational setup completion criteria
3. **Documentation-First Approach**: Create essential documentation alongside implementation, not after
4. **Latest Main Branch Protocol**: Always `git checkout main && git pull origin main` before creating feature branches

#### Work Order Adjustment
Pausing progression to MAR-11 (Core Fastify App) until foundation issues are resolved:
1. Fix turbo.json (MAR-24)
2. Validate complete setup (MAR-25)
3. Document the foundation (MAR-26)
4. Then proceed with original plan

### Expected Impact
- **Reliability**: Solid, tested foundation prevents downstream issues
- **Developer Experience**: Clear documentation improves onboarding and AI agent effectiveness
- **Quality**: Configuration review protocol prevents similar issues in future components
- **Velocity**: Short-term slowdown for long-term acceleration through better foundation

### Retrospective Notes
This learning reinforces the importance of "measure twice, cut once" in software architecture. The time invested in fixing the foundation now will pay dividends throughout the project lifecycle. It also highlights the value of regular retrospectives even in early project phases.

---

*Next entry will be added after completing the foundation fixes and reflecting on those learnings.* 