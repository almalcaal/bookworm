# Issues:

### image file being "too large".

- I decided to increase the limit in express.json() to 100mb

### profile not displaying profileImage

- occurred because of a mismatch in naming in my backend and frontend

### app crashes when logging out

```
  if (!user) return null;
```
