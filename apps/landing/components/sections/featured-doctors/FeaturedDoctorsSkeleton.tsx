"use client";

export function FeaturedDoctorsSkeleton() {
    return (
        <section className="py-16 bg-muted/20 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-32 mb-2" />
                    <div className="h-8 bg-muted rounded w-64 mb-8" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 w-[300px] bg-muted rounded-xl flex-shrink-0" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
