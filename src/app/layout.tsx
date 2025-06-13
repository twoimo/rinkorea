import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
                <StagewiseToolbar
                    config={{
                        plugins: [ReactPlugin],
                    }}
                />
            </body>
        </html>
    );
} 