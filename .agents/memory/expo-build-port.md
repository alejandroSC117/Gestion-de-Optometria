---
name: Expo static build port
description: Environment-specific port behavior when exporting the mobile artifact.
---

The mobile artifact's static build helper assumes Metro is available on port 8081. If the mockup sandbox is running there, the helper may stop in non-interactive mode after asking whether it should switch ports.

**Why:** The development workflow can run on its assigned dynamic port while the static helper still probes its fixed Metro port.

**How to apply:** Treat a static build failure caused by port 8081 as an environment collision first; use the direct Expo export or temporarily free the conflicting preview port rather than changing application code.