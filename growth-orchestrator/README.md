# Growth Orchestration System — Clara challenge

Status: **data layer complete**. Everything (data, docs, prompts) is in English, because the case and the presentation are in English. The orchestrator (event → state → decision → AI/rules → action → audit),
the AI eval runner, the architecture diagram and the measurement plan come next and build on this data.

```
event → state → decision → AI/rules → action → audit
```

## Quick start (no dependencies, Python 3.11+)

```bash
python3 -m generator all --seed 42 --n 50000   # synthetic world + seed files + impact example + validation (~1.5 min)
python3 -m unittest discover -s tests -t .      # 66 tests: data, policy, AI contracts, experiment design, and one test per Scenario sentence
```

See [`data/README.md`](data/README.md) for the data dictionary and design, [`data/POLICY.md`](data/POLICY.md) for the
decision policy the ground truth encodes, and [`data/reports/data_profile.md`](data/reports/data_profile.md) for the
measured distributions and coverage matrix, and [`data/PDF_TRACEABILITY.md`](data/PDF_TRACEABILITY.md) for how each
requirement of the challenge PDF maps to data and tests. All data is synthetic.
