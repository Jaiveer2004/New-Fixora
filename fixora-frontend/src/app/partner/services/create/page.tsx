"use client";

import { PartnerRoute } from "@/components/auth/PartnerRoutes";
import { CreateServiceForm } from "@/components/partner/CreateServiceForm";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function CreateServicePage() {
    return (
        <PartnerRoute>
            <DashboardLayout>
                <div className="container mx-auto py-8">
                    <h1 className="text-3xl font-bold mb-8 text-white">Create New Service</h1>
                    <div className="max-w-2xl mx-auto">
                        <CreateServiceForm />
                    </div>
                </div>
            </DashboardLayout>
        </PartnerRoute>
    );
}