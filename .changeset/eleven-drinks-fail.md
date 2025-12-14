---
"jspsych": patch
---

parameter types will properly be checked in case of type mismatch, along with `ParameterType.SELECT` params properly using the `option` field to check if it is a valid parameter. this will only warn the developer, but in v9 we plan to make it error. 
