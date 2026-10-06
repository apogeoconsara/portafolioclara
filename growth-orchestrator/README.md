# Growth Orchestration System — Clara challenge

Status: **data layer complete** (this commit). The orchestrator (event → state → decision → AI/rules → action → audit),
the AI eval runner, the architecture diagram and the measurement plan come next and build on this data.

```
event → state → decision → AI/rules → action → audit
```

## Quick start (no dependencies, Python 3.11+)

```bash
python3 -m generator all --seed 42 --n 50000   # synthetic world + frozen seed files + validation  (~35 s)
python3 -m unittest discover -s tests -t .      # 18 tests on the data itself
```

See [`data/README.md`](data/README.md) for the data dictionary and design, [`data/POLICY.md`](data/POLICY.md) for the
decision policy the ground truth encodes, and [`data/reports/data_profile.md`](data/reports/data_profile.md) for the
measured distributions and coverage matrix.
