# Employee Management System — New Features

This adds 5 things to your existing MERN Employee Management System, following
the same routes → controllers → services → models structure and the
`{ success, data, message }` response shape from your KT documentation:

1. Forgot Password module
2. Search
3. Filter (department, designation)
4. Date filter (joining date range)
5. Input validation (email format, numeric fields) — both backend (Joi) and frontend

## Folder structure of this package

```
ems/
├── server/src/
│   ├── config/db.js
│   ├── models/User.js, Employee.js
│   ├── validators/auth.validator.js, employee.validator.js   ← Joi rules
│   ├── middleware/validate.middleware.js, auth.middleware.js, error.middleware.js
│   ├── services/auth.service.js, employee.service.js         ← business logic
│   ├── controllers/auth.controller.js, employee.controller.js
│   ├── routes/auth.routes.js, employee.routes.js
│   ├── utils/apiResponse.js, apiError.js, sendEmail.js
│   ├── app.js
│   └── server.js
└── client/src/
    ├── api/axiosClient.js
    ├── hooks/useDebounce.js
    ├── utils/validators.js
    └── features/
        ├── auth/ForgotPassword.jsx, ResetPassword.jsx
        └── employees/EmployeeList.jsx (search+filter+date filter), EmployeeForm.jsx (validation)
```

## Step 1 — Merge into your existing project

Copy each file into the matching folder in your real repo. File names match
your KT doc's convention, so:
- If your project already has `models/Employee.js`, **add the missing fields**
  from this one instead of overwriting your file.
- If you already have `employee.routes.js` / `employee.controller.js` /
  `employee.service.js`, **add the new functions/routes** shown here rather
  than replacing the whole file.
- `auth.routes.js`, `auth.controller.js`, `auth.service.js`, and
  `validators/auth.validator.js` need the new **forgot-password / reset-password**
  pieces added alongside your existing register/login code.
- `User.js` needs the `resetPasswordToken`, `resetPasswordExpires` fields and
  the `generatePasswordResetToken` method added.

## Step 2 — Install the new backend package

```bash
cd server
npm install nodemailer
```

(`joi`, `bcryptjs`, `jsonwebtoken` etc. you likely already have — check
`server/package.json` in this package against yours and install anything missing.)

## Step 3 — Set environment variables

Copy the new variables from `server/.env.example` into your real `server/.env`:

```
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

**For Gmail:** you can't use your normal Gmail password. Go to your Google
Account → Security → 2-Step Verification → App Passwords, generate one, and
use that as `SMTP_PASS`. For testing without a real inbox, you can use
[Mailtrap](https://mailtrap.io) (free sandbox SMTP) instead.

## Step 4 — Wire up the new routes

In `server/src/app.js`, make sure these two lines exist:

```js
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
```

New endpoints you now have:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/forgot-password | Send reset link to email |
| POST | /api/auth/reset-password/:token | Set new password |
| GET | /api/employees?search=&department=&designation=&joiningDateFrom=&joiningDateTo=&page=&limit= | Search + filter + date filter + pagination |

## Step 5 — Frontend routing

In your `client/src/routes/AppRoutes.jsx`, add:

```jsx
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';

<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

On your Login page, add a link: `<Link to="/forgot-password">Forgot Password?</Link>`

## Step 6 — Install frontend dependency (if not already present)

```bash
cd client
npm install react-router-dom axios
```

## Step 7 — Drop in the Employee List + Form

Replace/merge your existing employee list page with
`features/employees/EmployeeList.jsx` — it already has the search box,
department/designation dropdowns, and joining-date range filter wired to
the backend. Wire `features/employees/EmployeeForm.jsx` into your
Add/Edit Employee page — it validates email format and numeric fields
(phone, salary) both while typing and on submit.

## Step 8 — Test it

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

1. Go to `/forgot-password`, enter a registered email → check inbox for the reset link.
2. Click the link → set a new password → log in with it.
3. On the employee list, type in the search box → results filter after you
   stop typing (debounced).
4. Pick a department/designation from the dropdowns → list updates.
5. Pick a joining-date "from" and "to" → list updates to that range.
6. Try adding an employee with a bad email (e.g. `abc`) or letters in the
   phone/salary field → you should see inline errors and the request should
   not go through until fixed.

## Notes

- Validation runs in **two places** on purpose: the frontend (`utils/validators.js`)
  gives instant feedback without a network call; the backend (`validators/*.js`
  with Joi) is the real security boundary — never trust client-side validation alone.
- The reset token is stored **hashed** in MongoDB and expires in 15 minutes,
  so even if your database were ever exposed, the raw token in the email
  link can't be reconstructed from it.
- Search uses a case-insensitive regex across name/ID/email/department/designation.
  For a larger dataset later, MongoDB's `$text` index (already added on the
  `Employee` model) would be faster — this can be swapped in without changing
  the API contract.
