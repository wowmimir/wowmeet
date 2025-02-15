// components/HomeLayout.tsx
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";  // Import your custom Sidebar component
import React, { ReactNode } from "react";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative">
      <Navbar />
      <div className="flex">
        <Sidebar /> {/* Use your custom Sidebar */}
        <section className="flex-1 min-h-screen px-6 pb-6 pt-28 sm:px-14">
          <div className="w-full">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
