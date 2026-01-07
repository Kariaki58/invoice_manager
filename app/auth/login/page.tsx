import LoginPage from "./LoginHelper";
import {Suspense} from "react";

export default function LoginPageDisplay() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </div>
  )
}