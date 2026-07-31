# ShopGuard Research Project Documentation

## Abstract

ShopGuard is a research prototype for studying consumer decision-making in live-commerce settings. It examines how promotional AI, guardian AI, situational pressure cues, and rational-consumption interventions influence user behavior. The project is inspired by the ACM CHI 2026 paper "BuyMate: Making AI Interventions Effective in Promoting Rational Consumption in Live Commerce", but it does not reproduce the paper's full experimental procedure, scales, or statistical models. Instead, it provides a runnable, loggable, and extensible research environment.

## 1. Research Background

Live commerce often uses countdowns, low-stock warnings, purchase comments, influencer endorsement, strikethrough prices, and limited-time discounts to create immediate purchase pressure. These cues may increase conversion, but they can also reduce the time available for need reflection, budget assessment, and alternative comparison.

AI introduces a dual role into this setting. Promotional AI may strengthen persuasion, while guardian AI may help users identify pressure cues and restore reflective judgment. ShopGuard focuses on how AI affects consumer decisions in live commerce and which interventions can support more deliberative choices.

## 2. Research Objectives

The project aims to:

1. Build a live-commerce-style experimental environment for consumer decision research.
2. Compare the behavioral effects of promotional AI and guardian AI.
3. Convert rational-consumption interventions into recordable research events.
4. Record pressure cues such as urgency, scarcity, social proof, and discount anchoring.
5. Explore calm mini games as non-AI interventions for impulsive decisions.
6. Support future experiments, questionnaires, interviews, and log analysis.

## 3. Theoretical Perspectives

ShopGuard can be understood through:

- Dual-process decision-making: promotional pressure may trigger fast and affective judgment, while guardian interventions encourage deliberation.
- Persuasion knowledge: recognizing sales intent may help users resist or reframe promotional messages.
- Self-regulation: cooling-off delay, budget calibration, and pre-checkout reflection may interrupt immediate reactions.
- Human-AI collaborative decision-making: guardian AI assists judgment through questions, comparison, and explanation rather than making decisions for users.

## 4. Research Questions

- RQ1: Do promotional AI and guardian AI affect carting, removal, consultation, and submission behavior differently?
- RQ2: When situational pressure is stronger, are users more likely to trigger guardian AI or rational-consumption interventions?
- RQ3: Which interventions are most likely to be used: need reflection, peer comparison, persuasion reframing, or cooling-off delay?
- RQ4: Are high-pressure sessions associated with longer dwell time, higher carting rates, or more AI conversations?
- RQ5: Can translating promotional language into neutral facts help users delay or recalibrate purchase decisions?
- RQ6: Can short puzzle games function as non-AI calm-down tasks that reduce immediate purchase tendency?

## 5. Conceptual Model

ShopGuard follows this simplified research model:

**Situational pressure cues -> AI interaction condition -> rational-consumption intervention -> user decision behavior**

Situational pressure includes urgency, scarcity, social proof, and discount anchoring. AI conditions include promotional AI, guardian AI, and future no-AI or neutral-AI conditions. Interventions include need reflection, peer comparison, persuasion reframing, cooling-off delay, pre-checkout checks, and calm mini games. Behavioral outcomes include browsing, search, AI consultation, carting, removal, delay, and submission.

## 6. Research Conditions

The current prototype supports:

- Promotional AI: simulates sales-oriented persuasion in live commerce.
- Guardian AI: supports need reflection, budget calibration, alternative comparison, and persuasion reframing.
- Pressure probes: record participant judgments of pressure cues in the current sample.
- Rational-consumption interventions: expose intervention strategies as clickable events.
- Calm mini games: use Dino Run, Klotski, and 15 Puzzle as short attention-switching tasks.
- Pre-checkout reflection: records whether users complete key checks before simulated submission.

## 7. Prototype as a Research Instrument

