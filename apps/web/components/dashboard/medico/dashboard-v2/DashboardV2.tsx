"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { StatsBentoGrid } from "./StatsBentoGrid";
import { ProfessionalMainPanel } from "./ProfessionalMainPanel";

interface DashboardV2Props {
    profile: any;
    userId?: string;
}

export function DashboardV2({ profile, userId }: DashboardV2Props) {
    return (
        <div className="space-y-8 pb-12">
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-8"
            >
                {/* Stats Section with Bento Grid */}
                <motion.div variants={fadeInUp}>
                    <StatsBentoGrid doctorId={userId} />
                </motion.div>

                {/* Main Content Area */}
                <motion.div variants={fadeInUp}>
                    <ProfessionalMainPanel profile={profile} userId={userId} />
                </motion.div>
            </motion.div>
        </div>
    );
}
