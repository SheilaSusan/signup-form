/* ---------- 1. Grab elements ---------- */
const form = document.getElementById("signup-form");
const submitBtn = document.getElementById("submit-btn");
const successMsg = document.getElementById("success-message");
const strengthBox = document.querySelector(".strength");
const strengthLabel = document.getElementById("strength-label");

const $ = (id) => document.getElementById(id);

/* ---------- 2. Strength helper ---------- */
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.max(score, 1); // any typed password shows at least 1 bar
}

/* ---------- 3. Rules: each returns "" if valid, else an error message ---------- */
const rules = {
  name: (v) => {
    v = v.trim();
    if (!v) return "Please enter your name.";
    if (v.length < 2) return "Name is too short.";
    if (!/^[\p{L}][\p{L}\s'-]*$/u.test(v)) return "Use letters, spaces, hyphens or apostrophes only.";
    return "";
  },
  email: (v) => {
    v = v.trim();
    if (!v) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, e.g. name@example.com.";
    return "";
  },
  phone: (v) => {
    v = v.trim();
    if (!v) return "Please enter your mobile number.";
    // +230, then 5, then 7 more digits; spaces optional
    if (!/^\+230\s?5\d{3}\s?\d{4}$/.test(v)) return "Use the format +230 5XXX XXXX.";
    return "";
  },
  password: (v) => {
    if (!v) return "Please create a password.";
    if (v.length < 8) return "Use at least 8 characters.";
    if (getStrength(v) < 2) return "Add uppercase letters, numbers or symbols.";
    return "";
  },
  confirm: (v) => {
    if (!v) return "Please confirm your password.";
    if (v !== $("password").value) return "Passwords don't match.";
    return "";
  },
};

const fieldNames = Object.keys(rules);
const touched = new Set(); // fields the user has already left

/* ---------- 4. Show / clear one field's error ---------- */
function showFieldState(name) {
  const input = $(name);
  const message = rules[name](input.value);
  $(`${name}-error`).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.classList.toggle("valid", !message);
}

/* ---------- 5. Strength meter ---------- */
function updateStrength() {
  const level = getStrength($("password").value);
  strengthBox.dataset.level = level;
  strengthLabel.textContent = ["", "Weak", "Fair", "Good", "Strong"][level];
}

/* ---------- 6. Submit button: silent check, shows no errors ---------- */
function updateSubmitState() {
  const allValid = fieldNames.every((name) => rules[name]($(name).value) === "");
  submitBtn.disabled = !allValid;
}

/* ---------- 7. Events ---------- */
fieldNames.forEach((name) => {
  const input = $(name);

  // Errors appear when the user LEAVES the field
  input.addEventListener("blur", () => {
    touched.add(name);
    showFieldState(name);
  });

  // After that, update live so errors clear as soon as they're fixed
  input.addEventListener("input", () => {
    if (touched.has(name)) showFieldState(name);
    if (name === "password") {
      updateStrength();
      // password changed, so re-check confirm if the user has already visited it
      if (touched.has("confirm")) showFieldState("confirm");
    }
    updateSubmitState();
    successMsg.hidden = true;
  });
});

/* ---------- 8. Submit ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the page reloading

  // Safety net: if anything is invalid, show every error and stop
  const firstInvalid = fieldNames.find((name) => rules[name]($(name).value) !== "");
  if (firstInvalid) {
    fieldNames.forEach((name) => { touched.add(name); showFieldState(name); });
    $(firstInvalid).focus();
    return;
  }

  const firstName = $("name").value.trim().split(" ")[0];
  form.reset();
  touched.clear();
  fieldNames.forEach((name) => {
    $(`${name}-error`).textContent = "";
    $(name).classList.remove("valid", "invalid");
  });
  updateStrength();
  updateSubmitState();

  successMsg.textContent = `Welcome, ${firstName}! Your account is ready.`;
  successMsg.hidden = false;
});