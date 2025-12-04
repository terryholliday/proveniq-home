'use client';

import { PageHeader } from '@/components/page-header';

export default function AdminPage() {
  return (
      <>
          <PageHeader
              title="Admin Dashboard"
              description="This is the central control panel for managing MyARK."
          />
          <div className="container py-8">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                      <h3 className="font-semibold">Total Users</h3>
                      <p className="text-2xl font-bold">10,000+</p>
                  </div>
                  <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                      <h3 className="font-semibold">Active Auctions</h3>
                      <p className="text-2xl font-bold">1,204</p>
                  </div>
                  <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                      <h3 className="font-semibold">Pending Verifications</h3>
                      <p className="text-2xl font-bold">5</p>
                  </div>
                   <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                      <h3 className="font-semibold">System Status</h3>
                      <p className="text-2xl font-bold text-green-500">Operational</p>
                  </div>
              </div>
          </div>
      </>
  );
}