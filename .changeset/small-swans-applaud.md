---
"@jspsych/config": patch
---

Fixes gulp build process that was attempting to use glob v10 by adding glob v7 as explicit dependency. glob v9+ changed the API and would require some rewrites and testing before implementing