ShopGuard is not a real e-commerce system. Products are research samples, the wish list represents purchase intention, and orders represent simulated decision records. Researchers can analyze decision processes through behavior logs, AI conversations, pressure profiles, and submitted records.

Main research events include:

| Event | Research Meaning |
| --- | --- |
| Sample view | Exposure and interest |
| Add to wish list | Purchase tendency |
| Remove from wish list | Decision withdrawal |
| AI conversation | AI use and consultation |
| Intervention trigger | Acceptance of rational-consumption support |
| Pressure probe | Perceived situational pressure |
| Calm mini game | Non-AI intervention exposure |
| Submitted record | Final simulated decision |

## 8. Variables and Metrics

### Independent Variables

- AI condition: promotional AI, guardian AI, dual AI, or no AI.
- Pressure cue: urgency, scarcity, social proof, and discount anchoring.
- Intervention strategy: need reflection, peer comparison, persuasion reframing, cooling-off delay, and calm mini games.
- Intervention timing: during browsing, after dwell time, after carting, or before submission.

### Dependent Variables

- Carting rate, removal rate, and submission rate.
- AI use frequency and conversation length.
- Intervention trigger rate and mini-game completion rate.
- Time from browsing to carting, carting to submission, and intervention to submission.
- Session paths, such as "browse - promotional AI - cart - guardian AI - remove".

## 9. Analysis Directions

Researchers may conduct:

- Descriptive statistics: views, carting rate, submission rate, and intervention counts.
- Condition comparison: behavioral differences between promotional AI and guardian AI.
- Path analysis: user sequences across browsing, AI, intervention, carting, and submission.
- Pressure analysis: relationships between pressure level and carting, removal, or submission.
- Conversation analysis: manual coding of persuasion, reflection, resistance, and trust.
- Mixed-methods analysis: combining logs, questionnaires, interviews, and open-ended feedback.

## 10. Ethics and Boundaries

ShopGuard is a research prototype and should not be treated as a real consumer-advice system. Formal studies should:

- Inform participants that behavior, AI conversations, and simulated decisions are recorded.
- Explain that "orders" are not real purchases.
- Avoid using promotional AI to induce real payment.
- Avoid treating guardian AI output as professional advice.
- De-identify exported data.
- Include informed consent, withdrawal mechanisms, and ethics review.

## 11. Project Limitations

- The prototype does not include the full experimental procedure, scales, or statistical scripts from the original paper.
- The pressure score is heuristic and not a validated psychometric scale.
- Product samples and promotional cues require systematic design for specific studies.
- AI output depends on model, prompts, and parameters, so configurations should be recorded.
- Behavior logs capture observable actions but cannot fully explain user motivation.
- Random assignment, questionnaire management, anonymized export, and preregistered analysis tools are not built in yet.

## 12. Future Extensions

Future work may add:

- Randomized conditions with no AI, neutral AI, promotional AI, guardian AI, and dual AI.
- Questionnaires on impulse buying, budget pressure, AI trust, and anticipated regret.
- More rigorously controlled product samples and promotional materials.
- Data export, anonymization, and session-path visualization.
- Manual annotation of AI response quality.
- Comparative studies on intervention timing, mini-game type, and task duration.

## 13. Implementation Scope

The current repository provides:

| Location | Research Use |
| --- | --- |
| `view/src/App.vue` | Participant interface, AI interaction, interventions, pressure probes, and mini games |
| `worker/src/modules/shop/` | Product samples and sample insights |
| `worker/src/modules/cart/` | Wish list |
| `worker/src/modules/order/` | Simulated decision records |
| `worker/src/modules/ai/` | Promotional AI and guardian AI |
| `worker/src/modules/research/` | Behavior tracking and research summaries |
| `worker/src/modules/admin/` | Research dashboard |
| `worker/src/migrations/` | Data structure and sample data |

Technical implementation serves the research questions. Before formal data collection, researchers should document the project version, sample materials, AI prompts, experimental conditions, and analysis plan.
