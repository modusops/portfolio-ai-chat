import { redirect } from "next/navigation"

// The root page redirects straight to /chat.
// If you want a landing page instead, replace this with your own component.
export default function Home() {
  redirect("/chat")
}
