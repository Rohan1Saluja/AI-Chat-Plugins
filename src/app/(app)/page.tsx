import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background-900 flex items-center justify-center p-0">
      <Sidebar />
      <ChatWindow />
    </main>
  );
}
