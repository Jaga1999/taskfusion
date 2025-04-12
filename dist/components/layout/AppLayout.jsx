'use client';
import Sidebar from "./Sidebar";
import Header from "./Header";
const AppLayout = ({ children }) => {
    return (<div className="flex h-screen w-screen">
      <Sidebar />
      <main className="flex flex-col flex-1">
        <Header />
        <div className="p-6 overflow-y-auto">{children}</div>
      </main>
    </div>);
};
export default AppLayout;
