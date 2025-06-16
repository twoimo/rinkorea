import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';
import './globals.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className="scroll-smooth">
                <div className="scroll-container">
                    <div className="scroll-content">
                        {children}
                    </div>
                </div>
                <StagewiseToolbar
                    config={{
                        plugins: [ReactPlugin],
                    }}
                />
            </body>
        </html>
    );
} 