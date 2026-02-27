import { createClient } from "@/lib/supabase/server";
import { AcademyStats } from "./AcademyStats";

async function getStats() {
    const supabase = await createClient();

    // Default values
    let studentsCount = 50000;
    let coursesCount = 2500;
    let specialtiesCount = 115;
    const satisfactionRate = 98;

    try {
        // Fetch Students (profiles count - REAL DATA)
        const { count: profilesCount, error: profilesError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (!profilesError && profilesCount !== null) {
            studentsCount = profilesCount;
        } else {
            studentsCount = 0; // Fallback only on error
        }

        // Fetch Specialties (doctors)
        // Note: Counting distinct values efficiently in Supabase/Postgres via API can be tricky without RPC.
        // We will count users with 'doctor' role or simply doctor_profiles
        const { count: doctorsCount, error: doctorsError } = await supabase
            .from('doctor_profiles')
            .select('*', { count: 'exact', head: true });

        if (!doctorsError && doctorsCount !== null) {
            // We use doctor count as proxy for specialties data if distinct query is too heavy
            specialtiesCount = doctorsCount;
        } else {
            specialtiesCount = 0;
        }

        // Fetch Courses
        // Checking 'courses' table
        const { count: dbCoursesCount, error: coursesError } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true });

        if (!coursesError && dbCoursesCount !== null) {
            coursesCount = dbCoursesCount;
        } else {
            coursesCount = 0;
        }

    } catch (error) {
        console.error("Error fetching stats:", error);
    }

    return {
        students: studentsCount,
        courses: coursesCount,
        specialties: specialtiesCount,
        satisfaction: satisfactionRate
    };
}

export async function AcademyStatsContainer() {
    const stats = await getStats();

    return <AcademyStats stats={stats} />;
}
