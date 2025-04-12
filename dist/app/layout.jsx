import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
export const metadata = {
    title: 'TaskFusion',
    description: 'Electron + Next.js + Shadcn App',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>);
}
