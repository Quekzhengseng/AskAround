"use client";
import { login, signup } from "../utils/AuthAPI";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const result = isLogin ? await login(formData) : await signup(formData);

    if (result.success) {
      console.log(result);
      localStorage.setItem("token", result.token);
      localStorage.setItem("token1", result.token1);
      localStorage.setItem("refresh_token", result.refresh_token);

      router.push("/");
    } else {
      console.error(result.message);
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-3 mb-4">
              <span className="text-indigo-600 text-2xl">●</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">AskAround</h1>
            <p className="text-gray-600">
              Share your thoughts, shape our future
            </p>
          </div>

          <div className="flex border-b border-gray-200 mb-6 mx-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-medium text-sm ${
                isLogin
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-medium text-sm ${
                !isLogin
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="px-8 pb-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="yourname123"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {isLogin && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {isLogin ? "Sign in to account" : "Create account"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "New to AskAround? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            {isLogin ? "Create an account" : "Sign in now"}
          </button>
        </p>
      </div>
    </div>
  );
}
