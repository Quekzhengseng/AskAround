"use server";

const apiUrl = "http://localhost:5005"; // Flask backend URL

async function loginAuthRequest(data: FormData, type: "login" | "signup") {
  const response = await fetch(`${apiUrl}/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.get("email"),
      password: data.get("password"),
    }),
  });

  const result = await response.json();
  if (response.ok) {
    return {
      success: true,
      token: result.token,
    };
  } else {
    return {
      success: false,
      message: result.error || "Something went wrong.",
    };
  }
}

async function signupAuthRequest(data: FormData, type: "login" | "signup") {
  const response = await fetch(`${apiUrl}/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.get("email"),
      password: data.get("password"),
      username: data.get("username"),
    }),
  });

  const result = await response.json();
  if (response.ok) {
    return {
      success: true,
      token: result.token,
    };
  } else {
    return {
      success: false,
      message: result.error || "Something went wrong.",
    };
  }
}

export async function login(formData: FormData) {
  return await loginAuthRequest(formData, "login");
}

export async function signup(formData: FormData) {
  return await signupAuthRequest(formData, "signup");
}
